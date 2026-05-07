import { pgTable, varchar, real, integer, jsonb, timestamp } from 'drizzle-orm/pg-core';
import { countries } from './countries';
import type { HistoricalData } from '$lib/types/c_shared';

export const demographics = pgTable('demographics', {
	iso2: varchar('iso2', { length: 2 })
		.primaryKey()
		.references(() => countries.iso2, { onDelete: 'cascade' }),

	// Queryable scalars — used for filtering / ranking
	populationCurrent: real('population_current'),
	populationYear: integer('population_year'),
	populationTrend: varchar('population_trend', { length: 10 }),

	// Dense time-series stored as jsonb
	populationHistory: jsonb('population_history').$type<HistoricalData[]>(),
	density: jsonb('density').$type<HistoricalData[]>(),
	urbanization: jsonb('urbanization').$type<HistoricalData[]>(),
	medianAge: jsonb('median_age').$type<HistoricalData[]>(),
	ageDistribution: jsonb('age_distribution').$type<HistoricalData[]>(),

	// Scalar derived from the most-recent literacy entry
	literacyCurrent: real('literacy_current'),
	literacy: jsonb('literacy').$type<HistoricalData[]>(),

	// Ethnic groups — null percentages are fine here, kept as-is
	ethnicGroups: jsonb('ethnic_groups').$type<{ group: string; percentage: number | null }[]>(),

	// Health sub-object
	healthcareRank: integer('healthcare_rank'),
	healthcareSpending: jsonb('healthcare_spending').$type<HistoricalData[]>(),
	hospitalBeds: jsonb('hospital_beds').$type<HistoricalData[]>(),
	infantMortality: jsonb('infant_mortality').$type<HistoricalData[]>(),
	lifeExpectancy: jsonb('life_expectancy').$type<HistoricalData[]>(),

	lastUpdated: timestamp('last_updated').defaultNow()
});
