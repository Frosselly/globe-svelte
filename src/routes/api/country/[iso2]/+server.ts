/**
 * src/routes/api/country/[iso2]/+server.ts
 *
 * GET /api/country/FR         → getCountrySnapshot('FR')
 * GET /api/country/FR?full=1  → getCountryWithHistory('FR')
 */

import { json, type RequestHandler } from '@sveltejs/kit';
import { getCountrySnapshot, getCountryWithHistory } from '$lib/server/db/queries';

export const GET: RequestHandler = async ({ params, url }) => {
	const iso2 = params.iso2?.toUpperCase();
	if (!iso2 || iso2.length !== 2) {
		return json({ error: 'Invalid ISO2 code' }, { status: 400 });
	}

	const full = url.searchParams.get('full') === '1';
	const result = full ? await getCountryWithHistory(iso2) : await getCountrySnapshot(iso2);
	if (!result) return json({ error: 'Country not found' }, { status: 404 });
	return json(result);
};
