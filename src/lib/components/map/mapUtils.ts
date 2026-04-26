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

export async function loadValueData(dataSource: any) {
	// Handle different data sources (API, local, etc.)
	if (typeof dataSource === 'string') {
		const response = await fetch(dataSource);
		return response.json();
	}
	return dataSource;
}

export function mergeDataWithGeo(geoData: any, valueData: any) {
	const valueMap = Object.fromEntries(valueData.map((item: any) => [item.iso3, item.value]));

	geoData.features.forEach((feature: any) => {
		const iso3 = feature.properties.adm0_a3;
		feature.properties.value = valueMap[iso3] ?? null;
	});

	return geoData;
}

export function calculateColorScale(valueData: any) {
	const values = valueData.map((d: any) => d.value).filter((v: any) => v !== null);

	return {
		min: Math.min(...values),
		max: Math.max(...values)
	};
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
	// Remove flat layers
	if (map.getLayer('state-fills')) {
		map.removeLayer('state-fills');
	}
	if (map.getLayer('state-borders')) {
		map.removeLayer('state-borders');
	}

	// Create column data from GeoJSON using label coordinates
	const columnData = geoData.features
		.map((feature: any) => {
			const iso3 = feature.properties.adm0_a3;
			const valueItem = valueData.find((d: any) => d.iso3 === iso3);

			if (!valueItem || !feature.properties.label_x || !feature.properties.label_y) {
				return null;
			}

			return {
				position: [feature.properties.label_x, feature.properties.label_y],
				height: valueItem.value / 100,
				value: valueItem.value,
				iso3: iso3,
				name: feature.properties.name || iso3
			};
		})
		.filter((d: any) => d !== null);

	// Create the layer
	const columnLayer = new ColumnLayer({
		id: 'column-layer',
		data: columnData,
		diskResolution: 12,
		radius: 50000,
		getPosition: (d: any) => d.position,
		getElevation: (d: any) => d.height,
		getFillColor: (d: any) => getColumnColor(d.value, scale.max),
		pickable: true,
		onHover: (info: any) => {
			if (info.object) {
				console.log(`${info.object.name}: ${info.object.value}`);
			}
		},
		onClick: (info: any) => {
			if (info.object) {
				console.log('Clicked:', info.object);
			}
		}
	});

	// Create MapboxOverlay instead of standalone Deck
	const overlay = new MapboxOverlay({
		layers: [columnLayer]
	});

	// Add overlay to map
	map.addControl(overlay);

	return overlay;
}

export function cleanupDeckGL(overlay: any) {
	if (overlay) {
		overlay.finalize?.();
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

export async function prepareDataset(
	dataSourceKey: string,
	dataSources: Record<string, DataSource>,
	callbacks: {
		loadGeoData: (url: string) => Promise<any>;
		loadValueData: (url: string) => Promise<any>;
		mergeData: (geo: any, value: any) => any;
		calculateScale: (value: any) => any;
		updateMapSource: (data: any) => void;
		updateStores: (dataset: string, scale: any) => void;
	}
) {
	const geoData = await callbacks.loadGeoData('http://localhost:5173/countries.geo.json');

	if (!dataSourceKey || !dataSources[dataSourceKey]) {
		callbacks.updateMapSource(geoData);
		return { geoData, valueData: [], scale: null };
	}

	const { link, key, value } = dataSources[dataSourceKey];
	const valueDataRaw = await callbacks.loadValueData(link);

	const valueData = valueDataRaw.map((d) => ({
		iso3: d[key],
		value: d[value]
	}));

	if (!valueData || valueData.length === 0) {
		console.warn(`No data available for dataset: ${dataSourceKey}`);
		callbacks.updateMapSource(geoData);
		return { geoData, valueData: [], scale: null };
	}

	const mergedData = callbacks.mergeData(geoData, valueData);
	const scale = callbacks.calculateScale(valueData);

	callbacks.updateMapSource(mergedData);
	callbacks.updateStores(dataSourceKey, scale);

	return { geoData, valueData, scale };
}
