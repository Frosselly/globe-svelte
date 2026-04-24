import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
	login: async ({ cookies, request }) => {
		const data = await request.formData();

		const email = data.get('email');
		const password = data.get('password');

		if (!email || email.toString().trim() === '') {
			return fail(400, {
				error: 'El. paštas yra privalomas'
			});
		}

		if (!password || password.toString().trim() === '') {
			return fail(400, {
				error: 'Slaptažodis yra privalomas'
			});
		}

		const dbResponse = await fetch('http://localhost:5173/tempAuthDB.json');
		const db = await dbResponse.json();

		// Find user
		const user = db.users.find(
			(u: any) => u.email.toLowerCase() === email.toString().toLowerCase()
		);

		if (!user || user.password !== password.toString()) {
			return fail(401, {
				error: 'Neteisingas el. paštas arba slaptažodis'
			});
		}

		console.log('logged in!:', user);

		// Set session cookie
		cookies.set('user_id', user.id.toString(), { path: '/' });

		redirect(303, '/auth/user');
	}
};
