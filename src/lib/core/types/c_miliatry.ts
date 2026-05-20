import type { HistoricalData } from './c_shared';

export interface CountryMilitary {
	iso2: string;
	lastUpdated: string;
	budget: MilitaryBudget;
	militaryRank: number;
	gdpAllocation: GDPAllocation;
	personnel: MilitaryPersonnel;
	branches: MilitaryBranch[];
	equipment: MilitaryEquipment[];
	alliances: MilitaryAlliance[];
	organizations: string[];
	capabilities: MilitaryCapability[];
	spendingComparisons?: DefenseSpendingComparison[];
}

export interface MilitaryBudget {
	current: number;
	currency: string;
	year: number;
	trend: 'increasing' | 'decreasing' | 'stable';
	historicalData: HistoricalData[];
}

export interface GDPAllocation {
	percentageOfGDP: number;
	year: number;
}

export interface MilitaryPersonnel {
	active: number;
	reserve: number;
	paramilitary?: number;
}

export interface MilitaryBranch {
	name: string;
	personnel: number;
	equipment?: string[];
}

export interface MilitaryEquipment {
	category: string; // e.g., "Aircraft", "Tanks", "Naval Ships"
	count: number;
	types: string[];
}

export interface MilitaryAlliance {
	name: string;
	description: string;
	startDate: string;
	joinedDate: string;
}

export interface GlobalOrganization {
	name: string;
	type: string; // e.g., "UN", "NATO", "Regional Alliance"
	memberSince: number;
}

export interface MilitaryCapability {
	name: string;
	description: string;
}

export interface DefenseSpendingComparison {
	country: string;
	amount: number;
	year: number;
	percentageChange?: number;
}
