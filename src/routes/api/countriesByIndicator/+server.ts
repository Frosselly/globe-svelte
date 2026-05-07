import { json, type RequestHandler } from '@sveltejs/kit';
import { getLatestIndicatorAllCountries } from '$lib/server/db/queries';

export const POST: RequestHandler = async (event) => {
	const body = await event.request.json().catch(() => null);
	const { indicator, year } = body ?? {};

	const countriesData = await getLatestIndicatorAllCountries(indicator, year);

	return json({
		countriesData
	});
};
