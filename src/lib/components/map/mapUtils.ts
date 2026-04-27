import { formatLargeNumbers } from '$lib/utils/utils';
import { Deck } from '@deck.gl/core';
import { ColumnLayer } from '@deck.gl/layers';
import { MapboxOverlay } from '@deck.gl/mapbox';
import maplibregl from 'maplibre-gl';

// mapUtils.ts - Reusable map functions
export async function loadGeoData(url: string) {
	const response = await fetch(url);
	return response.json();
}

export function createColorExpression(minValue: number, maxValue: number) {
	return [
		'case',
		['!=', ['get', 'value'], null],
		[
			'interpolate',
			['linear'],
			['get', 'value'],
			minValue,
			'#1a9850',
			(minValue + maxValue) / 2,
			'#fee090',
			maxValue,
			'#d73027'
		],
		'#cccccc' // Gray for no data
	];
}

export function setupMapLayers(map: any, opacity: [number, number]) {
	cleanOldFlatLayers(map);

	map.addLayer({
		id: 'state-fills',
		type: 'fill',
		source: 'countries',
		layout: {},
		paint: {
			'fill-color': 'white',
			'fill-opacity': ['case', ['boolean', ['feature-state', 'hover'], false], ...opacity]
		}
	});

	map.addLayer({
		id: 'state-borders',
		type: 'line',
		source: 'countries',
		layout: {},
		paint: {
			'line-color': '#627BC1',
			'line-width': 2
		}
	});
}

function cleanOldFlatLayers(map: any) {
	if (map.getLayer('state-fills')) {
		map.removeLayer('state-fills');
	}
	if (map.getLayer('state-borders')) {
		map.removeLayer('state-borders');
	}
}

function cleanOld3DLayers(map: any) {
	if (map.getLayer('state-fills-3d')) {
		map.removeLayer('state-fills-3d');
	}
}

export function setupFlatDisplay(map: any, colorExpression: any, labelName: string) {
	if (!labelName) {
		console.warn('Missing label for flat display');
		return;
	}

	cleanOldFlatLayers(map);
	cleanOld3DLayers(map);

	// Add flat fill layer
	map.addLayer({
		id: 'state-fills',
		type: 'fill',
		source: 'countries',
		layout: {},
		paint: {
			'fill-color': colorExpression,
			'fill-opacity': ['case', ['boolean', ['feature-state', 'hover'], false], 0.8, 0.7]
		}
	});

	map.addLayer({
		id: 'state-borders',
		type: 'line',
		source: 'countries',
		layout: {},
		paint: {
			'line-color': '#627BC1',
			'line-width': 2
		}
	});

	//Setup label for display

	const label = new maplibregl.Popup({
		closeButton: false,
		className: 'custom-popup',
		offset: 25
	});

	map.on('mousemove', 'state-fills', (e: any) => {
		if (e.features.length > 0) {
			const val = formatLargeNumbers(Number(e.features[0].properties.value));

			label.setText(`${labelName}: ${val}`);
			label.setLngLat(e.lngLat).addTo(map);
		}
	});

	map.on('mouseleave', 'state-fills', () => {
		label.remove();
	});
}

export function getColumnColor(value: number, maxValue: number) {
	const ratio = value / maxValue;
	if (ratio < 0.33) {
		return [211, 48, 39, 200]; // Red
	} else if (ratio < 0.66) {
		return [254, 224, 144, 200]; // Yellow
	} else {
		return [26, 152, 80, 200]; // Green
	}
}

export function setupColumnsDisplay(map: any, geoData: any, valueData: any, scale: any) {
	if (map.getLayer('state-fills')) map.removeLayer('state-fills');
	if (map.getLayer('state-borders')) map.removeLayer('state-borders');

	// Build lookup by both iso3 and iso2 for maximum match coverage
	const byIso3 = Object.fromEntries(valueData.map((d: any) => [d.iso3, d]));
	const byIso2 = Object.fromEntries(valueData.map((d: any) => [d.iso2, d]));

	const columnData = geoData.features
		.map((feature: any) => {
			const iso3 = feature.properties.adm0_a3;
			const iso2 = feature.id ?? feature.properties.iso_a2_eh;
			const item = byIso3[iso3] ?? byIso2[iso2];

			if (!item) return null;

			const labelX = feature.properties.label_x;
			const labelY = feature.properties.label_y;
			if (labelX == null || labelY == null) return null;

			return {
				position: [labelX, labelY] as [number, number],
				height: Math.max(item.value / scale.max, 0.01) * 500000,
				value: item.value,
				iso3,
				name: feature.properties.name || iso3
			};
		})
		.filter(Boolean);

	console.log(`[columns] ${columnData.length} columns from ${valueData.length} value entries`);

	if (!columnData.length) {
		console.warn('[columns] No column data — check iso3/iso2 matching');
		return null;
	}

	const columnLayer = new ColumnLayer({
		id: 'column-layer',
		data: columnData,
		diskResolution: 12,
		radius: 40000,
		extruded: true,
		getPosition: (d: any) => d.position,
		getElevation: (d: any) => d.height,
		getFillColor: (d: any) => getColumnColor(d.value, scale.max),
		pickable: true,
		autoHighlight: true,
		highlightColor: [255, 255, 255, 80],
		onHover: (info: any) => {
			if (info.object) {
				map.getCanvas().style.cursor = 'pointer';
			} else {
				map.getCanvas().style.cursor = '';
			}
		},
		onClick: (info: any) => {
			if (info.object) {
				console.log('Clicked column:', info.object.name, info.object.value);
			}
		}
	});

	const overlay = new MapboxOverlay({
		interleaved: false,
		layers: [columnLayer]
	});

	map.addControl(overlay);
	return overlay;
}

export function cleanupDeckGL(overlay: any) {
	if (!overlay) return;
	try {
		// MapboxOverlay is removed from the map via removeControl
		overlay._map?.removeControl(overlay);
		overlay.finalize?.();
	} catch (e) {
		console.warn('cleanupDeckGL error:', e);
	}
}

export function setupMapInteractions(map: any, onCountryClick: Function, closePopup?: Function) {
	let hoveredStateId: any = null;

	//TODO: handle close popup
	// map.on('click', () => {
	// 	if (!hoveredStateId) {
	// 			closePopup();
	// 		}
	// });

	map.on('mousemove', 'state-fills', (e: any) => {
		if (e.features.length > 0) {
			if (hoveredStateId) {
				map.setFeatureState({ source: 'countries', id: hoveredStateId }, { hover: false });
			}

			hoveredStateId = e.features[0].id;
			map.setFeatureState({ source: 'countries', id: hoveredStateId }, { hover: true });
			map.getCanvas().style.cursor = 'pointer';
		}
	});

	map.on('mouseleave', 'state-fills', () => {
		if (hoveredStateId) {
			map.setFeatureState({ source: 'countries', id: hoveredStateId }, { hover: false });
		}
		hoveredStateId = null;
		map.getCanvas().style.cursor = '';
	});

	map.on('click', 'state-fills', (e: any) => {
		onCountryClick(e);
	});

	return { hoveredStateId };
}

// New: extract nested value from a dot-path key like "demographics.population.value"
export function getNestedValue(obj: any, path: string): number | null {
	const val = path.split('.').reduce((acc, key) => acc?.[key], obj);
	return val != null && !isNaN(Number(val)) ? Number(val) : null;
}

// New: build valueData from countriesStore instead of fetching
export function extractValueDataFromStore(
	countries: Record<string, any>,
	keyPath: string
): { iso2: string; iso3: string; value: number }[] {
	return Object.entries(countries)
		.map(([iso2, country]) => {
			const value = getNestedValue(country, keyPath);
			return value != null ? { iso2, iso3: country?.metadata?.iso3 ?? iso2, value } : null;
		})
		.filter(Boolean) as { iso2: string; iso3: string; value: number }[];
}

export function mergeDataWithGeo(
	geoData: any,
	valueData: { iso2: string; iso3: string; value: number }[]
) {
	const byIso3 = Object.fromEntries(valueData.map((d) => [d.iso3, d.value]));
	const byIso2 = Object.fromEntries(valueData.map((d) => [d.iso2, d.value]));

	geoData.features.forEach((feature: any) => {
		const iso3 = feature.properties.adm0_a3;
		const iso2 = feature.id ?? feature.properties.iso_a2_eh;
		feature.properties.value = byIso3[iso3] ?? byIso2[iso2] ?? null;
	});

	return geoData;
}

export function calculateColorScale(valueData: { value: number }[]) {
	const values = valueData.map((d) => d.value).filter((v) => v != null);
	return {
		min: Math.min(...values),
		max: Math.max(...values)
	};
}

// Rewritten prepareDataset — no fetching, reads from store
export async function prepareDataset(
	keyPath: string | null,
	countries: Record<string, any>,
	callbacks: {
		loadGeoData: (url: string) => Promise<any>;
		updateMapSource: (data: any) => void;
		updateStores: (dataset: string, scale: any) => void;
	}
) {
	const geoData = await callbacks.loadGeoData('http://localhost:5173/countries.geo.json');

	if (!keyPath) {
		callbacks.updateMapSource(geoData);
		return { geoData, valueData: [], scale: null };
	}

	const valueData = extractValueDataFromStore(countries, keyPath);

	if (!valueData.length) {
		console.warn(`No data found for key path: ${keyPath}`);
		callbacks.updateMapSource(geoData);
		return { geoData, valueData: [], scale: null };
	}

	const mergedData = mergeDataWithGeo(geoData, valueData);
	const scale = calculateColorScale(valueData);

	callbacks.updateMapSource(mergedData);
	callbacks.updateStores(keyPath, scale);

	return { geoData, valueData, scale };
}
