export interface CountryMetadataShort {
	name: string;
	cca2: string;
	cca3: string;
	ccn3: string;
	timezone: string;
	language: string;
	region: string;
}

//extracted from rest country
export interface CountryMetadata {
	cca2: string;
	cca3: string;
	ccn3: string;
	cioc: string;
	capital: string[];
	region: string;
	borders: string[];
	area: string;
	population: string;
	car: string;
	timezones: string[];
	continents: string[];
	flag: string;
	name: string;
	currencies: string;
	languages: string;
	latlng: string[];
	postalCode: string;
	gini: string;
}

export interface RESTCountry {
	tld: string[];
	cca2: string;
	ccn3: string;
	cca3: string;
	cioc: string;
	independent: boolean;
	status: string;
	unMember: boolean;
	idd: Idd;
	capital: string[];
	altSpellings: string[];
	region: string;
	subregion: string;
	landlocked: boolean;
	borders: string[];
	area: number;
	maps: Maps;
	population: number;
	fifa: string;
	car: Car;
	timezones: string[];
	continents: string[];
	flag: string;
	name: Name;
	currencies: Currencies;
	languages: Languages;
	latlng: number[];
	demonyms: Demonyms;
	translations: { [key: string]: Translation };
	gini: Gini;
	flags: Flags;
	coatOfArms: CoatOfArms;
	startOfWeek: string;
	capitalInfo: CapitalInfo;
	postalCode: PostalCode;
}

interface CapitalInfo {
	latlng: number[];
}

interface Car {
	signs: string[];
	side: string;
}

interface CoatOfArms {
	png: string;
	svg: string;
}

interface Currencies {
	[key: string]: {
		symbol: string;
		name: string;
	};
}

interface Eur {
	symbol: string;
	name: string;
}

interface Demonyms {
	eng: Eng;
	fra: Eng;
}

interface Eng {
	f: string;
	m: string;
}

interface Flags {
	png: string;
	svg: string;
	alt: string;
}

interface Gini {
	[key: string]: number;
}

interface Idd {
	root: string;
	suffixes: string[];
}

interface Languages {
	fra: string;
}

interface Maps {
	googleMaps: string;
	openStreetMaps: string;
}

interface Name {
	common: string;
	official: string;
	nativeName: NativeName;
}

interface NativeName {
	fra: Translation;
}

interface Translation {
	official: string;
	common: string;
}

interface PostalCode {
	format: string;
	regex: string;
}
