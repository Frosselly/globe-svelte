import { db } from '$lib/server/db/client';
import { sql } from 'drizzle-orm';
import { aiUsage } from './schema/rateLimit';

const USER_LIMIT = 3; // per hour

export async function checkAndIncrementUsage(
	userId: string
): Promise<{ allowed: boolean; count: number; retryAfter?: number }> {
	const windowStart = new Date();
	windowStart.setMinutes(0, 0, 0);

	const result = await db
		.insert(aiUsage)
		.values({ userId, windowStart, count: 1 })
		.onConflictDoUpdate({
			target: [aiUsage.userId, aiUsage.windowStart],
			set: { count: sql`${aiUsage.count} + 1` },
			where: sql`${aiUsage.count} < ${USER_LIMIT}`
		})
		.returning({ count: aiUsage.count });

	if (result.length === 0) {
		const nextHour = new Date(windowStart.getTime() + 60 * 60 * 1000);
		const retryAfter = Math.ceil((nextHour.getTime() - Date.now()) / 1000);

		return {
			allowed: false,
			count: USER_LIMIT,
			retryAfter
		};
	}

	const count = result[0].count;
	return { allowed: true, count };
}
