import { countriesStore } from '$lib/core/stores/store.svelte';
import { db } from '$lib/server/db/client';
import { countries } from '$lib/server/db/schema';
import { asc } from 'drizzle-orm';
import type { LayoutServerLoad } from '../$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	const rows = await db
		.select({
			iso2: countries.iso2,
			iso3: countries.iso3,
			name: countries.name,
			capital: countries.capital,
			region: countries.region,
			subregion: countries.subregion,
			latlng: countries.latlng,
			flagEmoji: countries.flagEmoji,
			flagSvg: countries.flagSvg,
			population: countries.population,
			area: countries.area,
			timezones: countries.timezones,
			borders: countries.borders,
			continents: countries.continents
		})
		.from(countries)
		.orderBy(asc(countries.name));
	const countriesIndex = Object.fromEntries(rows.map((r) => [r.iso2, r]));
	if (countriesIndex && !countriesStore.loaded) {
		countriesStore.setCountries(countriesIndex);
	}

	return {
		user: locals.user,
		logged_in: true
	};
};
