/**
 * Loads the saved_view row AND pre-fetches the data so the page renders
 * without a client-side fetch waterfall.
 */

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

	console.log('params', params);

	const [view] = await db
		.select()
		.from(savedViews)
		.where(and(eq(savedViews.id, params.analysisId), eq(savedViews.userId, locals.user.id)))
		.limit(1);

	console.log('view', view);

	if (!view) error(404, 'Analysis not found');

	const option = OPTION_BY_KEY[view.indicator];
	if (!option) error(400, `Unknown indicator: ${view.indicator}`);

	const savedCountries = (view.countries ?? []) as string[];
	const safeKey = option.scalarKey as ScalarIndicator;

	let rows: { iso2: string; name: string; value: number | null }[] = [];
	let lineResults: { iso2: string; history: { year: number; value: number }[] }[] = [];

	if (view.mode === 'line' && option.historyKey) {
		// Fetch history for each saved country in parallel
		lineResults = await Promise.all(
			savedCountries.map(async (iso2) => ({
				iso2,
				history: (await getIndicatorHistory(iso2, option.historyKey as IndicatorKey)) ?? []
			}))
		);
	} else {
		// Bar / map: get scalar rows filtered to saved countries
		const year = view.selectedYear ?? undefined;
		const allRows = await getLatestIndicatorAllCountries(safeKey, year);
		const savedSet = new Set(savedCountries.map((c) => c.toUpperCase()));
		rows = allRows.filter((r) => savedSet.has(r.iso2.toUpperCase()));
	}

	return { view, option, rows, lineResults, user: locals.user };
};
