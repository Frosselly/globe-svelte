import { economy, energy, military, environment, tourism, demographics } from './schema';

//a file to change the queries indicators UNFINISHED

export const CONFIG = {
	// -- Economy ----------------
	gdp: {
		table: economy,
		col: 'gdpCurrent',
		hist: 'gdpHistory',
		label: 'GDP',
		unit: 'USD',
		format: 'currency'
	},
	gdpPerCapita: {
		table: economy,
		col: 'perCapitaGdp',
		hist: null,
		label: 'GDP per Capita',
		unit: 'USD',
		format: 'currency'
	},
	inflation: {
		table: economy,
		col: 'inflationCurrent',
		hist: 'inflationHistory',
		label: 'Inflation',
		unit: '%',
		format: 'percent'
	},
	worldRank: {
		table: economy,
		col: 'worldRank',
		hist: null,
		label: 'World Rank',
		unit: 'rank',
		format: 'rank'
	},
	corruptionIndex: {
		table: economy,
		col: 'corruptionIndex',
		hist: null,
		label: 'Corruption Index',
		unit: 'score',
		format: 'number'
	},
	competitivenessIndex: {
		table: economy,
		col: 'competitivenessIndex',
		hist: null,
		label: 'Competitiveness Index',
		unit: 'score',
		format: 'number'
	},
	avgSalary: {
		table: economy,
		col: 'avgSalary',
		hist: null,
		label: 'Average Salary',
		unit: 'USD',
		format: 'currency'
	},
	minimumWage: {
		table: economy,
		col: 'minimumWage',
		hist: null,
		label: 'Minimum Wage',
		unit: 'USD',
		format: 'currency'
	},

	// -- Energy -----------------
	renewableShare: {
		table: energy,
		col: 'renewableCurrent',
		hist: 'renewableHistory',
		label: 'Renewable Energy Share',
		unit: '%',
		format: 'percent'
	},
	co2: {
		table: energy,
		col: 'co2Current',
		hist: 'co2History',
		label: 'CO2 Emissions',
		unit: 'tons',
		format: 'number'
	},
	energyProduction: {
		table: energy,
		col: 'productionCurrent',
		hist: 'productionHistory',
		label: 'Energy Production',
		unit: 'kWh',
		format: 'number'
	},
	energyConsumption: {
		table: energy,
		col: 'consumptionCurrent',
		hist: 'consumptionHistory',
		label: 'Energy Consumption',
		unit: 'kWh',
		format: 'number'
	},
	energyMix: {
		table: energy,
		col: null,
		hist: 'energyMixHistory',
		label: 'Energy Mix',
		unit: '%',
		format: 'percent'
	},

	// -- Environment ------------
	forestCoverage: {
		table: environment,
		col: 'forestCoverageCurrent',
		hist: 'forestCoverageHistory',
		label: 'Forest Coverage',
		unit: '%',
		format: 'percent'
	},
	airQuality: {
		table: environment,
		col: 'airQuality',
		hist: null,
		label: 'Air Quality',
		unit: 'index',
		format: 'number'
	},
	envPerformance: {
		table: environment,
		col: 'envPerformanceIndex',
		hist: null,
		label: 'Env. Performance',
		unit: 'index',
		format: 'number'
	},
	recyclingRate: {
		table: environment,
		col: 'recyclingRateIndex',
		hist: null,
		label: 'Recycling Rate',
		unit: '%',
		format: 'percent'
	},
	waterAccess: {
		table: environment,
		col: null,
		hist: 'waterAccess',
		label: 'Water Access',
		unit: '%',
		format: 'percent'
	},

	// -- Military ---------------
	militaryRank: {
		table: military,
		col: 'globalRank',
		hist: null,
		label: 'Military Rank',
		unit: 'rank',
		format: 'rank'
	},
	militaryBudget: {
		table: military,
		col: 'budgetCurrent',
		hist: 'budgetHistory',
		label: 'Military Budget',
		unit: 'USD',
		format: 'currency'
	},
	militaryGdpPct: {
		table: military,
		col: 'gdpPercentage',
		hist: null,
		label: 'Military Spend % of GDP',
		unit: '%',
		format: 'percent'
	},
	activePersonnel: {
		table: military,
		col: 'activePersonnel',
		hist: null,
		label: 'Active Personnel',
		unit: 'count',
		format: 'number'
	},

	// -- Tourism ----------------
	visitors: {
		table: tourism,
		col: 'visitorsCurrent',
		hist: 'visitorsHistory',
		label: 'Annual Visitors',
		unit: 'people',
		format: 'number'
	},
	tourismRanking: {
		table: tourism,
		col: 'tourismRanking',
		hist: null,
		label: 'Tourism Ranking',
		unit: 'rank',
		format: 'rank'
	},
	revenueUsd: {
		table: tourism,
		col: 'revenueUsd',
		hist: null,
		label: 'Tourism Revenue',
		unit: 'USD',
		format: 'currency'
	},
	safetyScore: {
		table: tourism,
		col: 'safetyScore',
		hist: null,
		label: 'Safety Score',
		unit: 'index',
		format: 'number'
	},

	// -- Demographics -----------
	population: {
		table: demographics,
		col: 'populationCurrent',
		hist: 'populationHistory',
		label: 'Population',
		unit: 'people',
		format: 'number'
	},
	literacy: {
		table: demographics,
		col: 'literacyCurrent',
		hist: 'literacy',
		label: 'Literacy Rate',
		unit: '%',
		format: 'percent'
	},
	healthcareRank: {
		table: demographics,
		col: 'healthcareRank',
		hist: null,
		label: 'Healthcare Rank',
		unit: 'rank',
		format: 'rank'
	},
	density: {
		table: demographics,
		col: null,
		hist: 'density',
		label: 'Population Density',
		unit: 'pop/km²',
		format: 'number'
	},
	urbanization: {
		table: demographics,
		col: null,
		hist: 'urbanization',
		label: 'Urbanization',
		unit: '%',
		format: 'percent'
	},
	medianAge: {
		table: demographics,
		col: null,
		hist: 'medianAge',
		label: 'Median Age',
		unit: 'years',
		format: 'number'
	},
	healthcareSpending: {
		table: demographics,
		col: null,
		hist: 'healthcareSpending',
		label: 'Healthcare Spending',
		unit: '%',
		format: 'percent'
	},
	hospitalBeds: {
		table: demographics,
		col: null,
		hist: 'hospitalBeds',
		label: 'Hospital Beds',
		unit: 'per 1k',
		format: 'number'
	},
	infantMortality: {
		table: demographics,
		col: null,
		hist: 'infantMortality',
		label: 'Infant Mortality',
		unit: 'rate',
		format: 'number'
	},
	lifeExpectancy: {
		table: demographics,
		col: null,
		hist: 'lifeExpectancy',
		label: 'Life Expectancy',
		unit: 'years',
		format: 'number'
	}
} as const;

export type IndicatorId = keyof typeof CONFIG;

// Helper to get configuration safely
export function getIndicatorConfig(id: IndicatorId) {
	return CONFIG[id];
}
