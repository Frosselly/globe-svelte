import { users, sessions } from '$lib/server/db/schema/users';
import { eq, lt } from 'drizzle-orm';
import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import type { RequestEvent } from '@sveltejs/kit';
import { db } from './db/client';

const scryptAsync = promisify(scrypt);

const SESSION_COOKIE = 'sid';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 1 day in ms

// -- Password helpers ----------

export async function hashPassword(plain: string): Promise<string> {
	const salt = randomBytes(16).toString('hex');
	const derived = (await scryptAsync(plain, salt, 64)) as Buffer;
	return `${salt}:${derived.toString('hex')}`;
}

export async function verifyPassword(plain: string, stored: string): Promise<boolean> {
	const [salt, hash] = stored.split(':');
	if (!salt || !hash) return false;
	const derived = (await scryptAsync(plain, salt, 64)) as Buffer;
	const storedBuf = Buffer.from(hash, 'hex');
	return timingSafeEqual(derived, storedBuf);
}

// -- Session helpers -----------

function makeToken(): string {
	return randomBytes(32).toString('hex');
}

/** Purge sessions that have already expired. Call periodically. */
export async function purgeExpiredSessions() {
	await db.delete(sessions).where(lt(sessions.expiresAt, new Date()));
}

// -- Public API ----------------

export type AuthUser = {
	id: string;
	email: string;
	displayName: string | null;
	isAdmin: boolean;
};

/** Create a new user. Throws if email already taken. */
export async function registerUser(
	email: string,
	password: string,
	displayName?: string
): Promise<AuthUser> {
	const hash = await hashPassword(password);
	const [user] = await db
		.insert(users)
		.values({
			email: email.toLowerCase().trim(),
			passwordHash: hash,
			displayName: displayName ?? null
		})
		.returning({
			id: users.id,
			email: users.email,
			displayName: users.displayName,
			isAdmin: users.isAdmin
		});
	if (!user) throw new Error('Failed to create user');
	return user as AuthUser;
}

/** Verify credentials and return a session token to set as cookie. */
export async function loginUser(
	email: string,
	password: string
): Promise<{ token: string; user: AuthUser } | null> {
	const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase().trim()));

	if (!user) return null;
	const ok = await verifyPassword(password, user.passwordHash);
	if (!ok) return null;

	const token = makeToken();
	const expiresAt = new Date(Date.now() + SESSION_DURATION);
	await db.insert(sessions).values({ userId: user.id, token, expiresAt });

	return {
		token,
		user: {
			id: user.id,
			email: user.email,
			displayName: user.displayName,
			isAdmin: user.isAdmin ?? false
		}
	};
}

/** Resolve a session token to a user, or null if invalid / expired. */
export async function getUserFromToken(token: string): Promise<AuthUser | null> {
	let row = null;
	try {
		[row] = await db
			.select({
				session: sessions,
				user: {
					id: users.id,
					email: users.email,
					displayName: users.displayName,
					isAdmin: users.isAdmin
				}
			})
			.from(sessions)
			.innerJoin(users, eq(users.id, sessions.userId))
			.where(eq(sessions.token, token));
	} catch (err) {
		console.error('DB unreachable or query failed:', err);
	}

	if (!row) return null;
	if (row.session.expiresAt < new Date()) {
		// lazy cleanup
		await db.delete(sessions).where(eq(sessions.token, token));
		return null;
	}
	return row.user as AuthUser;
}

/** Delete a session (logout). */
export async function logoutUser(token: string) {
	await db.delete(sessions).where(eq(sessions.token, token));
}

// -- SvelteKit event helpers --

/** Read the session cookie and resolve to a user. */
export async function getUserFromEvent(event: RequestEvent): Promise<AuthUser | null> {
	const token = event.cookies.get(SESSION_COOKIE);
	if (!token) return null;
	return getUserFromToken(token);
}

/** Set the session cookie after login. */
export function setSessionCookie(event: RequestEvent, token: string) {
	event.cookies.set(SESSION_COOKIE, token, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: process.env.NODE_ENV === 'production',
		maxAge: SESSION_DURATION / 1000
	});
}

/** Clear the session cookie on logout. */
export function clearSessionCookie(event: RequestEvent) {
	event.cookies.delete(SESSION_COOKIE, { path: '/' });
}

// -- Admin helpers ------------

export async function listUsers(): Promise<AuthUser[]> {
	return db
		.select({
			id: users.id,
			email: users.email,
			displayName: users.displayName,
			isAdmin: users.isAdmin
		})
		.from(users) as Promise<AuthUser[]>;
}

export async function deleteUser(id: string) {
	await db.delete(users).where(eq(users.id, id));
}

export async function setAdmin(id: string, isAdmin: boolean) {
	await db.update(users).set({ isAdmin }).where(eq(users.id, id));
}
