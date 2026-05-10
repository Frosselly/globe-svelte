import { CountryDemographics } from './c_demographics';
import type { CountryEconomy } from './c_economy';
import type { CountryEnergy } from './c_energy';
import { CountryEnvironment } from './c_environment';
import type { FactbookCountry } from './c_factbook';
import type { CountryHealthData } from './c_health';
import type { CountryMetadata } from './c_metadata';
import type { CountryMilitary } from './c_miliatry';
import type { CountryTourism } from './c_tourism';

export interface FullCountryDataV2 {
	metadata?: CountryMetadata;
	generalInfo?: GeneralInfo;
	tourismInfo?: CountryTourism;
	economyInfo?: CountryEconomy;
	energyInfo?: CountryEnergy;
	militaryInfo?: CountryMilitary;
	environmentInfo?: CountryEnvironment;
	demographicsInfo?: CountryDemographics;
}

export interface GeneralInfo {
	name: string;
	capital: string;
	flagUrl: string;
	population: number;
	area: number;
	gdp: number;
}
