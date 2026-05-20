import type { HistoricalData } from './c_shared';

export interface CountryEconomy {
	iso2: string;
	lastUpdated: string;
	gdp: Trend;
	worldRankInEconomy: number;
	perCapitaGDP: number;
	inflation: Trend;
	unemploymentRank: number;
	economicalSectors: EconomicalSector[];
	trade: Trade;
	topExportedGoods: string[];
	businessEnvironment: BusinessEnvironment;
	majorCompanies: string[];
	labourMarket: LabourMarket;
}

export interface Trend {
	current: number;
	trend: 'growing' | 'declining' | 'stable';
	historicalData: HistoricalData[];
}

export interface EconomicalSector {
	name: string;
	percentage: number;
}

export interface Trade {
	exports: number;
	imports: number;
	balance: number;
}

export interface BusinessEnvironment {
	easeOfDoingBusiness: string;
	globalCompetitivenessIndex: number;
	corruptionPerceptionsIndex: number;
	globalInnovationIndex: number;
}

export interface LabourMarket {
	workforceGeneratedCash: number;
	averageSalary: number;
	minimumWage: number;
	avgWorkWeek: number;
}
