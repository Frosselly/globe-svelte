import type { HistoricalData } from './c_shared';
export interface CountryEnergy {
	lastUpdated: string;
	iso2: string;
	renewableGrowth: RenewableGrowth;
	production: TimeSeries;
	consumption: TimeSeries;
	co2Emissions: TimeSeries;

	energyMix: TimeSeries<EnergyMixSource[]>;
	renewableSources: RenewableSource[];
	infrastructure?: InfrastructureFact[];
	targets: EnergyTarget[];
	energyRank: number;
}

export interface TimeSeries<T = number> {
	current: T;
	historicalData: HistoricalData<T>[];
}

export interface RenewableGrowth {
	current: number;
	trend: 'increasing' | 'decreasing' | 'stable';
	historicalData: Array<{
		year: number;
		value: number;
	}>;
}

export interface EnergyMixSource {
	name: string;
	percentage: number;
}

export interface RenewableSource {
	name: string;
	percentage: number;
}

export interface InfrastructureFact {
	title: string;
	description: string;
}

export interface EnergyTarget {
	title: string;
	desription: string;
	status: string;
	startYear: number;
	endYear: number;
	source: string;
	learnMore: string;
}
