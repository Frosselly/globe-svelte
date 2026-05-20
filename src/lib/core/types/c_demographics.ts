import type { HistoricalData } from './c_shared';

export interface CountryDemographics {
	iso2: string;
	lastUpdated: string;
	population: Trend;
	density: HistoricalData[];
	urbanization: HistoricalData[];
	medianAge: HistoricalData[];
	ageDistribution: HistoricalData<{
		'Ages 65+': number;
		'Ages 25-64': number;
		'Ages 15-24': number;
		'Ages 5-14': number;
		'Under-5s': number;
	}>[];
	ethnicGroups: { group: string; percentage: number }[];
	literacy: HistoricalData[];

	health: {
		healthcareRank: number;
		lifeExpectancy: HistoricalData[];
		healthcareSpending: HistoricalData[];
		hospitalBeds: HistoricalData[];
		infantMortality: HistoricalData[];
		// majorCauses: number;
		// vaccination: number;
	};
}

export interface Trend {
	current: number;
	year: number;
	trend: 'stable' | 'increasing' | 'decreasing';
	historicalData: HistoricalData[];
}
