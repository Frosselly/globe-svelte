import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db/client';
import { savedViews } from '$lib/server/db/schema/saved';
import { eq, and } from 'drizzle-orm';
import {
	getLatestIndicatorAllCountries,
	getIndicatorHistory,
	type ScalarIndicator,
	type IndicatorKey
} from '$lib/server/db/queries';
import { OPTION_BY_KEY } from '$lib/assets/analysisOptions';

export const load: PageServerLoad = async ({ params, locals }) => {
	if (!locals.user) redirect(302, '/auth/login');

	const [view] = await db
		.select()
		.from(savedViews)
		.where(and(eq(savedViews.id, params.analysisId), eq(savedViews.userId, locals.user.id)))
		.limit(1);

	if (!view) error(404, 'Analysis not found');

	const option = OPTION_BY_KEY[view.indicator];
	if (!option) error(400, `Unknown indicator: ${view.indicator}`);

	const savedCountries = Array.isArray(view.countries) ? view.countries : [];
	const safeKey = option.scalarKey as ScalarIndicator;

	let rows: { iso2: string; name: string; value: number | null }[] = [];
	let lineResults: { iso2: string; history: { year: number; value: number }[] }[] = [];

	// const year = view.selectedYear ?? undefined;
	const allRows = await getLatestIndicatorAllCountries(safeKey, undefined);
	const savedSet = new Set(
		savedCountries.filter((c): c is string => typeof c === 'string').map((c) => c.toLowerCase())
	);
	const matchedRows = allRows.filter((r) => savedSet.has(r.iso2.toLowerCase()));

	if (view.mode === 'line' && option.key) {
		lineResults = await Promise.all(
			matchedRows.map(async (r) => ({
				iso2: r.iso2,
				history: (await getIndicatorHistory(r.iso2, option.key as IndicatorKey)) ?? []
			}))
		);
	} else {
		rows = matchedRows;
	}

	if (view.mode === 'map') {
		rows = allRows;
	}

	return { view, option, rows, lineResults, user: locals.user };
};
