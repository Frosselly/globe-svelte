/**
 * queries.ts
 *
 * Four query patterns:
 *
 *  1. getCountrySnapshot(iso2)
 *     → one country, every topic, only current/scalar values
 *
 *  2. getCountryWithHistory(iso2)
 *     → same as above but includes the full historical time-series
 *       for every field that has a `trend` (gdp, inflation, renewables,
 *       forest coverage, population, military budget, visitors)
 *
 *  3. getIndicatorHistory(iso2, indicator)
 *     → single time-series for one specific indicator of one country
 *
 *  4. getLatestIndicatorAllCountries(indicator, year?)
 *     → one scalar value per country, optionally filtered to a specific year
 *       (falls back to the most recent available when year is omitted)
 */

import { db } from './client';
import { eq, desc, asc, and, sql, isNotNull } from 'drizzle-orm';
import { countries, economy, energy, environment, military, tourism, demographics } from './schema';
import type { HistoricalData } from '$lib/core/types/c_shared';

// ----
// 1. One country — every topic, only current/scalar values
// ----

export async function getCountrySnapshot(iso2: string) {
	const [row] = await db
		.select({
			// Core identity
			name: countries.name,
			iso2: countries.iso2,
			iso3: countries.iso3,
			region: countries.region,
			capital: countries.capital,
			population: countries.population,
			area: countries.area,
			flagEmoji: countries.flagEmoji,
			flagSvg: countries.flagSvg,
			timezones: countries.timezones,
			borders: countries.borders,

			// Economy scalars
			gdpCurrent: economy.gdpCurrent,
			gdpTrend: economy.gdpTrend,
			worldRank: economy.worldRank,
			perCapitaGdp: economy.perCapitaGdp,
			inflationCurrent: economy.inflationCurrent,
			inflationTrend: economy.inflationTrend,
			corruptionIndex: economy.corruptionIndex,
			competitivenessIndex: economy.competitivenessIndex,
			avgSalary: economy.avgSalary,
			minimumWage: economy.minimumWage,
			economicalSectors: economy.economicalSectors,
			topExportedGoods: economy.topExportedGoods,
			businessEnvironment: economy.businessEnvironment,
			majorCompanies: economy.majorCompanies,
			labourMarket: economy.labourMarket,
			trade: economy.trade,

			// Energy scalars
			renewableCurrent: energy.renewableCurrent,
			renewableTrend: energy.renewableTrend,
			productionCurrent: energy.productionCurrent,
			consumptionCurrent: energy.consumptionCurrent,
			co2Current: energy.co2Current,
			energyMixCurrent: energy.energyMixCurrent,
			targets: energy.targets,

			// Military scalars
			militaryRank: military.globalRank,
			budgetCurrent: military.budgetCurrent,
			budgetTrend: military.budgetTrend,
			gdpPercentage: military.gdpPercentage,
			activePersonnel: military.activePersonnel,
			reservePersonnel: military.reservePersonnel,
			branches: military.branches,
			equipment: military.equipment,
			alliances: military.alliances,
			capabilities: military.capabilities,

			// Environment scalars
			forestCoverageCurrent: environment.forestCoverageCurrent,
			forestCoverageTrend: environment.forestCoverageTrend,
			airQuality: environment.airQuality,
			recyclingRateIndex: environment.recyclingRateIndex,
			envPerformanceIndex: environment.envPerformanceIndex,
			threatenedSpecies: environment.threatenedSpecies,
			naturalHazards: environment.naturalHazards,
			protectedAreas: environment.protectedAreas,

			// Tourism scalars
			visitorsCurrent: tourism.visitorsCurrent,
			visitorsTrend: tourism.visitorsTrend,
			tourismRanking: tourism.tourismRanking,
			revenueUsd: tourism.revenueUsd,
			revenuePercentageGdp: tourism.revenuePercentageGdp,
			unescoSites: tourism.unescoSites,
			safetyScore: tourism.safetyScore,
			practicalInfo: tourism.practicalInfo,

			// Demographics scalars
			populationCurrent: demographics.populationCurrent,
			populationTrend: demographics.populationTrend,
			literacyCurrent: demographics.literacyCurrent,
			healthcareRank: demographics.healthcareRank,
			ethnicGroups: demographics.ethnicGroups
		})
		.from(countries)
		.leftJoin(economy, eq(economy.iso2, countries.iso2))
		.leftJoin(energy, eq(energy.iso2, countries.iso2))
		.leftJoin(military, eq(military.iso2, countries.iso2))
		.leftJoin(environment, eq(environment.iso2, countries.iso2))
		.leftJoin(tourism, eq(tourism.iso2, countries.iso2))
		.leftJoin(demographics, eq(demographics.iso2, countries.iso2))
		.where(eq(countries.iso2, iso2.toUpperCase()));

	return row ?? null;
}

/*
 * Usage:
 *   const france = await getCountrySnapshot('FR');
 *   // console.log(france?.gdpCurrent);       // 3160442622465
 *   // console.log(france?.energyMixCurrent); // [{ name: 'Nuclear', percentage: 37.4 }, …]
 *   // console.log(france?.alliances);        // [{ name: 'NATO', … }]
 */

// ----
// 2. One country — snapshot + historical data for every trended indicator
// ----

export async function getCountryWithHistory(iso2: string) {
	const snapshot = await getCountrySnapshot(iso2);
	if (!snapshot) return null;

	// Fetch just the heavy history columns in a single extra query
	const [hist] = await db
		.select({
			gdpHistory: economy.gdpHistory,
			inflationHistory: economy.inflationHistory,
			renewableHistory: energy.renewableHistory,
			productionHistory: energy.productionHistory,
			consumptionHistory: energy.consumptionHistory,
			co2History: energy.co2History,
			energyMixHistory: energy.energyMixHistory,
			forestCoverageHistory: environment.forestCoverageHistory,
			waterAccess: environment.waterAccess,
			budgetHistory: military.budgetHistory,
			visitorsHistory: tourism.visitorsHistory,
			populationHistory: demographics.populationHistory,
			density: demographics.density,
			urbanization: demographics.urbanization,
			medianAge: demographics.medianAge,
			healthcareSpending: demographics.healthcareSpending,
			hospitalBeds: demographics.hospitalBeds,
			infantMortality: demographics.infantMortality,
			lifeExpectancy: demographics.lifeExpectancy,
			literacy: demographics.literacy
		})
		.from(countries)
		.leftJoin(economy, eq(economy.iso2, countries.iso2))
		.leftJoin(energy, eq(energy.iso2, countries.iso2))
		.leftJoin(military, eq(military.iso2, countries.iso2))
		.leftJoin(environment, eq(environment.iso2, countries.iso2))
		.leftJoin(tourism, eq(tourism.iso2, countries.iso2))
		.leftJoin(demographics, eq(demographics.iso2, countries.iso2))
		.where(eq(countries.iso2, iso2.toUpperCase()));

	return { ...snapshot, ...hist };
}

/*
 * Usage:
 *   const fr = await getCountryWithHistory('FR');
 *   fr?.gdpHistory?.forEach(({ year, value }) =>
 *     // console.log(year, (value / 1e12).toFixed(2) + 'T USD')
 *   );
 */

// ----
// 3. Single indicator history for one country
// ----

// All supported indicator keys and their source table/column
export type IndicatorKey =
	| 'gdp'
	| 'inflation'
	| 'renewable'
	| 'production'
	| 'consumption'
	| 'co2'
	| 'energyMix'
	| 'forestCoverage'
	| 'waterAccess'
	| 'militaryBudget'
	| 'visitors'
	| 'population'
	| 'density'
	| 'urbanization'
	| 'medianAge'
	| 'healthcareSpending'
	| 'hospitalBeds'
	| 'infantMortality'
	| 'lifeExpectancy'
	| 'literacy';

export async function getIndicatorHistory(
	iso2: string,
	indicator: IndicatorKey
): Promise<HistoricalData[] | null> {
	const upper = iso2.toUpperCase();

	// Map each key to whichever table + column holds it
	switch (indicator) {
		case 'gdp': {
			const [row] = await db
				.select({ data: economy.gdpHistory })
				.from(economy)
				.where(eq(economy.iso2, upper));
			return row?.data ?? null;
		}
		case 'inflation': {
			const [row] = await db
				.select({ data: economy.inflationHistory })
				.from(economy)
				.where(eq(economy.iso2, upper));
			return row?.data ?? null;
		}
		case 'renewable': {
			const [row] = await db
				.select({ data: energy.renewableHistory })
				.from(energy)
				.where(eq(energy.iso2, upper));
			return row?.data ?? null;
		}
		case 'production': {
			const [row] = await db
				.select({ data: energy.productionHistory })
				.from(energy)
				.where(eq(energy.iso2, upper));
			return row?.data ?? null;
		}
		case 'consumption': {
			const [row] = await db
				.select({ data: energy.consumptionHistory })
				.from(energy)
				.where(eq(energy.iso2, upper));
			return row?.data ?? null;
		}
		case 'co2': {
			const [row] = await db
				.select({ data: energy.co2History })
				.from(energy)
				.where(eq(energy.iso2, upper));
			return row?.data ?? null;
		}
		case 'forestCoverage': {
			const [row] = await db
				.select({ data: environment.forestCoverageHistory })
				.from(environment)
				.where(eq(environment.iso2, upper));
			return row?.data ?? null;
		}
		case 'waterAccess': {
			const [row] = await db
				.select({ data: environment.waterAccess })
				.from(environment)
				.where(eq(environment.iso2, upper));
			return row?.data ?? null;
		}
		case 'militaryBudget': {
			const [row] = await db
				.select({ data: military.budgetHistory })
				.from(military)
				.where(eq(military.iso2, upper));
			return row?.data ?? null;
		}
		case 'visitors': {
			const [row] = await db
				.select({ data: tourism.visitorsHistory })
				.from(tourism)
				.where(eq(tourism.iso2, upper));
			return row?.data ?? null;
		}
		case 'population': {
			const [row] = await db
				.select({ data: demographics.populationHistory })
				.from(demographics)
				.where(eq(demographics.iso2, upper));
			return row?.data ?? null;
		}
		case 'density': {
			const [row] = await db
				.select({ data: demographics.density })
				.from(demographics)
				.where(eq(demographics.iso2, upper));
			return row?.data ?? null;
		}
		case 'urbanization': {
			const [row] = await db
				.select({ data: demographics.urbanization })
				.from(demographics)
				.where(eq(demographics.iso2, upper));
			return row?.data ?? null;
		}
		case 'medianAge': {
			const [row] = await db
				.select({ data: demographics.medianAge })
				.from(demographics)
				.where(eq(demographics.iso2, upper));
			return row?.data ?? null;
		}
		case 'healthcareSpending': {
			const [row] = await db
				.select({ data: demographics.healthcareSpending })
				.from(demographics)
				.where(eq(demographics.iso2, upper));
			return row?.data ?? null;
		}
		case 'hospitalBeds': {
			const [row] = await db
				.select({ data: demographics.hospitalBeds })
				.from(demographics)
				.where(eq(demographics.iso2, upper));
			return row?.data ?? null;
		}
		case 'infantMortality': {
			const [row] = await db
				.select({ data: demographics.infantMortality })
				.from(demographics)
				.where(eq(demographics.iso2, upper));
			return row?.data ?? null;
		}
		case 'lifeExpectancy': {
			const [row] = await db
				.select({ data: demographics.lifeExpectancy })
				.from(demographics)
				.where(eq(demographics.iso2, upper));
			return row?.data ?? null;
		}
		case 'literacy': {
			const [row] = await db
				.select({ data: demographics.literacy })
				.from(demographics)
				.where(eq(demographics.iso2, upper));
			return row?.data ?? null;
		}
		default:
			console.warn(`Unknown indicator: ${indicator}`);
			return [];
	}
}

/*
 * Usage:
 *   const co2 = await getIndicatorHistory('FR', 'co2');
 *   co2?.slice(0, 5).forEach(({ year, value }) =>
 *     // console.log(year, (value / 1e6).toFixed(1) + 'Mt')
 *   );
 *
 *   const pop = await getIndicatorHistory('AW', 'population');
 *   // console.log(pop?.at(0)); // { year: 2024, value: 107995 }
 */

// ----
// 4. One scalar value per country (latest, or a specific year)
// ----

/**
 * Indicators whose current value is a dedicated scalar column — these are
 * returned directly without touching jsonb.
 */
export type ScalarIndicator =
	| 'gdp'
	| 'gdpPerCapita'
	| 'inflation'
	| 'worldRank'
	| 'corruptionIndex'
	| 'competitivenessIndex'
	| 'avgSalary'
	| 'minimumWage'
	| 'renewableShare'
	| 'co2'
	| 'energyProduction'
	| 'energyConsumption'
	| 'militaryRank'
	| 'militaryBudget'
	| 'militaryGdpPct'
	| 'activePersonnel'
	| 'forestCoverage'
	| 'airQuality'
	| 'envPerformance'
	| 'recyclingRate'
	| 'visitors'
	| 'tourismRanking'
	| 'revenueUsd'
	| 'safetyScore'
	| 'population'
	| 'literacy'
	| 'healthcareRank';

// TODO support year format
export async function getLatestIndicatorAllCountries(
	indicator: ScalarIndicator,
	year?: number
): Promise<{ iso2: string; name: string; value: number | null }[]> {
	// When a specific year is requested we need to dig into jsonb history.
	// For current values we query the scalar column directly — far cheaper.

	if (year !== undefined) {
		return getIndicatorForYear(indicator, year);
	}

	// Current-scalar queries — all return { iso2, name, value }
	switch (indicator) {
		// Economy
		case 'gdp':
			return db
				.select({ iso2: countries.iso2, name: countries.name, value: economy.gdpCurrent })
				.from(countries)
				.leftJoin(economy, eq(economy.iso2, countries.iso2))
				.where(isNotNull(economy.gdpCurrent))
				.orderBy(desc(economy.gdpCurrent));

		case 'gdpPerCapita':
			return db
				.select({ iso2: countries.iso2, name: countries.name, value: economy.perCapitaGdp })
				.from(countries)
				.leftJoin(economy, eq(economy.iso2, countries.iso2))
				.where(isNotNull(economy.perCapitaGdp))
				.orderBy(desc(economy.perCapitaGdp));

		case 'inflation':
			return db
				.select({ iso2: countries.iso2, name: countries.name, value: economy.inflationCurrent })
				.from(countries)
				.leftJoin(economy, eq(economy.iso2, countries.iso2))
				.where(isNotNull(economy.inflationCurrent))
				.orderBy(desc(economy.inflationCurrent));

		case 'worldRank':
			return db
				.select({ iso2: countries.iso2, name: countries.name, value: economy.worldRank })
				.from(countries)
				.leftJoin(economy, eq(economy.iso2, countries.iso2))
				.where(isNotNull(economy.worldRank))
				.orderBy(asc(economy.worldRank));

		case 'corruptionIndex':
			return db
				.select({ iso2: countries.iso2, name: countries.name, value: economy.corruptionIndex })
				.from(countries)
				.leftJoin(economy, eq(economy.iso2, countries.iso2))
				.where(isNotNull(economy.corruptionIndex))
				.orderBy(desc(economy.corruptionIndex));

		case 'competitivenessIndex':
			return db
				.select({ iso2: countries.iso2, name: countries.name, value: economy.competitivenessIndex })
				.from(countries)
				.leftJoin(economy, eq(economy.iso2, countries.iso2))
				.where(isNotNull(economy.competitivenessIndex))
				.orderBy(desc(economy.competitivenessIndex));

		case 'avgSalary':
			return db
				.select({ iso2: countries.iso2, name: countries.name, value: economy.avgSalary })
				.from(countries)
				.leftJoin(economy, eq(economy.iso2, countries.iso2))
				.where(isNotNull(economy.avgSalary))
				.orderBy(desc(economy.avgSalary));

		case 'minimumWage':
			return db
				.select({ iso2: countries.iso2, name: countries.name, value: economy.minimumWage })
				.from(countries)
				.leftJoin(economy, eq(economy.iso2, countries.iso2))
				.where(isNotNull(economy.minimumWage))
				.orderBy(desc(economy.minimumWage));

		// Energy
		case 'renewableShare':
			return db
				.select({ iso2: countries.iso2, name: countries.name, value: energy.renewableCurrent })
				.from(countries)
				.leftJoin(energy, eq(energy.iso2, countries.iso2))
				.where(isNotNull(energy.renewableCurrent))
				.orderBy(desc(energy.renewableCurrent));

		case 'co2':
			return db
				.select({ iso2: countries.iso2, name: countries.name, value: energy.co2Current })
				.from(countries)
				.leftJoin(energy, eq(energy.iso2, countries.iso2))
				.where(isNotNull(energy.co2Current))
				.orderBy(desc(energy.co2Current));

		case 'energyProduction':
			return db
				.select({ iso2: countries.iso2, name: countries.name, value: energy.productionCurrent })
				.from(countries)
				.leftJoin(energy, eq(energy.iso2, countries.iso2))
				.where(isNotNull(energy.productionCurrent))
				.orderBy(desc(energy.productionCurrent));

		case 'energyConsumption':
			return db
				.select({ iso2: countries.iso2, name: countries.name, value: energy.consumptionCurrent })
				.from(countries)
				.leftJoin(energy, eq(energy.iso2, countries.iso2))
				.where(isNotNull(energy.consumptionCurrent))
				.orderBy(desc(energy.consumptionCurrent));

		// Military
		case 'militaryRank':
			return db
				.select({ iso2: countries.iso2, name: countries.name, value: military.globalRank })
				.from(countries)
				.leftJoin(military, eq(military.iso2, countries.iso2))
				.where(isNotNull(military.globalRank))
				.orderBy(asc(military.globalRank));

		case 'militaryBudget':
			return db
				.select({ iso2: countries.iso2, name: countries.name, value: military.budgetCurrent })
				.from(countries)
				.leftJoin(military, eq(military.iso2, countries.iso2))
				.where(isNotNull(military.budgetCurrent))
				.orderBy(desc(military.budgetCurrent));

		case 'militaryGdpPct':
			return db
				.select({ iso2: countries.iso2, name: countries.name, value: military.gdpPercentage })
				.from(countries)
				.leftJoin(military, eq(military.iso2, countries.iso2))
				.where(isNotNull(military.gdpPercentage))
				.orderBy(desc(military.gdpPercentage));

		case 'activePersonnel':
			return db
				.select({ iso2: countries.iso2, name: countries.name, value: military.activePersonnel })
				.from(countries)
				.leftJoin(military, eq(military.iso2, countries.iso2))
				.where(isNotNull(military.activePersonnel))
				.orderBy(desc(military.activePersonnel));

		// Environment
		case 'forestCoverage':
			return db
				.select({
					iso2: countries.iso2,
					name: countries.name,
					value: environment.forestCoverageCurrent
				})
				.from(countries)
				.leftJoin(environment, eq(environment.iso2, countries.iso2))
				.where(isNotNull(environment.forestCoverageCurrent))
				.orderBy(desc(environment.forestCoverageCurrent));

		case 'airQuality':
			return db
				.select({ iso2: countries.iso2, name: countries.name, value: environment.airQuality })
				.from(countries)
				.leftJoin(environment, eq(environment.iso2, countries.iso2))
				.where(isNotNull(environment.airQuality))
				.orderBy(desc(environment.airQuality));

		case 'envPerformance':
			return db
				.select({
					iso2: countries.iso2,
					name: countries.name,
					value: environment.envPerformanceIndex
				})
				.from(countries)
				.leftJoin(environment, eq(environment.iso2, countries.iso2))
				.where(isNotNull(environment.envPerformanceIndex))
				.orderBy(desc(environment.envPerformanceIndex));

		case 'recyclingRate':
			return db
				.select({
					iso2: countries.iso2,
					name: countries.name,
					value: environment.recyclingRateIndex
				})
				.from(countries)
				.leftJoin(environment, eq(environment.iso2, countries.iso2))
				.where(isNotNull(environment.recyclingRateIndex))
				.orderBy(desc(environment.recyclingRateIndex));

		// Tourism
		case 'visitors':
			return db
				.select({ iso2: countries.iso2, name: countries.name, value: tourism.visitorsCurrent })
				.from(countries)
				.leftJoin(tourism, eq(tourism.iso2, countries.iso2))
				.where(isNotNull(tourism.visitorsCurrent))
				.orderBy(desc(tourism.visitorsCurrent));

		case 'tourismRanking':
			return db
				.select({ iso2: countries.iso2, name: countries.name, value: tourism.tourismRanking })
				.from(countries)
				.leftJoin(tourism, eq(tourism.iso2, countries.iso2))
				.where(isNotNull(tourism.tourismRanking))
				.orderBy(asc(tourism.tourismRanking));

		case 'revenueUsd':
			return db
				.select({ iso2: countries.iso2, name: countries.name, value: tourism.revenueUsd })
				.from(countries)
				.leftJoin(tourism, eq(tourism.iso2, countries.iso2))
				.where(isNotNull(tourism.revenueUsd))
				.orderBy(desc(tourism.revenueUsd));

		case 'safetyScore':
			return db
				.select({ iso2: countries.iso2, name: countries.name, value: tourism.safetyScore })
				.from(countries)
				.leftJoin(tourism, eq(tourism.iso2, countries.iso2))
				.where(isNotNull(tourism.safetyScore))
				.orderBy(desc(tourism.safetyScore));

		// Demographics
		case 'population':
			return db
				.select({
					iso2: countries.iso2,
					name: countries.name,
					value: demographics.populationCurrent
				})
				.from(countries)
				.leftJoin(demographics, eq(demographics.iso2, countries.iso2))
				.where(isNotNull(demographics.populationCurrent))
				.orderBy(desc(demographics.populationCurrent));

		case 'literacy':
			return db
				.select({ iso2: countries.iso2, name: countries.name, value: demographics.literacyCurrent })
				.from(countries)
				.leftJoin(demographics, eq(demographics.iso2, countries.iso2))
				.where(isNotNull(demographics.literacyCurrent))
				.orderBy(desc(demographics.literacyCurrent));

		case 'healthcareRank':
			return db
				.select({ iso2: countries.iso2, name: countries.name, value: demographics.healthcareRank })
				.from(countries)
				.leftJoin(demographics, eq(demographics.iso2, countries.iso2))
				.where(isNotNull(demographics.healthcareRank))
				.orderBy(asc(demographics.healthcareRank));

		default:
			throw new Error(`Unknown indicator: ${indicator satisfies never}`);
	}
}

// ----
// Internal helper: extract one year from a jsonb history column for every country
// Uses a Postgres jsonb path expression — no client-side processing.
// ----

// Maps each ScalarIndicator to the table and jsonb history column it lives in
const INDICATOR_HISTORY_MAP: Record<
	ScalarIndicator,
	{
		table:
			| typeof economy
			| typeof energy
			| typeof environment
			| typeof military
			| typeof tourism
			| typeof demographics;
		column: string;
	}
> = {
	gdp: { table: economy, column: 'gdp_history' },
	gdpPerCapita: { table: economy, column: 'gdp_history' }, // no per-capita history
	inflation: { table: economy, column: 'inflation_history' },
	worldRank: { table: economy, column: 'gdp_history' },
	corruptionIndex: { table: economy, column: 'gdp_history' },
	competitivenessIndex: { table: economy, column: 'gdp_history' },
	avgSalary: { table: economy, column: 'gdp_history' },
	minimumWage: { table: economy, column: 'gdp_history' },
	renewableShare: { table: energy, column: 'renewable_history' },
	co2: { table: energy, column: 'co2_history' },
	energyProduction: { table: energy, column: 'production_history' },
	energyConsumption: { table: energy, column: 'consumption_history' },
	militaryRank: { table: military, column: 'budget_history' },
	militaryBudget: { table: military, column: 'budget_history' },
	militaryGdpPct: { table: military, column: 'budget_history' },
	activePersonnel: { table: military, column: 'budget_history' },
	forestCoverage: { table: environment, column: 'forest_coverage_history' },
	airQuality: { table: environment, column: 'forest_coverage_history' },
	envPerformance: { table: environment, column: 'forest_coverage_history' },
	recyclingRate: { table: environment, column: 'forest_coverage_history' },
	visitors: { table: tourism, column: 'visitors_history' },
	tourismRanking: { table: tourism, column: 'visitors_history' },
	revenueUsd: { table: tourism, column: 'visitors_history' },
	safetyScore: { table: tourism, column: 'visitors_history' },
	population: { table: demographics, column: 'population_history' },
	literacy: { table: demographics, column: 'literacy' },
	healthcareRank: { table: demographics, column: 'healthcare_spending' }
};

async function getIndicatorForYear(
	indicator: ScalarIndicator,
	year: number
): Promise<{ iso2: string; name: string; value: number | null }[]> {
	const { table, column } = INDICATOR_HISTORY_MAP[indicator];

	/**
	 * Use a Postgres jsonb path query:
	 *   jsonb_path_query_first(col, '$[*] ? (@.year == $y)', '{"y": 2020}')
	 * returns the first matching element, then ->> 'value' casts to text.
	 */
	const rows = await db
		.select({
			iso2: countries.iso2,
			name: countries.name,
			value: sql<number | null>`
				(jsonb_path_query_first(
					${sql.raw(`"${table[Symbol.for('drizzle:Name')]}"."${column}"`)},
					'$[*] ? (@.year == $year)',
					${JSON.stringify({ year })}::jsonb
				) ->> 'value')::float
			`
		})
		.from(countries)
		.leftJoin(table, eq(sql`${table}.iso2`, countries.iso2))
		.where(isNotNull(sql`${table}.iso2`))
		.orderBy(
			desc(sql`
			(jsonb_path_query_first(
				${sql.raw(`"${table[Symbol.for('drizzle:Name')]}"."${column}"`)},
				'$[*] ? (@.year == $year)',
				${JSON.stringify({ year })}::jsonb
			) ->> 'value')::float
		`)
		);

	return rows;
}
