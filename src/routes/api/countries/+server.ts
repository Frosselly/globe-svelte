/**
 * src/routes/api/countries/+server.ts
 *
 * GET /api/countries
 *
 * Returns the minimal index needed to:
 *   - populate the world map (iso2, name, latlng, region)
 *   - power the search box (iso2, iso3, name, capital)
 *   - seed the countriesStore
 *
 * Does NOT return any topic data (economy, energy, etc.) — those are fetched
 * on demand per country via /api/country/[iso2].
 */

import { json, type RequestHandler } from '@sveltejs/kit';
import { countries } from '$lib/server/db/schema/countries';
import { asc } from 'drizzle-orm';
import { db } from '$lib/server/db/client';

export const GET: RequestHandler = async () => {
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

	// Return as a Record<iso2, row> so existing store code keeps working
	const indexed = Object.fromEntries(rows.map((r) => [r.iso2, r]));
	return json(indexed);
};
