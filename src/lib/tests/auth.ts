// import { db } from '$lib/server/db/client';
// import { getUserFromToken, loginUser, logoutUser, registerUser } from '$lib/server/user';
// import { describe, it, expect, vi, beforeEach } from 'vitest';

// // beforeEach(async () => {
// //   await db.delete(schema.sessions);
// //   await db.delete(schema.users);
// // });

// describe('registerUser', () => {
// 	it('creates a user in DB', async () => {
// 		const user = await registerUser('test@test.com', 'password123', 'Test User');

// 		expect(user.email).toBe('test@test.com');

// 		const dbUser = await db.query.users.findFirst({
// 			where: (u, { eq }) => eq(u.email, 'test@test.com')
// 		});

// 		expect(dbUser).not.toBeNull();
// 	});
// });

// describe('loginUser', () => {
// 	it('returns token and user for valid credentials', async () => {
// 		await registerUser('test@test.com', 'password123');

// 		const result = await loginUser('test@test.com', 'password123');

// 		expect(result).not.toBeNull();

// 		if (!result) throw new Error('login failed');

// 		expect(result.token).toBeDefined();
// 		expect(result.user.email).toBe('test@test.com');
// 	});

// 	it('returns null for wrong password', async () => {
// 		await registerUser('test@test.com', 'password123');

// 		const result = await loginUser('test@test.com', 'wrong');

// 		expect(result).toBeNull();
// 	});
// });

// it('returns user from token', async () => {
// 	await registerUser('test@test.com', 'password123');

// 	const login = await loginUser('test@test.com', 'password123');

// 	expect(login).not.toBeNull();
// 	if (!login) throw new Error();

// 	const user = await getUserFromToken(login.token);

// 	expect(user?.email).toBe('test@test.com');
// });

// it('logs user out and invalidates token', async () => {
// 	await registerUser('test@test.com', 'password123');

// 	const login = await loginUser('test@test.com', 'password123');

// 	expect(login).not.toBeNull();
// 	if (!login) throw new Error();

// 	await logoutUser(login.token);

// 	const user = await getUserFromToken(login.token);

// 	expect(user).toBeNull();
// });
