import { json, type RequestHandler } from '@sveltejs/kit';
import {
	registerUser,
	loginUser,
	logoutUser,
	getUserFromEvent,
	setSessionCookie,
	clearSessionCookie
} from '$lib/server/user';

export const POST: RequestHandler = async (event) => {
	const body = await event.request.json().catch(() => null);
	if (!body || !body.action) {
		return json({ error: 'Missing action' }, { status: 400 });
	}

	switch (body.action) {
		// ── Register ──────────────────────────────────────────────────────────
		case 'register': {
			const { email, password, displayName } = body;
			if (!email || !password)
				return json({ error: 'email and password required' }, { status: 400 });
			try {
				const user = await registerUser(email, password, displayName);
				// Auto-login after register
				const loginResult = await loginUser(email, password);
				if (loginResult) setSessionCookie(event, loginResult.token);
				return json({ user });
			} catch (e: any) {
				if (e.message?.includes('unique') || e.code === '23505') {
					return json({ error: 'Email already in use' }, { status: 409 });
				}
				console.error(e);
				return json({ error: 'Registration failed' }, { status: 500 });
			}
		}

		// ── Login ─────────────────────────────────────────────────────────────
		case 'login': {
			const { email, password } = body;
			if (!email || !password)
				return json({ error: 'email and password required' }, { status: 400 });
			const result = await loginUser(email, password);
			if (!result) return json({ error: 'Invalid credentials' }, { status: 401 });
			setSessionCookie(event, result.token);
			return json({ user: result.user });
		}

		// ── Logout ────────────────────────────────────────────────────────────
		case 'logout': {
			const token = event.cookies.get('sid');
			if (token) await logoutUser(token);
			clearSessionCookie(event);
			return json({ ok: true });
		}

		// ── Me (get current user from cookie) ─────────────────────────────────
		case 'me': {
			const user = await getUserFromEvent(event);
			if (!user) return json({ user: null }, { status: 401 });
			return json({ user });
		}

		default:
			return json({ error: 'Unknown action' }, { status: 400 });
	}
};
