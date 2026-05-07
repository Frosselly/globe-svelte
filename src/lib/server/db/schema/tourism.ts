import { pgTable, varchar, real, integer, jsonb, timestamp } from 'drizzle-orm/pg-core';
import { countries } from './countries';
import type { HistoricalData } from '$lib/types/c_shared';
import type { PracticalInfo } from '$lib/types/c_tourism';

export const tourism = pgTable('tourism', {
	iso2: varchar('iso2', { length: 2 })
		.primaryKey()
		.references(() => countries.iso2, { onDelete: 'cascade' }),

	// Queryable scalars
	visitorsCurrent: real('visitors_current'),
	visitorsTrend: varchar('visitors_trend', { length: 10 }),
	tourismRanking: integer('tourism_ranking'),
	revenueUsd: real('revenue_usd'),
	revenuePercentageGdp: real('revenue_percentage_gdp'),
	unescoSites: integer('unesco_sites'),
	safetyScore: integer('safety_score'),

	// Time-series blobs
	visitorsHistory: jsonb('visitors_history').$type<HistoricalData[]>(),

	// Structured blobs
	visaRequirements: jsonb('visa_requirements').$type<Record<string, { requirement: string }>>(),
	practicalInfo: jsonb('practical_info').$type<PracticalInfo>(),

	lastUpdated: timestamp('last_updated').defaultNow()
});
