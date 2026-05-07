export interface FactbookCountry {
    iso2: string;
    Introduction: Introduction;
    Geography: Geography;
    "People and Society": PeopleAndSociety;
    Environment: Environment;
    Government: Government;
    Economy: Economy;
    Energy: Energy;
    Communications: Communications;
    Transportation: Transportation;
    "Military and Security": MilitaryAndSecurity;
    Terrorism: Terrorism;
    "Transnational Issues": TransnationalIssues;
}

export interface Communications {
    "Telephones - fixed lines": Telephones;
    "Telephones - mobile cellular": Telephones;
    "Broadcast media": BroadcastMedia;
    "Internet country code": BroadcastMedia;
    "Internet users": InternetUsers;
    "Broadband - fixed subscriptions": BroadbandFixedSubscriptions;
}

export interface BroadbandFixedSubscriptions {
    total: BroadcastMedia;
    "subscriptions per 100 inhabitants": BroadcastMedia;
}

export interface BroadcastMedia {
    text: string;
}

export interface InternetUsers {
    "percent of population": BroadcastMedia;
}

export interface Telephones {
    "total subscriptions": BroadcastMedia;
    "subscriptions per 100 inhabitants": BroadcastMedia;
}

export interface Economy {
    "Economic overview": BroadcastMedia;
    "Real GDP (purchasing power parity)": RealGDPPurchasingPowerParity;
    "Real GDP growth rate": RealGDPGrowthRate;
    "Real GDP per capita": RealGDPPerCapita;
    "GDP (official exchange rate)": AgriculturalProducts;
    "Inflation rate (consumer prices)": InflationRateConsumerPrices;
    "GDP - composition, by sector of origin": GDPCompositionBySectorOfOrigin;
    "GDP - composition, by end use": GDPCompositionByEndUse;
    "Agricultural products": AgriculturalProducts;
    Industries: BroadcastMedia;
    "Industrial production growth rate": AgriculturalProducts;
    "Labor force": AgriculturalProducts;
    "Unemployment rate": UnemploymentRate;
    "Youth unemployment rate (ages 15-24)": YouthUnemploymentRateAges1524;
    "Population below poverty line": AgriculturalProducts;
    "Gini Index coefficient - distribution of family income": GiniIndexCoefficientDistributionOfFamilyIncome;
    "Household income or consumption by percentage share": HouseholdIncomeOrConsumptionByPercentageShare;
    Remittances: Remittances;
    Budget: Budget;
    "Public debt": PublicDebt;
    "Taxes and other revenues": AgriculturalProducts;
    "Current account balance": CurrentAccountBalance;
    Exports: Exports;
    "Exports - partners": AgriculturalProducts;
    "Exports - commodities": AgriculturalProducts;
    Imports: Imports;
    "Imports - partners": AgriculturalProducts;
    "Imports - commodities": AgriculturalProducts;
    "Reserves of foreign exchange and gold": ReservesOfForeignExchangeAndGold;
    "Debt - external": DebtExternal;
    "Exchange rates": ExchangeRates;
}

export interface AgriculturalProducts {
    text: string;
    note: string;
}

export interface Budget {
    revenues: BroadcastMedia;
    expenditures: BroadcastMedia;
    note: string;
}

export interface CurrentAccountBalance {
    "Current account balance 2024": BroadcastMedia;
    "Current account balance 2023": BroadcastMedia;
    "Current account balance 2022": BroadcastMedia;
    note: string;
}

export interface DebtExternal {
    "Debt - external 2023": BroadcastMedia;
    note: string;
}

export interface ExchangeRates {
    Currency: BroadcastMedia;
    "Exchange rates 2024": BroadcastMedia;
    "Exchange rates 2023": BroadcastMedia;
    "Exchange rates 2022": BroadcastMedia;
    "Exchange rates 2021": BroadcastMedia;
    "Exchange rates 2020": BroadcastMedia;
}

export interface Exports {
    "Exports 2024": BroadcastMedia;
    "Exports 2023": BroadcastMedia;
    "Exports 2022": BroadcastMedia;
    note: string;
}

export interface GDPCompositionByEndUse {
    "household consumption": BroadcastMedia;
    "government consumption": BroadcastMedia;
    "investment in fixed capital": BroadcastMedia;
    "investment in inventories": BroadcastMedia;
    "exports of goods and services": BroadcastMedia;
    "imports of goods and services": BroadcastMedia;
    note: string;
}

export interface GDPCompositionBySectorOfOrigin {
    agriculture: BroadcastMedia;
    industry: BroadcastMedia;
    services: BroadcastMedia;
    note: string;
}

export interface GiniIndexCoefficientDistributionOfFamilyIncome {
    "Gini Index coefficient - distribution of family income 2020": BroadcastMedia;
    note: string;
}

export interface HouseholdIncomeOrConsumptionByPercentageShare {
    "lowest 10%": BroadcastMedia;
    "highest 10%": BroadcastMedia;
    note: string;
}

export interface Imports {
    "Imports 2024": BroadcastMedia;
    "Imports 2023": BroadcastMedia;
    "Imports 2022": BroadcastMedia;
    note: string;
}

export interface InflationRateConsumerPrices {
    "Inflation rate (consumer prices) 2024": BroadcastMedia;
    "Inflation rate (consumer prices) 2023": BroadcastMedia;
    "Inflation rate (consumer prices) 2022": BroadcastMedia;
    note: string;
}

export interface PublicDebt {
    "Public debt 2021": BroadcastMedia;
    note: string;
}

export interface RealGDPPurchasingPowerParity {
    "Real GDP (purchasing power parity) 2024": BroadcastMedia;
    "Real GDP (purchasing power parity) 2023": BroadcastMedia;
    "Real GDP (purchasing power parity) 2022": BroadcastMedia;
    note: string;
}

export interface RealGDPGrowthRate {
    "Real GDP growth rate 2024": BroadcastMedia;
    "Real GDP growth rate 2023": BroadcastMedia;
    "Real GDP growth rate 2022": BroadcastMedia;
    note: string;
}

export interface RealGDPPerCapita {
    "Real GDP per capita 2024": BroadcastMedia;
    "Real GDP per capita 2023": BroadcastMedia;
    "Real GDP per capita 2022": BroadcastMedia;
    note: string;
}

export interface Remittances {
    "Remittances 2024": BroadcastMedia;
    "Remittances 2023": BroadcastMedia;
    "Remittances 2022": BroadcastMedia;
    note: string;
}

export interface ReservesOfForeignExchangeAndGold {
    "Reserves of foreign exchange and gold 2024": BroadcastMedia;
    "Reserves of foreign exchange and gold 2023": BroadcastMedia;
    "Reserves of foreign exchange and gold 2022": BroadcastMedia;
    note: string;
}

export interface UnemploymentRate {
    "Unemployment rate 2024": BroadcastMedia;
    "Unemployment rate 2023": BroadcastMedia;
    "Unemployment rate 2022": BroadcastMedia;
    note: string;
}

export interface YouthUnemploymentRateAges1524 {
    total: BroadcastMedia;
    male: BroadcastMedia;
    female: BroadcastMedia;
    note?: string;
}

export interface Energy {
    "Electricity access": ElectricityAccess;
    Electricity: Electricity;
    "Electricity generation sources": ElectricityGenerationSources;
    Coal: Coal;
    Petroleum: Petroleum;
    "Natural gas": NaturalGas;
    "Energy consumption per capita": EnergyConsumptionPerCapita;
}

export interface Coal {
    production: BroadcastMedia;
    consumption: BroadcastMedia;
    exports: BroadcastMedia;
    imports: BroadcastMedia;
    "proven reserves": BroadcastMedia;
}

export interface Electricity {
    "installed generating capacity": BroadcastMedia;
    consumption: BroadcastMedia;
    exports: BroadcastMedia;
    imports: BroadcastMedia;
    "transmission/distribution losses": BroadcastMedia;
}

export interface ElectricityAccess {
    "electrification - total population": BroadcastMedia;
}

export interface ElectricityGenerationSources {
    solar: BroadcastMedia;
    hydroelectricity: BroadcastMedia;
}

export interface EnergyConsumptionPerCapita {
    "Total energy consumption per capita 2023": BroadcastMedia;
}

export interface NaturalGas {
    production: BroadcastMedia;
    consumption: BroadcastMedia;
    "proven reserves": BroadcastMedia;
}

export interface Petroleum {
    "total petroleum production": BroadcastMedia;
    "refined petroleum consumption": BroadcastMedia;
    "crude oil estimated reserves": BroadcastMedia;
}

export interface Environment {
    "Environmental issues": BroadcastMedia;
    "International environmental agreements": InternationalEnvironmentalAgreements;
    Climate: BroadcastMedia;
    "Land use": LandUse;
    Urbanization: Urbanization;
    "Carbon dioxide emissions": CarbonDioxideEmissions;
    "Particulate matter emissions": BroadcastMedia;
    "Waste and recycling": WasteAndRecycling;
    "Total water withdrawal": TotalWaterWithdrawal;
    "Total renewable water resources": BroadcastMedia;
}

export interface CarbonDioxideEmissions {
    "total emissions": BroadcastMedia;
    "from coal and metallurgical coke": BroadcastMedia;
    "from petroleum and other liquids": BroadcastMedia;
    "from consumed natural gas": BroadcastMedia;
}

export interface InternationalEnvironmentalAgreements {
    "party to": BroadcastMedia;
    "signed, but not ratified": BroadcastMedia;
}

export interface LandUse {
    "agricultural land": BroadcastMedia;
    "agricultural land: arable land": BroadcastMedia;
    "agricultural land: permanent crops": BroadcastMedia;
    "agricultural land: permanent pasture": BroadcastMedia;
    forest: BroadcastMedia;
    other: BroadcastMedia;
}

export interface TotalWaterWithdrawal {
    municipal: BroadcastMedia;
    industrial: BroadcastMedia;
    agricultural: BroadcastMedia;
}

export interface Urbanization {
    "urban population": BroadcastMedia;
    "rate of urbanization": BroadcastMedia;
}

export interface WasteAndRecycling {
    "municipal solid waste generated annually": BroadcastMedia;
    "percent of municipal solid waste recycled": BroadcastMedia;
}

export interface Geography {
    Location: BroadcastMedia;
    "Geographic coordinates": BroadcastMedia;
    "Map references": BroadcastMedia;
    Area: Area;
    "Area - comparative": BroadcastMedia;
    "Land boundaries": LandBoundaries;
    Coastline: BroadcastMedia;
    "Maritime claims": MaritimeClaims;
    Climate: BroadcastMedia;
    Terrain: BroadcastMedia;
    Elevation: Elevation;
    "Natural resources": BroadcastMedia;
    "Land use": LandUse;
    "Irrigated land": BroadcastMedia;
    "Major lakes (area sq km)": MajorLakesAreaSqKM;
    "Major watersheds (area sq km)": MajorWatershedsAreaSqKM;
    "Population distribution": BroadcastMedia;
    "Natural hazards": BroadcastMedia;
    "Geography - note": BroadcastMedia;
}

export interface Area {
    "total ": BroadcastMedia;
    land: BroadcastMedia;
    water: BroadcastMedia;
}

export interface Elevation {
    "highest point": BroadcastMedia;
    "lowest point": BroadcastMedia;
    "mean elevation": BroadcastMedia;
}

export interface LandBoundaries {
    total: BroadcastMedia;
    "border countries": BroadcastMedia;
}

export interface MajorLakesAreaSqKM {
    "fresh water lake(s)": BroadcastMedia;
}

export interface MajorWatershedsAreaSqKM {
    "Atlantic Ocean drainage": BroadcastMedia;
}

export interface MaritimeClaims {
    "territorial sea": BroadcastMedia;
    "continental shelf": BroadcastMedia;
}

export interface Government {
    "Country name": CountryName;
    "Government type": BroadcastMedia;
    Capital: Capital;
    "Administrative divisions": BroadcastMedia;
    "Legal system": BroadcastMedia;
    Constitution: Constitution;
    "International law organization participation": BroadcastMedia;
    Citizenship: Citizenship;
    Suffrage: BroadcastMedia;
    "Executive branch": ExecutiveBranch;
    "Legislative branch": { [key: string]: BroadcastMedia };
    "Judicial branch": JudicialBranch;
    "Political parties": BroadcastMedia;
    "Diplomatic representation in the US": DiplomaticRepresentationInTheUS;
    "Diplomatic representation from the US": DiplomaticRepresentationFromTheUS;
    "International organization participation": AgriculturalProducts;
    Independence: BroadcastMedia;
    "National holiday": BroadcastMedia;
    Flag: BroadcastMedia;
    "National symbol(s)": BroadcastMedia;
    "National color(s)": BroadcastMedia;
    "National coat of arms": BroadcastMedia;
    "National anthem(s)": NationalAnthemS;
    "National heritage": NationalHeritage;
}

export interface Capital {
    name: BroadcastMedia;
    "geographic coordinates": BroadcastMedia;
    "time difference": BroadcastMedia;
    "daylight saving time": BroadcastMedia;
    etymology: BroadcastMedia;
}

export interface Citizenship {
    "citizenship by birth": BroadcastMedia;
    "citizenship by descent only": BroadcastMedia;
    "dual citizenship recognized": BroadcastMedia;
    "residency requirement for naturalization": BroadcastMedia;
}

export interface Constitution {
    history: BroadcastMedia;
    "amendment process": BroadcastMedia;
}

export interface CountryName {
    "conventional long form": BroadcastMedia;
    "conventional short form": BroadcastMedia;
    "local long form": BroadcastMedia;
    "local short form": BroadcastMedia;
    former: BroadcastMedia;
    etymology: BroadcastMedia;
}

export interface DiplomaticRepresentationFromTheUS {
    "chief of mission": BroadcastMedia;
    embassy: BroadcastMedia;
    "mailing address": BroadcastMedia;
    telephone: BroadcastMedia;
    FAX: BroadcastMedia;
    "email address and website": BroadcastMedia;
}

export interface DiplomaticRepresentationInTheUS {
    "chief of mission": BroadcastMedia;
    chancery: BroadcastMedia;
    telephone: BroadcastMedia;
    FAX: BroadcastMedia;
    "email address and website": BroadcastMedia;
    "consulate(s) general": BroadcastMedia;
}

export interface ExecutiveBranch {
    "chief of state": BroadcastMedia;
    "head of government": BroadcastMedia;
    cabinet: BroadcastMedia;
    "election/appointment process": BroadcastMedia;
    "most recent election date": BroadcastMedia;
    "election results": BroadcastMedia;
    "expected date of next election": BroadcastMedia;
}

export interface JudicialBranch {
    "highest court(s)": BroadcastMedia;
    "judge selection and term of office": BroadcastMedia;
    "subordinate courts": BroadcastMedia;
}

export interface NationalAnthemS {
    title: BroadcastMedia;
    "lyrics/music": BroadcastMedia;
    history: BroadcastMedia;
}

export interface NationalHeritage {
    "total World Heritage Sites": BroadcastMedia;
    "selected World Heritage Site locales": BroadcastMedia;
}

export interface Introduction {
    Background: BroadcastMedia;
}

export interface MilitaryAndSecurity {
    "Military and security forces": AgriculturalProducts;
    "Military expenditures": MilitaryExpenditures;
    "Military and security service personnel strengths": BroadcastMedia;
    "Military equipment inventories and acquisitions": BroadcastMedia;
    "Military service age and obligation": AgriculturalProducts;
    "Military deployments": BroadcastMedia;
    "Military - note": BroadcastMedia;
}

export interface MilitaryExpenditures {
    "Military Expenditures 2025": BroadcastMedia;
    "Military Expenditures 2024": BroadcastMedia;
    "Military Expenditures 2023": BroadcastMedia;
    "Military Expenditures 2022": BroadcastMedia;
    "Military Expenditures 2021": BroadcastMedia;
}

export interface PeopleAndSociety {
    Population: YouthUnemploymentRateAges1524;
    Nationality: Nationality;
    "Ethnic groups": AgriculturalProducts;
    Languages: Languages;
    Religions: AgriculturalProducts;
    "Age structure": AgeStructure;
    "Dependency ratios": DependencyRatios;
    "Median age": YouthUnemploymentRateAges1524;
    "Population growth rate": BroadcastMedia;
    "Birth rate": BroadcastMedia;
    "Death rate": BroadcastMedia;
    "Net migration rate": BroadcastMedia;
    "Population distribution": BroadcastMedia;
    Urbanization: Urbanization;
    "Major urban areas - population": BroadcastMedia;
    "Sex ratio": SexRatio;
    "Mother's mean age at first birth": BroadcastMedia;
    "Maternal mortality ratio": BroadcastMedia;
    "Infant mortality rate": YouthUnemploymentRateAges1524;
    "Life expectancy at birth": LifeExpectancyAtBirth;
    "Total fertility rate": BroadcastMedia;
    "Gross reproduction rate": BroadcastMedia;
    "Drinking water source": DrinkingWaterSource;
    "Health expenditure": HealthExpenditure;
    "Physician density": BroadcastMedia;
    "Hospital bed density": BroadcastMedia;
    "Sanitation facility access": DrinkingWaterSource;
    "Obesity - adult prevalence rate": BroadcastMedia;
    "Alcohol consumption per capita": AlcoholConsumptionPerCapita;
    "Tobacco use": YouthUnemploymentRateAges1524;
    "Children under the age of 5 years underweight": BroadcastMedia;
    "Currently married women (ages 15-49)": BroadcastMedia;
    "Child marriage": ChildMarriage;
    "Education expenditure": EducationExpenditure;
    Literacy: LifeExpectancyAtBirth;
    "School life expectancy (primary to tertiary education)": YouthUnemploymentRateAges1524;
}

export interface AgeStructure {
    "0-14 years": BroadcastMedia;
    "15-64 years": BroadcastMedia;
    "65 years and over": BroadcastMedia;
}

export interface AlcoholConsumptionPerCapita {
    total: BroadcastMedia;
    beer: BroadcastMedia;
    wine: BroadcastMedia;
    spirits: BroadcastMedia;
    "other alcohols": BroadcastMedia;
}

export interface ChildMarriage {
    "women married by age 15": BroadcastMedia;
    "women married by age 18": BroadcastMedia;
    "men married by age 18": BroadcastMedia;
}

export interface DependencyRatios {
    "total dependency ratio": BroadcastMedia;
    "youth dependency ratio": BroadcastMedia;
    "elderly dependency ratio": BroadcastMedia;
    "potential support ratio": BroadcastMedia;
}

export interface DrinkingWaterSource {
    "improved: urban": BroadcastMedia;
    "improved: rural": BroadcastMedia;
    "improved: total": BroadcastMedia;
    "unimproved: urban": BroadcastMedia;
    "unimproved: rural": BroadcastMedia;
    "unimproved: total": BroadcastMedia;
}

export interface EducationExpenditure {
    "Education expenditure (% GDP)": BroadcastMedia;
    "Education expenditure (% national budget)": BroadcastMedia;
}

export interface HealthExpenditure {
    "Health expenditure (as % of GDP)": BroadcastMedia;
    "Health expenditure (as % of national budget)": BroadcastMedia;
}

export interface Languages {
    Languages: BroadcastMedia;
    "major-language sample(s)": BroadcastMedia;
}

export interface LifeExpectancyAtBirth {
    "total population": BroadcastMedia;
    male: BroadcastMedia;
    female: BroadcastMedia;
}

export interface Nationality {
    noun: BroadcastMedia;
    adjective: BroadcastMedia;
}

export interface SexRatio {
    "at birth": BroadcastMedia;
    "0-14 years": BroadcastMedia;
    "15-64 years": BroadcastMedia;
    "65 years and over": BroadcastMedia;
    "total population": BroadcastMedia;
}

export interface Terrorism {
    "Terrorist group(s)": AgriculturalProducts;
}

export interface TransnationalIssues {
    "Refugees and internally displaced persons": RefugeesAndInternallyDisplacedPersons;
}

export interface RefugeesAndInternallyDisplacedPersons {
    refugees: BroadcastMedia;
    "stateless persons": BroadcastMedia;
}

export interface Transportation {
    "Civil aircraft registration country code prefix": BroadcastMedia;
    Airports: BroadcastMedia;
    Heliports: BroadcastMedia;
    Railways: Railways;
    "Merchant marine": MerchantMarine;
    Ports: Ports;
}

export interface MerchantMarine {
    total: BroadcastMedia;
    "by type": BroadcastMedia;
}

export interface Ports {
    "total ports": BroadcastMedia;
    large: BroadcastMedia;
    medium: BroadcastMedia;
    small: BroadcastMedia;
    "very small": BroadcastMedia;
    "ports with oil terminals": BroadcastMedia;
    "key ports": BroadcastMedia;
}

export interface Railways {
    total: BroadcastMedia;
    note: string;
}
