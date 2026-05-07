/**
 * src/hooks.server.ts
 *
 * Runs on every request. Resolves the session cookie into a user object and
 * attaches it to event.locals so any load function or server route can read
 * it without hitting the DB again.
 *
 * Also adds permissive CORS headers for API routes (useful during dev when
 * the front end and API may run on different ports).
 */

import type { Handle } from '@sveltejs/kit';
import { getUserFromToken } from '$lib/server/user';

export const handle: Handle = async ({ event, resolve }) => {
	// ── 1. Resolve session ────────────────────────────────────────────────────
	const token = event.cookies.get('sid');

	if (token) {
		const user = await getUserFromToken(token);
		// Attach to locals — type-declared in app.d.ts (see bottom of file)
		event.locals.user = user ?? null;
	} else {
		event.locals.user = null;
	}

	// ── 2. Resolve the request ────────────────────────────────────────────────
	const response = await resolve(event, {
		// Let SvelteKit serialize <script> tags properly
		filterSerializedResponseHeaders: (name) => name === 'content-type' || name === 'x-request-id'
	});

	// ── 3. Add security + CORS headers on API routes ─────────────────────────
	if (event.url.pathname.startsWith('/api/')) {
		response.headers.set('X-Content-Type-Options', 'nosniff');

		// In production replace '*' with your actual origin
		const origin = event.request.headers.get('origin') ?? '*';
		response.headers.set('Access-Control-Allow-Origin', origin);
		response.headers.set('Access-Control-Allow-Credentials', 'true');
		response.headers.set('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
		response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
	}

	return response;
};

/**
 * Handle pre-flight OPTIONS requests for API routes.
 * (SvelteKit doesn't do this automatically.)
 */
export const handleFetch: import('@sveltejs/kit').HandleFetch = ({ request, fetch }) =>
	fetch(request);
