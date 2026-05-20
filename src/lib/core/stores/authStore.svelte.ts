// $lib/stores/authStore.svelte.ts
type AuthUser = { id: string; email: string; displayName: string | null; isAdmin: boolean };

class AuthStore {
	user = $state<AuthUser | null>(null);
	loaded = $state(false);

	async fetchMe() {
		try {
			const r = await fetch('/api/auth', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ action: 'me' })
			});
			const d = await r.json();
			this.user = d.user ?? null;
		} catch {
			this.user = null;
		}
		this.loaded = true;
	}

	async logout() {
		await fetch('/api/auth', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ action: 'logout' })
		});
		this.user = null;
	}
}

export const authStore = new AuthStore();
