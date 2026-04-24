import type { LayoutServerLoad } from './$types';

// The hook already verified auth and set locals.user — just pass it to the page
export const load: LayoutServerLoad = async ({ locals }) => {
	return {
		user: locals.user,
		logged_in: true
	};
};
