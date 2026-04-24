// auth/user/+page.server.ts
import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ parent }) => {
	const { user } = await parent();

	if (!user) {
		redirect(307, '/auth/login');
	}

	return {
		firstName: user.firstName,
		lastName: user.lastName,
		email: user.email,
		role: user.role
	};
};
