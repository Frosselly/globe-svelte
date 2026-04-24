import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import fs from 'fs';
import path from 'path';

export const actions: Actions = {
	signup: async ({ cookies, request }) => {
		const data = await request.formData();

		const username = data.get('username');
		const email = data.get('email');
		const password = data.get('password');
		const firstName = data.get('firstName');
		const lastName = data.get('lastName');

		// Validation
		if (!username || username.toString().trim() === '') {
			return fail(400, {
				error: 'Naudotojo vardas yra privalomas'
			});
		}

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

		if (!firstName || firstName.toString().trim() === '') {
			return fail(400, {
				error: 'Vardas yra privalomas'
			});
		}

		if (!lastName || lastName.toString().trim() === '') {
			return fail(400, {
				error: 'Pavardė yra privaloma'
			});
		}

		// Load JSON database
		const dbPath = path.join(process.cwd(), 'static', 'tempAuthDB.json');
		const dbData = fs.readFileSync(dbPath, 'utf-8');
		const db = JSON.parse(dbData);

		// Check if user already exists
		const existingUser = db.users.find(
			(u: any) => u.email.toLowerCase() === email.toString().toLowerCase()
		);

		if (existingUser) {
			return fail(400, {
				error: 'El. paštas jau naudojamas'
			});
		}

		// Create new user
		const newUser = {
			id: db.users.length + 1,
			username: username.toString(),
			email: email.toString(),
			password: password.toString(),
			firstName: firstName.toString(),
			lastName: lastName.toString(),
			role: 'user'
		};

		// Add to database and save to file
		db.users.push(newUser);
		fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

		// Set session cookie
		cookies.set('user_id', newUser.id.toString(), { path: '/' });

		redirect(303, '/auth/user');
	}
};
