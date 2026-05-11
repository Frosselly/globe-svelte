import { listUsers } from '$lib/server/user';

export async function load() {
	const users = await listUsers();

	return {
		users
	};
}
