/**
 * Columns:
 *   key        — matches ScalarIndicator (for bar/map: latest value per country)
 *              — matches IndicatorKey    (for line: time series for one country)
 *   label      — shown in the combobox
 *   unit       — shown on axis / tooltip
 *   timeSeries — true if there is a year-by-year history column in the DB
 *   topic      — grouping in the combobox
 *   format     — how to display the value ('number' | 'percent' | 'currency' | 'rank')
 */

export type AnalysisOption = {
	key: string;
	scalarKey: string;
	historyKey: string | null;
	label: string;
	unit: string;
	timeSeries: boolean;
	topic: string;
	format: 'number' | 'percent' | 'currency' | 'rank';
};

export const ANALYSIS_OPTIONS: AnalysisOption[] = [
	// -- Economy
	{
		key: 'gdp',
		scalarKey: 'gdp',
		historyKey: 'gdpHistory',
		label: 'GDP (current US$)',
		unit: 'USD',
		timeSeries: true,
		topic: 'Economy',
		format: 'currency'
	},
	{
		key: 'gdpPerCapita',
		scalarKey: 'gdpPerCapita',
		historyKey: null,
		label: 'GDP per Capita',
		unit: 'USD',
		timeSeries: false,
		topic: 'Economy',
		format: 'currency'
	},
	{
		key: 'inflation',
		scalarKey: 'inflation',
		historyKey: 'inflationHistory',
		label: 'Inflation (%)',
		unit: '%',
		timeSeries: true,
		topic: 'Economy',
		format: 'percent'
	},
	{
		key: 'worldRank',
		scalarKey: 'worldRank',
		historyKey: null,
		label: 'Economy World Rank',
		unit: '',
		timeSeries: false,
		topic: 'Economy',
		format: 'rank'
	},
	{
		key: 'corruptionIndex',
		scalarKey: 'corruptionIndex',
		historyKey: null,
		label: 'Corruption Perceptions Index',
		unit: '',
		timeSeries: false,
		topic: 'Economy',
		format: 'number'
	},
	{
		key: 'competitivenessIndex',
		scalarKey: 'competitivenessIndex',
		historyKey: null,
		label: 'Global Competitiveness Index',
		unit: '',
		timeSeries: false,
		topic: 'Economy',
		format: 'number'
	},
	{
		key: 'avgSalary',
		scalarKey: 'avgSalary',
		historyKey: null,
		label: 'Average Salary (monthly)',
		unit: 'USD',
		timeSeries: false,
		topic: 'Economy',
		format: 'currency'
	},
	{
		key: 'minimumWage',
		scalarKey: 'minimumWage',
		historyKey: null,
		label: 'Minimum Wage (monthly)',
		unit: 'USD',
		timeSeries: false,
		topic: 'Economy',
		format: 'currency'
	},
	// -- Energy
	{
		key: 'renewableShare',
		scalarKey: 'renewableShare',
		historyKey: 'renewableHistory',
		label: 'Renewable Electricity (%)',
		unit: '%',
		timeSeries: true,
		topic: 'Energy',
		format: 'percent'
	},
	{
		key: 'co2',
		scalarKey: 'co2',
		historyKey: 'co2History',
		label: 'CO₂ Emissions (kt)',
		unit: 'kt',
		timeSeries: true,
		topic: 'Energy',
		format: 'number'
	},
	{
		key: 'production',
		scalarKey: 'energyProduction',
		historyKey: 'productionHistory',
		label: 'Energy Production (TWh)',
		unit: 'TWh',
		timeSeries: true,
		topic: 'Energy',
		format: 'number'
	},
	{
		key: 'consumption',
		scalarKey: 'energyConsumption',
		historyKey: 'consumptionHistory',
		label: 'Energy Consumption (TWh)',
		unit: 'TWh',
		timeSeries: true,
		topic: 'Energy',
		format: 'number'
	},
	// -- Military
	{
		key: 'militaryRank',
		scalarKey: 'militaryRank',
		historyKey: null,
		label: 'Military Power Rank',
		unit: '',
		timeSeries: false,
		topic: 'Military',
		format: 'rank'
	},
	{
		key: 'militaryBudget',
		scalarKey: 'militaryBudget',
		historyKey: 'budgetHistory',
		label: 'Military Budget (USD)',
		unit: 'USD',
		timeSeries: true,
		topic: 'Military',
		format: 'currency'
	},
	{
		key: 'militaryGdpPct',
		scalarKey: 'militaryGdpPct',
		historyKey: null,
		label: 'Military Spending (% GDP)',
		unit: '%',
		timeSeries: false,
		topic: 'Military',
		format: 'percent'
	},
	{
		key: 'activePersonnel',
		scalarKey: 'activePersonnel',
		historyKey: null,
		label: 'Active Military Personnel',
		unit: '',
		timeSeries: false,
		topic: 'Military',
		format: 'number'
	},
	// -- Environment
	{
		key: 'forestCoverage',
		scalarKey: 'forestCoverage',
		historyKey: 'forestCoverageHistory',
		label: 'Forest Coverage (%)',
		unit: '%',
		timeSeries: true,
		topic: 'Environment',
		format: 'percent'
	},
	{
		key: 'airQuality',
		scalarKey: 'airQuality',
		historyKey: null,
		label: 'Air Quality Index (EPI)',
		unit: '',
		timeSeries: false,
		topic: 'Environment',
		format: 'number'
	},
	{
		key: 'envPerformance',
		scalarKey: 'envPerformance',
		historyKey: null,
		label: 'Environmental Performance Index',
		unit: '',
		timeSeries: false,
		topic: 'Environment',
		format: 'number'
	},
	{
		key: 'recyclingRate',
		scalarKey: 'recyclingRate',
		historyKey: null,
		label: 'Recycling Rate Index',
		unit: '',
		timeSeries: false,
		topic: 'Environment',
		format: 'number'
	},
	// -- Tourism
	{
		key: 'visitors',
		scalarKey: 'visitors',
		historyKey: 'visitorsHistory',
		label: 'Annual Visitors (thousands)',
		unit: 'k',
		timeSeries: true,
		topic: 'Tourism',
		format: 'number'
	},
	{
		key: 'tourismRanking',
		scalarKey: 'tourismRanking',
		historyKey: null,
		label: 'Tourism World Ranking',
		unit: '',
		timeSeries: false,
		topic: 'Tourism',
		format: 'rank'
	},
	{
		key: 'revenueUsd',
		scalarKey: 'revenueUsd',
		historyKey: null,
		label: 'Tourism Revenue (million USD)',
		unit: 'M USD',
		timeSeries: false,
		topic: 'Tourism',
		format: 'currency'
	},
	{
		key: 'safetyScore',
		scalarKey: 'safetyScore',
		historyKey: null,
		label: 'Safety Score (0-100)',
		unit: '',
		timeSeries: false,
		topic: 'Tourism',
		format: 'number'
	},
	// -- Demographics
	{
		key: 'population',
		scalarKey: 'population',
		historyKey: 'populationHistory',
		label: 'Population',
		unit: '',
		timeSeries: true,
		topic: 'Demographics',
		format: 'number'
	},
	{
		key: 'literacy',
		scalarKey: 'literacy',
		historyKey: 'literacy',
		label: 'Literacy Rate (%)',
		unit: '%',
		timeSeries: true,
		topic: 'Demographics',
		format: 'percent'
	},
	{
		key: 'healthcareRank',
		scalarKey: 'healthcareRank',
		historyKey: null,
		label: 'Healthcare System Rank',
		unit: '',
		timeSeries: false,
		topic: 'Demographics',
		format: 'rank'
	}
];

// Keyed lookup used by routes and graph component
export const OPTION_BY_KEY = Object.fromEntries(ANALYSIS_OPTIONS.map((o) => [o.key, o]));
