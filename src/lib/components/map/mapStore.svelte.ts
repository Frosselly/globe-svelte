// mapStore.svelte.ts
export let mapState = $state({
	mapInstance: null as any,
	currentDataset: '',
	colorScale: { min: 0, max: 0 },
	deckInstance: null as any,
	displayMode: 'none' as 'none' | 'flat' | 'columns',
	isLoading: false,
	error: null as string | null,
	isHidden: false
});

// Mutators (optional, but useful for encapsulation)
export function setMapInstance(value: any) {
	mapState.mapInstance = value;
}

export function setCurrentDataset(value: string) {
	mapState.currentDataset = value;
}

export function setColorScale(value: { min: number; max: number }) {
	mapState.colorScale = value;
}

export function setDeckInstance(value: any) {
	mapState.deckInstance = value;
}

export function setDisplayMode(value: 'flat' | 'columns' | 'none') {
	mapState.displayMode = value;
}

export function setIsLoading(value: boolean) {
	mapState.isLoading = value;
}

export function setError(value: string | null) {
	mapState.error = value;
}

export function setIsHidden(value: boolean) {
	mapState.isHidden = value;
}
