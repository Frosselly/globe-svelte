import { pgTable, varchar, real, jsonb, timestamp } from 'drizzle-orm/pg-core';
import { countries } from './countries';
import type { HistoricalData } from '$lib/core/types/c_shared';
import type { EnergyMixSource, EnergyTarget } from '$lib/core/types/c_energy';

export const energy = pgTable('energy', {
	iso2: varchar('iso2', { length: 2 })
		.primaryKey()
		.references(() => countries.iso2, { onDelete: 'cascade' }),

	// Queryable scalars
	renewableCurrent: real('renewable_current'),
	renewableTrend: varchar('renewable_trend', { length: 10 }),
	productionCurrent: real('production_current'),
	consumptionCurrent: real('consumption_current'),
	co2Current: real('co2_current'),

	// Time-series blobs
	renewableHistory: jsonb('renewable_history').$type<HistoricalData[]>(),
	productionHistory: jsonb('production_history').$type<HistoricalData[]>(),
	consumptionHistory: jsonb('consumption_history').$type<HistoricalData[]>(),
	co2History: jsonb('co2_history').$type<HistoricalData[]>(),

	// Complex blobs
	energyMixCurrent: jsonb('energy_mix_current').$type<EnergyMixSource[]>(),
	energyMixHistory: jsonb('energy_mix_history').$type<HistoricalData<EnergyMixSource[]>[]>(),
	targets: jsonb('targets').$type<EnergyTarget[]>(),

	lastUpdated: timestamp('last_updated').defaultNow()
});
