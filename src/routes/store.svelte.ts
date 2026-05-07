import { writable, derived } from 'svelte/store';

export type Mode = 'map' | 'analysis';

export const modeState = $state({ selected: 'map' as 'map' | 'analysis' });
export const sidebarState = $state({ selected: 'countryInfo' as 'countryInfo' | 'saved' });
export const countryData = $state<any>({ countries: undefined });
export const isLoading = $state();

export function setSelectedSidebar(mode: 'countryInfo' | 'saved') {
	sidebarState.selected = mode;
}

export function setSelectedMode(mode: 'map' | 'analysis') {
	modeState.selected = mode;
}

export function setCountryData(data: any) {
	countryData.countries = data;
}

// Derived: only show panel when data is ready and mode is analysis
// export const showAnalysis = derived(
// 	[selectedMode, countryData],
// 	([$mode, $data]) => $mode === 'analysis' && $data !== null
// );

class SelectedCountryStore {
	country = $state<any>(undefined);

	loaded = $state(false);

	setCountry(data: any) {
		this.country = data;
		this.loaded = true;
	}
}

export const selectedCountryStore = new SelectedCountryStore();

class CountriesStore {
	countries = $state<any>(undefined);

	loaded = $state(false);

	setCountries(data: any) {
		this.countries = data;
		this.loaded = true;
	}
}

export const countriesStore = new CountriesStore();
