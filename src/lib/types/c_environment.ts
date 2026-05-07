import { HistoricalData } from './c_shared';

export interface CountryEnvironment {
	iso2: string;
	lastUpdated: string;
	forestCoverage: Trend;
	protectedAreas: { name: string; size: string; designation: string }[];
	airQualityByCity: Record<string, number>;
	airQuality: number;
	waterAccess: HistoricalData[];
	recyclingRateIndex: number;

	threatenedSpecies: {
		mammal: number;
		birds: number;
		fishes: number;
	};

	naturalHazards: {
		//world risk index
		earthquakes: number;
		tsunamis: number;
		coastalFloodings: number;
		riverlineFloodings: number;
		cyclones: number;
		droughts: number;
		seaLevelRise: number;
	};
	envPerformanceIndex: number;
}

export interface Trend {
	current: number;
	year: number;
	trend: 'stable' | 'increasing' | 'decreasing';
	historicalData: HistoricalData[];
}
