import { pgTable, varchar, real, integer, jsonb, timestamp } from 'drizzle-orm/pg-core';
import { countries } from './countries';
import type { HistoricalData } from '$lib/core/types/c_shared';
import type {
	BusinessEnvironment,
	EconomicalSector,
	LabourMarket,
	Trade
} from '$lib/core/types/c_economy';

export const economy = pgTable('economy', {
	iso2: varchar('iso2', { length: 2 })
		.primaryKey()
		.references(() => countries.iso2, { onDelete: 'cascade' }),

	// Queryable scalars
	gdpCurrent: real('gdp_current'),
	gdpTrend: varchar('gdp_trend', { length: 10 }),
	worldRank: integer('world_rank'),
	perCapitaGdp: real('per_capita_gdp'),
	inflationCurrent: real('inflation_current'),
	inflationTrend: varchar('inflation_trend', { length: 10 }),
	corruptionIndex: real('corruption_index'),
	competitivenessIndex: real('competitiveness_index'),
	innovationIndex: real('innovation_index'),
	avgSalary: real('avg_salary'),
	minimumWage: real('minimum_wage'),

	// Time-series blobs
	gdpHistory: jsonb('gdp_history').$type<HistoricalData[]>(),
	inflationHistory: jsonb('inflation_history').$type<HistoricalData[]>(),

	// Structured blobs (no filtering needed on their internals)
	economicalSectors: jsonb('economical_sectors').$type<EconomicalSector[]>(),
	trade: jsonb('trade').$type<Trade>(),
	topExportedGoods: jsonb('top_exported_goods').$type<string[]>(),
	businessEnvironment: jsonb('business_environment').$type<BusinessEnvironment>(),
	majorCompanies: jsonb('major_companies').$type<string[]>(),
	labourMarket: jsonb('labour_market').$type<LabourMarket>(),

	lastUpdated: timestamp('last_updated').defaultNow()
});
