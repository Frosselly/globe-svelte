/**
 * src/lib/core/stores/store.svelte.ts
 *
 * Single source of truth for all client-side UI state.
 *
 * Sections:
 *   1. UI state              – mode, sidebar tab
 *   2. Types                 – CountryIndex, CountrySnapshot, CountryHistory
 *   3. CountriesStore        – lightweight index (iso2 → metadata)
 *   4. SelectedCountryStore  – current country with lazy full-snapshot fetch
 */

// -- 1. UI state ---------------

export type Mode = 'map' | 'analysis';
export type SidebarTab = 'countryInfo' | 'saved';

export const modeState = $state({ selected: 'map' as Mode });
export const sidebarState = $state({ selected: 'countryInfo' as SidebarTab });

export function setSelectedMode(mode: Mode) {
	modeState.selected = mode;
}
export function setSelectedSidebar(tab: SidebarTab) {
	sidebarState.selected = tab;
}

// -- 2. Types ------------------

/** Minimal row from the DB countries table — enough for map + search. */
export type CountryIndex = {
	iso2: string;
	iso3: string;
	name: string;
	capital: string | null;
	region: string | null;
	subregion: string | null;
	latlng: number[] | null;
	flagEmoji: string | null;
	flagSvg: string | null;
	population: number | null;
	area: number | null;
	timezones: string[] | null;
	borders: string[] | null;
	continents: string[] | null;
};

/**
 * Full snapshot — index row plus all scalar topic columns.
 * Matches what /api/country/[iso2] returns (getCountrySnapshot).
 * Does NOT include history arrays — those are in CountryHistory.
 */
export type CountrySnapshot = CountryIndex & {
	// Economy
	gdpCurrent?: number | null;
	gdpTrend?: string | null;
	worldRank?: number | null;
	perCapitaGdp?: number | null;
	inflationCurrent?: number | null;
	inflationTrend?: string | null;
	economicalSectors?: { name: string; percentage: number }[] | null;
	trade?: { exports: number; imports: number; balance: number } | null;
	topExportedGoods?: string[] | null;
	businessEnvironment?: {
		easeOfDoingBusiness: string;
		globalCompetitivenessIndex: number;
		corruptionPerceptionsIndex: number;
		globalInnovationIndex: number;
	} | null;
	majorCompanies?: string[] | null;
	labourMarket?: {
		workforceGeneratedCash: number;
		averageSalary: number;
		minimumWage: number;
		avgWorkWeek: number;
	} | null;
	// Energy
	renewableCurrent?: number | null;
	renewableTrend?: string | null;
	productionCurrent?: number | null;
	consumptionCurrent?: number | null;
	co2Current?: number | null;
	energyMixCurrent?: { name: string; percentage: number }[] | null;
	targets?: any[] | null;
	// Military
	militaryRank?: number | null;
	budgetCurrent?: number | null;
	budgetTrend?: string | null;
	gdpPercentage?: number | null;
	activePersonnel?: number | null;
	reservePersonnel?: number | null;
	branches?: any[] | null;
	equipment?: any[] | null;
	alliances?: any[] | null;
	capabilities?: any[] | null;
	// Environment
	forestCoverageCurrent?: number | null;
	forestCoverageTrend?: string | null;
	airQuality?: number | null;
	recyclingRateIndex?: number | null;
	envPerformanceIndex?: number | null;
	threatenedSpecies?: { mammal: number; birds: number; fishes: number } | null;
	naturalHazards?: any | null;
	protectedAreas?: { name: string; size: string; designation: string }[] | null;
	// Tourism
	visitorsCurrent?: number | null;
	visitorsTrend?: string | null;
	tourismRanking?: number | null;
	revenueUsd?: number | null;
	revenuePercentageGdp?: number | null;
	unescoSites?: number | null;
	safetyScore?: number | null;
	practicalInfo?: any | null;
	// Demographics
	populationCurrent?: number | null;
	populationTrend?: string | null;
	literacyCurrent?: number | null;
	healthcareRank?: number | null;
	ethnicGroups?: { group: string; percentage: number | null }[] | null;
};

/** History arrays merged in after loadHistory(). */
export type CountryHistory = {
	gdpHistory?: { year: number; value: number }[];
	inflationHistory?: { year: number; value: number }[];
	renewableHistory?: { year: number; value: number }[];
	productionHistory?: { year: number; value: number }[];
	consumptionHistory?: { year: number; value: number }[];
	co2History?: { year: number; value: number }[];
	forestCoverageHistory?: { year: number; value: number }[];
	waterAccess?: { year: number; value: number }[];
	budgetHistory?: { year: number; value: number }[];
	visitorsHistory?: { year: number; value: number }[];
	populationHistory?: { year: number; value: number }[];
	density?: { year: number; value: number }[];
	urbanization?: { year: number; value: number }[];
	medianAge?: { year: number; value: number }[];
	healthcareSpending?: { year: number; value: number }[];
	hospitalBeds?: { year: number; value: number }[];
	infantMortality?: { year: number; value: number }[];
	lifeExpectancy?: { year: number; value: number }[];
	literacy?: { year: number; value: number }[];
};

export type FullCountry = CountrySnapshot & CountryHistory;

// -- 3. CountriesStore ---------

class CountriesStore {
	countries = $state<Record<string, CountryIndex>>({});
	loaded = $state(false);

	setCountries(data: Record<string, CountryIndex>) {
		this.countries = data;
		this.loaded = true;
	}

	get list(): CountryIndex[] {
		return Object.values(this.countries).sort((a, b) => a.name.localeCompare(b.name));
	}

	getByIso2(iso2: string): CountryIndex | undefined {
		return this.countries[iso2.toUpperCase()];
	}
}

export const countriesStore = new CountriesStore();

// -- 4. SelectedCountryStore ---

class SelectedCountryStore {
	country = $state<FullCountry | null>(null);
	loading = $state(false);
	historyLoaded = $state(false);
	error = $state<string | null>(null);

	private snapshotCache = new Map<string, CountrySnapshot>();
	private historyCache = new Map<string, CountryHistory>();

	async selectCountry(iso2: string) {
		if (!iso2) {
			this.country = null;
		}
		const upper = iso2.toUpperCase();
		this.error = null;
		this.historyLoaded = this.historyCache.has(upper);

		// Instant: show index row straight away
		const indexRow = countriesStore.getByIso2(upper);
		if (indexRow) this.country = indexRow as FullCountry;

		// Cache hit
		if (this.snapshotCache.has(upper)) {
			const history = this.historyCache.get(upper) ?? {};
			this.country = { ...this.snapshotCache.get(upper)!, ...history } as FullCountry;
			return;
		}

		// Fetch snapshot
		this.loading = true;
		try {
			const res = await fetch(`/api/country/${upper}`);
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			const data: CountrySnapshot = await res.json();
			this.snapshotCache.set(upper, data);
			this.country = { ...data, ...(this.historyCache.get(upper) ?? {}) } as FullCountry;
		} catch (err: any) {
			console.error('[selectedCountryStore] snapshot failed:', err);
			this.error = err.message ?? 'Failed to load country';
		}
		this.loading = false;
	}

	/**
	 * Fetch time-series history on demand.
	 * Call this inside a sidebar topic component
	 * when its trend/chart section becomes visible.
	 */
	async loadHistory(iso2?: string) {
		const upper = (iso2 ?? this.country?.iso2)?.toUpperCase();
		if (!upper) return;
		if (this.historyCache.has(upper)) {
			this.historyLoaded = true;
			return;
		}

		try {
			const res = await fetch(`/api/country/${upper}?full=1`);
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			const data: FullCountry = await res.json();

			const history: CountryHistory = {
				gdpHistory: data.gdpHistory,
				inflationHistory: data.inflationHistory,
				renewableHistory: data.renewableHistory,
				productionHistory: data.productionHistory,
				consumptionHistory: data.consumptionHistory,
				co2History: data.co2History,
				forestCoverageHistory: data.forestCoverageHistory,
				waterAccess: data.waterAccess,
				budgetHistory: data.budgetHistory,
				visitorsHistory: data.visitorsHistory,
				populationHistory: data.populationHistory,
				density: data.density,
				urbanization: data.urbanization,
				medianAge: data.medianAge,
				healthcareSpending: data.healthcareSpending,
				hospitalBeds: data.hospitalBeds,
				infantMortality: data.infantMortality,
				lifeExpectancy: data.lifeExpectancy,
				literacy: data.literacy
			};

			this.historyCache.set(upper, history);
			if (this.country?.iso2 === upper) {
				this.country = { ...this.country, ...history } as FullCountry;
				this.historyLoaded = true;
			}
		} catch (err) {
			console.error('[selectedCountryStore] history failed:', err);
		}
	}

	get name(): string | null {
		return (this.country as any)?.metadata?.name?.common ?? this.country?.name ?? null;
	}
}

export const selectedCountryStore = new SelectedCountryStore();
