/**
 * src/routes/(app)/analysis/+page.server.ts
 */
import type { PageServerLoad } from './$types';
import {
	getLatestIndicatorAllCountries,
	getIndicatorHistory,
	type ScalarIndicator,
	type IndicatorKey
} from '$lib/server/db/queries';
import { OPTION_BY_KEY, ANALYSIS_OPTIONS } from '$lib/assets/analysisOptions';
import { countriesStore } from '$lib/core/stores/store.svelte';
import { setIndicatorRows } from '$lib/components/map/mapStore.svelte';

export const load: PageServerLoad = async ({ url, locals }) => {
	const indicatorKey = (url.searchParams.get('indicator') ?? 'gdp') as ScalarIndicator;
	const view = (url.searchParams.get('view') ?? 'bar') as 'bar' | 'line' | 'map' | 'table';
	const yearParam = url.searchParams.get('year');
	const year = yearParam ? Number(yearParam) : undefined;
	const iso2 = url.searchParams.get('country')?.toUpperCase() ?? null;

	const option = OPTION_BY_KEY[indicatorKey] ?? OPTION_BY_KEY['gdp'];
	const safeKey = option.scalarKey as ScalarIndicator;

	const [rows, history] = await Promise.all([
		getLatestIndicatorAllCountries(safeKey, year),
		view === 'line' && iso2 && option.key
			? getIndicatorHistory(iso2, option.key as IndicatorKey)
			: Promise.resolve(null)
	]);

	return {
		rows,
		history,
		option,
		options: ANALYSIS_OPTIONS,
		view,
		year: year ?? null,
		iso2,
		user: locals.user ?? null
	};
};
