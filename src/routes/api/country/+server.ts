import { json, type RequestHandler } from '@sveltejs/kit';
import { getCountrySnapshot } from '$lib/server/db/queries';

export const POST: RequestHandler = async (event) => {
	const body = await event.request.json().catch(() => null);
	const { countryIso2 } = body ?? {};

	const countryData = await getCountrySnapshot(countryIso2);

	return json({
		country: countryData
	});
};
