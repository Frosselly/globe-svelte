import { writable, derived } from 'svelte/store';

export type Mode = 'map' | 'analysis';

export interface CountryData {
	code: string;
	name: string;
	population: number;
	gdp: number;
	// ... your full shape here
}

export const modeState = $state({ selected: 'map' as 'map' | 'analysis' });
export const countryData = writable<CountryData | null>(null);
export const isLoading = writable(false);

export function setSelectedMode(mode: 'map' | 'analysis') {
	modeState.selected = mode;
}

// Derived: only show panel when data is ready and mode is analysis
// export const showAnalysis = derived(
// 	[selectedMode, countryData],
// 	([$mode, $data]) => $mode === 'analysis' && $data !== null
// );

// Actions — colocate with stores to keep components thin
export async function loadCountryData(code: string) {
	isLoading.set(true);
	countryData.set(null);
	try {
		const res = await fetch(`/api/countries/${code}`);
		const data: CountryData = await res.json();
		countryData.set(data);
	} finally {
		isLoading.set(false);
	}
}

export function resetCountry() {
	countryData.set(null);
	isLoading.set(false);
}
