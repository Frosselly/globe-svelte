import { HistoricalData } from './c_shared';

export interface CountryDemographics {
	iso2: string;
	lastUpdated: string;
	population: Trend;
	density: HistoricalData[];
	urbanization: HistoricalData[];
	medianAge: HistoricalData[];
	ageDistribution: HistoricalData[];
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
