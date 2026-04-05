// +page.server.ts
import { redirect } from '@sveltejs/kit';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user === null) {
		return redirect(307, '/login');
	}

	return {
		first_name: locals.user.first_name,
		last_name: locals.user.last_name,
		email: locals.user.email,
		role: locals.user.role
	};
};
