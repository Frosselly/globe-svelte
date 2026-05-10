import { HistoricalData } from './c_shared';

export interface CountryTourism {
	iso2: string;
	lastUpdated: string;
	annualVisitors: AnnualVisitors;
	revenueFromVisitors: {
		usd: number; //million US dollars (nominal values)
		percentageGDP: number;
	};
	tourismRanking: number;
	unescoHeritageSites: number;
	visaRequirementsByCountry: Record<string, { requirement: string }>;
	safetyScore: number; // 0-100
	dailyBudget: DailyBudget;
	bestTimeToVisit: BestTimeToVisit;
	practicalInfo: PracticalInfo;
}

export interface AnnualVisitors {
	current: number;
	trend: 'increasing' | 'decreasing' | 'stable';
	historicalData: HistoricalData[];
}

export interface DailyBudget {
	low: number;
	mid: number;
	high: number;
	breakdown: {
		food: {
			low: number;
			mid: number;
			high: number;
		};
		accommodation: {
			low: number;
			mid: number;
			high: number;
		};
		transport: {
			low: number;
			mid: number;
			high: number;
		};
		activities: {
			low: number;
			mid: number;
			high: number;
		};
	};
	currency: string;
}

export interface BestTimeToVisit {
	months: number[];
	season: string;
	peakEvents: {
		name: string;
		month: number;
	}[];
}

export interface PracticalInfo {
	language?: string | undefined;
	timezone?: string | undefined;
	plugType?: string[] | undefined;
	internetSpeed:
		| {
				mbps: number;
				quality: 'slow' | 'moderate' | 'fast';
		  }
		| undefined;
}
