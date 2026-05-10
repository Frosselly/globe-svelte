import { pgTable, varchar, real, integer, jsonb, timestamp } from 'drizzle-orm/pg-core';
import { countries } from './countries';
import type { HistoricalData } from '$lib/core/types/c_shared';
import type {
	MilitaryBranch,
	MilitaryEquipment,
	MilitaryAlliance,
	MilitaryCapability,
	GDPAllocation,
	MilitaryPersonnel
} from '$lib/core/types/c_miliatry';

export const military = pgTable('military', {
	iso2: varchar('iso2', { length: 2 })
		.primaryKey()
		.references(() => countries.iso2, { onDelete: 'cascade' }),

	// Queryable scalars
	globalRank: integer('global_rank'),
	budgetCurrent: real('budget_current'),
	budgetYear: integer('budget_year'),
	budgetTrend: varchar('budget_trend', { length: 10 }),
	gdpPercentage: real('gdp_percentage'),
	activePersonnel: integer('active_personnel'),
	reservePersonnel: integer('reserve_personnel'),

	// Time-series blobs
	budgetHistory: jsonb('budget_history').$type<HistoricalData[]>(),

	// Structured blobs
	gdpAllocation: jsonb('gdp_allocation').$type<GDPAllocation>(),
	personnel: jsonb('personnel').$type<MilitaryPersonnel>(),
	branches: jsonb('branches').$type<MilitaryBranch[]>(),
	equipment: jsonb('equipment').$type<MilitaryEquipment[]>(),
	alliances: jsonb('alliances').$type<MilitaryAlliance[]>(),
	organizations: jsonb('organizations').$type<string[]>(),
	capabilities: jsonb('capabilities').$type<MilitaryCapability[]>(),

	lastUpdated: timestamp('last_updated').defaultNow()
});
