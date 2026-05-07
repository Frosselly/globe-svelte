import { pgTable, varchar, real, integer, jsonb, timestamp } from 'drizzle-orm/pg-core';
import { countries } from './countries';
import type { HistoricalData } from '$lib/types/c_shared';

export const environment = pgTable('environment', {
	iso2: varchar('iso2', { length: 2 })
		.primaryKey()
		.references(() => countries.iso2, { onDelete: 'cascade' }),

	// Queryable scalars
	forestCoverageCurrent: real('forest_coverage_current'),
	forestCoverageTrend: varchar('forest_coverage_trend', { length: 10 }),
	airQuality: real('air_quality'),
	recyclingRateIndex: real('recycling_rate_index'),
	envPerformanceIndex: real('env_performance_index'),

	// Time-series blobs
	forestCoverageHistory: jsonb('forest_coverage_history').$type<HistoricalData[]>(),
	waterAccess: jsonb('water_access').$type<HistoricalData[]>(),

	// Structured blobs
	protectedAreas:
		jsonb('protected_areas').$type<{ name: string; size: string; designation: string }[]>(),
	airQualityByCity: jsonb('air_quality_by_city').$type<Record<string, number>>(),
	threatenedSpecies: jsonb('threatened_species').$type<{
		mammal: number;
		birds: number;
		fishes: number;
	}>(),
	naturalHazards: jsonb('natural_hazards').$type<{
		earthquakes: number;
		tsunamis: number;
		coastalFloodings: number;
		riverlineFloodings: number;
		cyclones: number;
		droughts: number;
		seaLevelRise: number;
	}>(),

	lastUpdated: timestamp('last_updated').defaultNow()
});
