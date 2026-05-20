import {
	pgTable,
	uuid,
	varchar,
	text,
	integer,
	jsonb,
	timestamp,
	pgEnum
} from 'drizzle-orm/pg-core';
import { users } from './users';

// -- Enums --------------------

export const viewModeEnum = pgEnum('view_mode', ['line', 'bar', 'map']);

// -- Saved views --------------
//
// One row = one bookmark the user created by clicking "Save" in Analysis Mode
// or from the chat.
//
// The `params` jsonb stores everything needed to recreate the exact fetch:
//   { indicator, countries, start, end }   (for World Bank)
// The `year` column stores the selected point-in-time for bar/map modes.
// For line (trend) mode year is null — the full range is what matters.

export const savedViews = pgTable('saved_views', {
	id: uuid('id').primaryKey().defaultRandom(),
	userId: uuid('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),

	// Human-readable label shown in the saved-queries list
	label: varchar('label', { length: 255 }).notNull(),

	// Which visualisation was active when the user saved
	mode: viewModeEnum('mode').notNull(),

	// World Bank indicator code  e.g. "SP.POP.TOTL"
	indicator: varchar('indicator', { length: 64 }).notNull(),

	// Display name resolved from the AI response  e.g. "Population, total"
	indicatorName: varchar('indicator_name', { length: 255 }),

	// ISO-3 country codes selected at save time
	countries: jsonb('countries').$type<string[]>().notNull(),

	// Year range used in the fetch
	startYear: integer('start_year').notNull(),
	endYear: integer('end_year').notNull(),

	// For bar / map mode: the specific year the slider was on
	selectedYear: integer('selected_year'),

	// Map display variant: 'flat' | 'columns'
	mapDisplayMode: varchar('map_display_mode', { length: 16 }),

	createdAt: timestamp('created_at').defaultNow()
});

// -- Chat messages ------------
//
// Each user message + bot response pair is stored so the user can quickly
// revisit past queries.  The `parsedQuery` stores what the AI extracted so
// the front end can replay the fetch without hitting the AI again.

export const chatMessages = pgTable('chat_messages', {
	id: uuid('id').primaryKey().defaultRandom(),
	userId: uuid('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),

	// The raw string the user typed
	userMessage: text('user_message').notNull(),

	// The bot reply text
	botReply: text('bot_reply'),

	// What the AI parsed — stored so "replay" skips the AI call entirely
	parsedQuery: jsonb('parsed_query').$type<{
		indicator: string;
		indicatorName?: string;
		countriesIso3: string[];
		start: number;
		end: number;
		chart: string;
	}>(),

	// null means the message was never saved as a view
	savedViewId: uuid('saved_view_id').references(() => savedViews.id, { onDelete: 'set null' }),

	createdAt: timestamp('created_at').defaultNow()
});

export type SavedView = typeof savedViews.$inferSelect;
export type ChatMessage = typeof chatMessages.$inferSelect;
