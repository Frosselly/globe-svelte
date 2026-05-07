/**
 * src/routes/api/query/fetch/+server.ts
 *
 * POST /api/query/fetch
 * { indicator, indicatorName, countriesIso3, start, end, chart, messageId? }
 *
 * Called when the user selects a specific indicator from the disambiguation
 * picker.  Skips the AI entirely — just fetches data and optionally updates
 * the pending chat_messages row that was created during disambiguation.
 */

import { json, type RequestHandler } from '@sveltejs/kit';
import { chatMessages } from '$lib/server/db/schema/saved';
import { getUserFromEvent } from '$lib/server/user';
import { eq, and } from 'drizzle-orm';
import { db } from '$lib/server/db/client';

type SeriesPoint = { date: string; value: number | null };
type SeriesRow = { country: string; code: string; series: SeriesPoint[] };

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

export const POST: RequestHandler = async (event) => {
	const body = await event.request.json().catch(() => null);
	const {
		indicator,
		indicatorName,
		countriesIso3,
		start,
		end,
		chart,
		messageId // optional — links back to the pending chat_messages row
	} = body ?? {};

	if (!indicator || !Array.isArray(countriesIso3) || !countriesIso3.length) {
		return json({ error: 'indicator and countriesIso3 required' }, { status: 400 });
	}

	// Fetch all countries in parallel
	const rows = await Promise.all(
		(countriesIso3 as string[]).map((iso3) =>
			fetchCountry(iso3, indicator, start ?? 2000, end ?? new Date().getFullYear())
		)
	);
	const series = rows.filter((r): r is SeriesRow => r !== null);

	if (!series.length) {
		return json(
			{
				error: `"${indicatorName ?? indicator}" returned no data for the selected countries / range.`
			},
			{ status: 404 }
		);
	}

	// Strip fully-null years
	const allYears = Array.from({ length: (end ?? 2024) - (start ?? 2000) + 1 }, (_, i) =>
		String((start ?? 2000) + i)
	);
	const liveYears = new Set(
		allYears.filter((yr) => series.some((s) => s.series.find((p) => p.date === yr)?.value !== null))
	);
	const trimmed = series.map((row) => ({
		...row,
		series: row.series.filter((p) => liveYears.has(p.date))
	}));

	// Update the pending chat_messages row if the user is logged in and a messageId was passed
	const user = await getUserFromEvent(event);
	if (user && messageId) {
		await db
			.update(chatMessages)
			.set({
				botReply: `Showing ${indicatorName ?? indicator} for ${trimmed.map((s) => s.country).join(', ')}`,
				parsedQuery: {
					indicator,
					indicatorName: indicatorName ?? indicator,
					countriesIso3,
					start: start ?? 2000,
					end: end ?? new Date().getFullYear(),
					chart: chart ?? 'line'
				}
			})
			.where(and(eq(chatMessages.id, messageId), eq(chatMessages.userId, user.id)));
	}

	return json({
		indicator: indicatorName ?? indicator,
		indicatorCode: indicator,
		chart: chart ?? 'line',
		countries: countriesIso3,
		start,
		end,
		series: trimmed,
		messageId
	});
};
