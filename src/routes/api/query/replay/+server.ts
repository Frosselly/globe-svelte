/**
 * POST /api/query/replay  { indicator, countriesIso3, start, end }
 *
 * Used when the user clicks "Show ↓" on a saved view or "Replay ↓" on a
 * chat history item.  Skips the AI entirely — the indicator code is already
 * known and validated — so the response is much faster.
 */

import { json, type RequestHandler } from '@sveltejs/kit';

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
		if (!obs || obs.length === 0) return null;

		const s = obs[0];
		const byYear: Record<string, number | null> = {};
		for (const o of obs) byYear[String(o.date)] = o.value ?? null;

		const series: SeriesPoint[] = [];
		for (let y = start; y <= end; y++) {
			const k = String(y);
			series.push({ date: k, value: byYear[k] ?? null });
		}

		return { country: s?.country?.value ?? iso3, code: s?.country?.id ?? iso3, series };
	} catch {
		return null;
	}
}

export const POST: RequestHandler = async (event) => {
	const body = await event.request.json().catch(() => null);
	const { indicator, countriesIso3, start, end } = body ?? {};

	if (!indicator || !Array.isArray(countriesIso3) || !countriesIso3.length) {
		return json({ error: 'indicator and countriesIso3 required' }, { status: 400 });
	}

	const yr = new Date().getFullYear();
	const rows = await Promise.all(
		(countriesIso3 as string[]).map((iso3) =>
			fetchCountry(iso3, indicator, start ?? yr - 20, end ?? yr)
		)
	);
	const series = rows.filter((r): r is SeriesRow => r !== null);

	if (!series.length)
		return json(
			{ error: 'No data found for this indicator / country combination.' },
			{ status: 404 }
		);
	return json({ series });
};
