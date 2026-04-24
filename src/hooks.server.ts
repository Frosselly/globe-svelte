import { redirect } from '@sveltejs/kit';

const unprotectedRoutes = ['/', '/auth/login', '/auth/signup'];
const authRoutes = ['/auth/login', '/auth/signup'];

export const handle = async ({ event, resolve }) => {
	const userId = event.cookies.get('user_id');

	if (userId) {
		const dbResponse = await fetch('http://localhost:5173/tempAuthDB.json');
		const db = await dbResponse.json();

		const user = db.users.find((u: any) => u.id.toString() === userId);

		if (user) {
			event.locals.user = user;
		} else {
			event.cookies.delete('user_id', { path: '/' });
			event.locals.user = null;
		}
	} else {
		event.locals.user = null;
	}

	if (event.locals.user && authRoutes.includes(event.url.pathname)) {
		redirect(303, '/');
	}

	const isProtected = !unprotectedRoutes.includes(event.url.pathname);
	if (!event.locals.user && isProtected) {
		redirect(303, '/sign-in');
	}

	return resolve(event);
};
