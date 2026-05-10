export type IndicatorRow = { iso2: string; name: string; value: number | null };

export const mapState = $state({
	currentDataset: '' as string,
	displayMode: 'none' as 'flat' | 'columns' | 'none',
	colorScale: { min: 0, max: 0 } as { min: number; max: number },
	mapInstance: null as any,
	deckInstance: null as any,
	indicatorRows: [] as IndicatorRow[],
	countryOutlinesJson: null as any
});

export function setCountryOutlines(dataset: any) {
	mapState.countryOutlinesJson = dataset;
}

export function setCurrentDataset(dataset: string) {
	mapState.currentDataset = dataset;
}

export function setDisplayMode(mode: 'flat' | 'columns' | 'none') {
	mapState.displayMode = mode;
}

export function setColorScale(scale: { min: number; max: number }) {
	mapState.colorScale = scale;
}

export function setMapInstance(map: any) {
	mapState.mapInstance = map;
}

export function setDeckInstance(deck: any) {
	mapState.deckInstance = deck;
}

export function setIndicatorRows(rows: IndicatorRow[]) {
	mapState.indicatorRows = rows;
}
