// +page.server.ts
import { redirect } from '@sveltejs/kit';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, cookies }) => {
	if (locals.user === null) {
		return redirect(307, '/login');
	}

	locals.user = null;
	cookies.delete('token', { path: '/' });
	redirect(307, '/');
};
