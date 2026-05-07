// See https://svelte.dev/docs/kit/types#app.d.ts

import type { AuthUser } from '$lib/server/user';

// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user: AuthUser | null;
			// user: {
			// 	id: number;
			// 	username: string;
			// 	email: string;
			// 	password: string;
			// 	firstName: string;
			// 	lastName: string;
			// 	role: string;
			// } | null;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
