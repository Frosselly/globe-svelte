/**
 * GET    /api/save          → list all saved views + chat messages for the user
 * POST   /api/save          → create a saved view (from analysis mode or chat)
 * DELETE /api/save?id=<id>  → delete a saved view
 */

import { json, type RequestHandler } from '@sveltejs/kit';
import { savedViews, chatMessages } from '$lib/server/db/schema/saved';
import { getUserFromEvent } from '$lib/server/user';
import { eq, and, desc } from 'drizzle-orm';
import { db } from '$lib/server/db/client';

// ── GET — list saved items ────────────────────────────────────────────────────

export const GET: RequestHandler = async (event) => {
	const user = await getUserFromEvent(event);
	if (!user) return json({ error: 'Not authenticated' }, { status: 401 });

	const [views, messages] = await Promise.all([
		// Saved views — newest first
		db
			.select()
			.from(savedViews)
			.where(eq(savedViews.userId, user.id))
			.orderBy(desc(savedViews.createdAt)),

		// Chat history — newest first, limit 50 so the sidebar stays snappy
		db
			.select({
				id: chatMessages.id,
				userMessage: chatMessages.userMessage,
				botReply: chatMessages.botReply,
				parsedQuery: chatMessages.parsedQuery,
				savedViewId: chatMessages.savedViewId,
				createdAt: chatMessages.createdAt
			})
			.from(chatMessages)
			.where(eq(chatMessages.userId, user.id))
			.orderBy(desc(chatMessages.createdAt))
			.limit(50)
	]);

	return json({ views, messages });
};

// ── POST — create a saved view ────────────────────────────────────────────────

export const POST: RequestHandler = async (event) => {
	const user = await getUserFromEvent(event);
	if (!user) return json({ error: 'Not authenticated' }, { status: 401 });

	const body = await event.request.json().catch(() => null);
	if (!body) return json({ error: 'Invalid body' }, { status: 400 });

	const {
		label,
		mode,
		indicator,
		indicatorName,
		countries,
		startYear,
		endYear,
		selectedYear,
		mapDisplayMode,
		messageId
	} = body;

	// Basic validation
	if (!label || !mode || !indicator || !countries || !startYear || !endYear) {
		return json(
			{ error: 'Missing required fields: label, mode, indicator, countries, startYear, endYear' },
			{ status: 400 }
		);
	}
	if (!['line', 'bar', 'map'].includes(mode)) {
		return json({ error: 'mode must be line | bar | map' }, { status: 400 });
	}

	const [view] = await db
		.insert(savedViews)
		.values({
			userId: user.id,
			label,
			mode,
			indicator,
			indicatorName: indicatorName ?? null,
			countries,
			startYear,
			endYear,
			selectedYear: selectedYear ?? null,
			mapDisplayMode: mapDisplayMode ?? null
		})
		.returning();

	// If this came from a chat message, link them together
	if (messageId && view) {
		await db
			.update(chatMessages)
			.set({ savedViewId: view.id })
			.where(
				and(
					eq(chatMessages.id, messageId),
					eq(chatMessages.userId, user.id) // safety: own messages only
				)
			);
	}

	return json({ view }, { status: 201 });
};

// ── DELETE — remove a saved view ──────────────────────────────────────────────

export const DELETE: RequestHandler = async (event) => {
	const user = await getUserFromEvent(event);
	if (!user) return json({ error: 'Not authenticated' }, { status: 401 });

	const id = event.url.searchParams.get('id');
	if (!id) return json({ error: 'id query param required' }, { status: 400 });

	const deleted = await db
		.delete(savedViews)
		.where(and(eq(savedViews.id, id), eq(savedViews.userId, user.id)))
		.returning({ id: savedViews.id });

	if (!deleted.length) return json({ error: 'Not found' }, { status: 404 });
	return json({ ok: true });
};
