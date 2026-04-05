import { fail, redirect } from '@sveltejs/kit';

export const actions = {
	signup: async ({ cookies, request }) => {
		const data = await request.formData();

		const phone = data.get('phone');
		const first_name = data.get('first_name');
		const last_name = data.get('last_name');
		const email = data.get('email');

		if (!phone || phone!.toString().trim() === '') {
			return fail(400, {
				error: 'Tuščias numeris'
			});
		}
		if (!first_name || first_name!.toString().trim() === '') {
			return fail(400, {
				error: 'Tuščias vardas'
			});
		}
		if (!last_name || last_name!.toString().trim() === '') {
			return fail(400, {
				error: 'Tuščia pavardė'
			});
		}
		if (!email || email!.toString().trim() === '') {
			return fail(400, {
				error: 'Tuščias el. paštas'
			});
		}

		const myHeaders = new Headers();
		myHeaders.append('Content-Type', 'application/json');

		const raw = JSON.stringify({
			phone: phone,
			first_name: first_name,
			last_name: last_name,
			email: email
		});

		const requestOptions: RequestInit = {
			method: 'POST',
			headers: myHeaders,
			body: raw,
			redirect: 'follow'
		};

		const response = await fetch(
			'https://api.awqms.cloud/api/auth/registration/initiate',
			requestOptions
		);
		const result = await response.json();

		if (result.error) {
			return fail(400, {
				error: 'Įvyko klaida'
			});
		}

		if (!result.success) {
			return fail(400, {
				error: 'Neatitinkamas numeris'
			});
		}

		// Save operation id to current environment
		cookies.set('operation_id', result.data.operation_id, { path: '/' });

		redirect(303, '/signup/code');
	}
};
