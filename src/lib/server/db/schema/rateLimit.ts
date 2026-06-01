import { pgTable, text, uuid, integer, timestamp, primaryKey } from 'drizzle-orm/pg-core';
import { users } from './users';

export const aiUsage = pgTable(
  'ai_usage',
  {
    userId: uuid('user_id').notNull().references(() => users.id),
    windowStart: timestamp('window_start', { mode: 'date' }).notNull(),
    count: integer('count').notNull().default(0),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.windowStart] }),
  })
);
