/**
 * POST /api/query  { prompt: string }
 *
 * Response shapes:
 *
 *   Success   → { indicator, indicatorCode, chart, countries, start, end, series, messageId? }
 *
 *   Disambig  → { disambiguation: true, concept, candidates: [{id,name,source}…],
 *                 countries, start, end, chart }
 *               Front-end renders a picker; user picks one → POST /api/query/fetch
 *
 *   Error     → { error: string }   (status 4xx)
 *
 * Flow:
 *  1. AI parses prompt → indicator code + metadata
 *  2. Probe that code (fast 1-row WB call)
 *  3a. Valid → fetch all countries in parallel → return data
 *  3b. Invalid → search registry → collect top-N matches → probe each
 *       • If exactly 1 survives probing → use it automatically (no friction)
 *       • If 2-8 survive → return disambiguation list for user to pick
 *       • If 0 survive   → return 404 with explanation
 */

import { json, type RequestHandler } from '@sveltejs/kit';
import { chatMessages } from '$lib/server/db/schema/saved';
import { getUserFromEvent } from '$lib/server/user';
import { env } from '$env/dynamic/private';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText, Output } from 'ai';
import { z } from 'zod';
import { db } from '$lib/server/db/client';
import { getIndicators, type Indicator } from '$lib/server/worldbank/indicators';

// -- AI schema -----------------

const QuerySchema = z.object({
	indicator: z.string(),
	indicatorName: z.string(),
	countriesIso3: z.array(z.string()),
	start: z.number(),
	end: z.number(),
	chart: z.enum(['line', 'bar', 'map'])
});
type ParsedQuery = z.infer<typeof QuerySchema>;

// -- Types ---------------------

type SeriesPoint = { date: string; value: number | null };
type SeriesRow = { country: string; code: string; series: SeriesPoint[] };

export type Candidate = {
	id: string;
	name: string;
	source: string;
};

// -- World Bank helpers --------

/**
 * Probe one indicator for one country.
 * Returns false when WB replies with:
 *   [{"message":[{"id":"175","key":"Invalid format"…}]}]
 * or when the observation array is empty.
 */
async function probeIndicator(indicator: string, iso3: string): Promise<boolean> {
	try {
		const url =
			`https://api.worldbank.org/v2/country/${iso3}/indicator/${indicator}` +
			`?format=json&per_page=1&mrv=5`;
		const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
		if (!res.ok) return false;
		const body = (await res.json()) as unknown;
		if (!Array.isArray(body)) return false;
		const payload = body[1];
		return Array.isArray(payload) && payload.length > 0;
	} catch {
		return false;
	}
}

/** Fetch one country's full series. Returns null on WB error or empty data. */
async function fetchCountry(
	iso3: string,
	indicator: string,
	start: number,
	end: number
): Promise<SeriesRow | null> {
	const url =
		`https://api.worldbank.org/v2/country/${iso3}/indicator/${indicator}` +
		`?format=json&per_page=500&date=${start}:${end}`;
	try {
		const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
		const body = (await res.json()) as unknown;
		if (!Array.isArray(body)) return null;
		const meta = body[0] as any;
		if (meta?.message) return null;
		const obs = body[1] as any[] | null;
		if (!obs?.length) return null;

		const s = obs[0];
		const byYr: Record<string, number | null> = {};
		for (const o of obs) byYr[String(o.date)] = o.value ?? null;

		const series: SeriesPoint[] = [];
		for (let y = start; y <= end; y++) {
			const k = String(y);
			series.push({ date: k, value: byYr[k] ?? null });
		}
		return { country: s?.country?.value ?? iso3, code: s?.country?.id ?? iso3, series };
	} catch {
		return null;
	}
}

async function fetchAll(
	iso3List: string[],
	indicator: string,
	start: number,
	end: number
): Promise<SeriesRow[]> {
	const rows = await Promise.all(iso3List.map((iso3) => fetchCountry(iso3, indicator, start, end)));
	return rows.filter((r): r is SeriesRow => r !== null);
}

/** Remove years where every country has null. */
function trimNullYears(series: SeriesRow[], start: number, end: number): SeriesRow[] {
	const allYears = Array.from({ length: end - start + 1 }, (_, i) => String(start + i));
	const liveYears = new Set(
		allYears.filter((yr) => series.some((s) => s.series.find((p) => p.date === yr)?.value !== null))
	);
	return series.map((row) => ({ ...row, series: row.series.filter((p) => liveYears.has(p.date)) }));
}

// -- Registry search -----------

/**
 * Score every indicator in the registry by word overlap with `concept`.
 * Returns up to `limit` results sorted by descending score, only including
 * indicators that score above `minScore`.
 */
function searchRegistry(
	indicators: Indicator[],
	concept: string,
	limit = 8,
	minScore = 1
): Indicator[] {
	const words = concept
		.toLowerCase()
		.split(/\W+/)
		.filter((w) => w.length > 2);
	if (!words.length) return [];

	const scored: { ind: Indicator; score: number }[] = [];
	for (const ind of indicators) {
		const hay = ind.name.toLowerCase();
		const score = words.reduce((n, w) => n + (hay.includes(w) ? 1 : 0), 0);
		if (score >= minScore) scored.push({ ind, score });
	}

	return scored
		.sort((a, b) => b.score - a.score)
		.slice(0, limit)
		.map((x) => x.ind);
}

// -- AI parsing ----------------

async function parseWithAI(prompt: string): Promise<ParsedQuery | null> {
	const gateway = createGoogleGenerativeAI({ apiKey: env.GOOGLE_GENERATIVE_AI_API_KEY });
	try {
		const yr = new Date().getFullYear();
		const { output } = await generateText({
			model: gateway('gemini-3-flash-preview'),
			output: Output.object({ schema: QuerySchema }),
			prompt: `
You are a World Bank data query parser. Return ONLY valid JSON — no prose, no markdown.

COMMON INDICATOR CODES (use these exact strings when they match):
  CO₂ / carbon / greenhouse total emissions → EN.ATM.CO2E.KT
  CO₂ per capita                            → EN.ATM.CO2E.PC
  Methane emissions (kt CO2 eq)             → EN.ATM.METH.KT.CE
  N₂O emissions (kt CO2 eq)                → EN.ATM.NOXE.KT.CE
  Population, total                         → SP.POP.TOTL
  Population growth (annual %)              → SP.POP.GROW
  GDP (current US$)                         → NY.GDP.MKTP.CD
  GDP per capita (current US$)              → NY.GDP.PCAP.CD
  GDP growth (annual %)                     → NY.GDP.MKTP.KD.ZG
  Unemployment (% of labour force)          → SL.UEM.TOTL.ZS
  Inflation, consumer prices (annual %)     → FP.CPI.TOTL.ZG
  Life expectancy at birth                  → SP.DYN.LE00.IN
  Infant mortality rate                     → SP.DYN.IMRT.IN
  Forest area (% of land area)              → AG.LND.FRST.ZS
  Renewable electricity (% of total)        → EG.ELC.RNEW.ZS
  Access to electricity (%)                 → EG.ELC.ACCS.ZS
  Electric power consumption (kWh/capita)   → EG.USE.ELEC.KH.PC
  Military expenditure (% of GDP)           → MS.MIL.XPND.GD.ZS
  Internet users (% of population)          → IT.NET.USER.ZS
  Trade (% of GDP)                          → NE.TRD.GNFS.ZS
  Urban population (% of total)             → SP.URB.TOTL.IN.ZS
  Gini index                                → SI.POV.GINI

COUNTRY CODES (ISO-3):
  France→FRA  Germany→DEU  UK→GBR  USA→USA  China→CHN  India→IND
  Japan→JPN   Brazil→BRA   Russia→RUS  Italy→ITA  Spain→ESP  Poland→POL
  EU (use these): FRA,DEU,ITA,ESP,POL,NLD,BEL,SWE
  World/global: WLD

start/end: year integers, default ${yr - 20}–${yr} if not specified.
chart: "line" for time trends, "bar" for country comparisons, "map" for world overview.

User: ${prompt}`.trim()
		});
		return output ?? null;
	} catch (err) {
		console.error('AI parse error:', err);
		return null;
	}
}

// -- Handler -------------------

export const POST: RequestHandler = async (event) => {
	const body = await event.request.json().catch(() => null);
	const prompt = (body?.prompt as string | undefined)?.trim();
	if (!prompt) return json({ error: 'prompt required' }, { status: 400 });

	const user = await getUserFromEvent(event);

	// -- 1. AI parse -----------
	const parsed = await parseWithAI(prompt);
	if (!parsed) {
		return json(
			{
				error: 'Could not parse your request. Try: "CO₂ emissions France vs Germany 2000–2020"'
			},
			{ status: 422 }
		);
	}

	const probeISO = parsed.countriesIso3[0] ?? 'WLD';

	// -- 2. Probe the AI-supplied code ----------------
	const aiCodeValid = await probeIndicator(parsed.indicator, probeISO);

	if (aiCodeValid) {
		// Fast path — AI nailed it
		return await fetchAndRespond({
			prompt,
			user,
			parsed,
			validCode: parsed.indicator,
			validName: parsed.indicatorName
		});
	}

	// -- 3. AI code was wrong — search registry -------
	console.warn(`[query] "${parsed.indicator}" invalid — searching registry`);

	const indicators = await getIndicators();
	// Search with both the AI's name and key nouns from the raw prompt
	const conceptWords = `${parsed.indicatorName} ${prompt}`;
	const candidates = searchRegistry(indicators, conceptWords, 12, 1);

	if (!candidates.length) {
		return json(
			{
				error: `No World Bank indicator found for "${parsed.indicatorName}". Try a different phrase.`
			},
			{ status: 404 }
		);
	}

	// Probe all candidates in parallel — only keep ones that actually have data
	const probeResults = await Promise.all(
		candidates.map(async (c) => ({
			candidate: c,
			valid: await probeIndicator(c.id, probeISO)
		}))
	);
	const validCandidates = probeResults.filter((r) => r.valid).map((r) => r.candidate);

	if (!validCandidates.length) {
		return json(
			{
				error:
					`Found related indicators but none have data for "${probeISO}". ` +
					`Try different countries or a broader year range.`
			},
			{ status: 404 }
		);
	}

	// -- 3a. Exactly one valid candidate → use it silently --------------------
	if (validCandidates.length === 1) {
		const c = validCandidates[0]!;
		// console.log(`[query]  → auto-resolved to "${c.id}" (${c.name})`);
		return await fetchAndRespond({
			prompt,
			user,
			parsed,
			validCode: c.id,
			validName: c.name
		});
	}

	// -- 3b. Multiple valid candidates → ask the user to pick -----------------
	// Persist a pending chat message so "replay" can link back to it later
	let messageId: string | undefined;
	if (user) {
		const [row] = await db
			.insert(chatMessages)
			.values({
				userId: user.id,
				userMessage: prompt,
				botReply: null, // filled in after the user picks
				parsedQuery: null // filled in after the user picks
			})
			.returning({ id: chatMessages.id });
		messageId = row?.id;
	}

	return json({
		disambiguation: true,
		concept: parsed.indicatorName,
		candidates: validCandidates.map((c) => ({
			id: c.id,
			name: c.name,
			source: c.source ?? ''
		})) as Candidate[],
		countries: parsed.countriesIso3,
		start: parsed.start,
		end: parsed.end,
		chart: parsed.chart,
		messageId
	});
};

// -- Shared fetch + respond helper --------------------

async function fetchAndRespond({
	prompt, // ← was: event
	user,
	parsed,
	validCode,
	validName
}: {
	prompt: string; // ← was: event: Parameters<RequestHandler>[0]
	user: Awaited<ReturnType<typeof getUserFromEvent>>;
	parsed: ParsedQuery;
	validCode: string;
	validName: string;
}) {
	const series = await fetchAll(parsed.countriesIso3, validCode, parsed.start, parsed.end);

	if (!series.length) {
		return json(
			{
				error: `"${validName}" returned no data for the selected countries / range.`
			},
			{ status: 404 }
		);
	}

	const trimmed = trimNullYears(series, parsed.start, parsed.end);

	let messageId: string | undefined;
	if (user) {
		const [row] = await db
			.insert(chatMessages)
			.values({
				userId: user.id,
				userMessage: prompt,
				botReply: `Showing ${validName} for ${trimmed.map((s) => s.country).join(', ')}`,
				parsedQuery: {
					indicator: validCode,
					indicatorName: validName,
					countriesIso3: parsed.countriesIso3,
					start: parsed.start,
					end: parsed.end,
					chart: parsed.chart
				}
			})
			.returning({ id: chatMessages.id });
		messageId = row?.id;
	}

	return json({
		indicator: validName,
		indicatorCode: validCode,
		chart: parsed.chart,
		countries: parsed.countriesIso3,
		start: parsed.start,
		end: parsed.end,
		series: trimmed,
		messageId
	});
}
