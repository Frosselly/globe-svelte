import { fail, redirect } from '@sveltejs/kit';

export const actions = {
	login: async ({ cookies, request }) => {
		const data = await request.formData();

		const phone = data.get('phone');

		if (!phone || phone!.toString().trim() === '') {
			return fail(400, {
				error: 'Tuščias numeris'
			});
		}

		const myHeaders = new Headers();
		myHeaders.append('Content-Type', 'application/json');

		const raw = JSON.stringify({
			phone: phone
		});

		const requestOptions: RequestInit = {
			method: 'POST',
			headers: myHeaders,
			body: raw,
			redirect: 'follow'
		};

		const response = await fetch('https://api.awqms.cloud/api/auth/login/initiate', requestOptions);
		const result = await response.json();

		if (!result.success) {
			return fail(400, {
				error: 'Neatitinkamas numeris'
			});
		}

		// Save operation id to current environment
		cookies.set('operation_id', result.data.operation_id, { path: '/' });

		redirect(303, '/login/code');
	}
};
