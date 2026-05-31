import { formatLargeNumbers } from '$lib/core/utils/utils';
import { ColumnLayer } from '@deck.gl/layers';
import { MapboxOverlay } from '@deck.gl/mapbox';
import maplibregl from 'maplibre-gl';
import { mapState } from './mapStore.svelte';
import AnalysisMapInfoModal from '../AnalysisMapInfoModal.svelte';
import { mount } from 'svelte';

export type IndicatorRow = { iso2: string; name: string; value: number | null };

//  LAYERS utils

export function calculateColorScale(valueData: { value: number }[]) {
	const vals = valueData
		.map((d) => d.value)
		.filter((v) => Number.isFinite(v))
		.sort((a, b) => a - b);

	if (!vals.length) return [0, 0, 0, 0];

	const nonZero = vals.filter((v) => v > 0);
	if (!nonZero.length) return [0, 0, 0, 0];

	const percentile = (p: number) => {
		const i = (nonZero.length - 1) * p;
		const lo = Math.floor(i);
		const hi = Math.ceil(i);
		if (lo === hi) return nonZero[lo];
		return nonZero[lo] * (1 - (i - lo)) + nonZero[hi] * (i - lo);
	};

	// 4 boundaries → 4 colored buckets: (0–p25], (p25–p50], (p50–p75], (p75–max]
	return [percentile(0.25), percentile(0.5), percentile(0.75), percentile(1)];
}
export function setupMapLayers(map: any, opacity: [number, number]) {
	cleanFlat(map);
	map.addLayer({
		id: 'state-fills',
		type: 'fill',
		source: 'countries',
		layout: {},
		paint: {
			'fill-color': 'white',
			'fill-opacity': ['case', ['boolean', ['feature-state', 'hover'], false], ...opacity]
		},
		filter: ['!=', ['get', 'iso_a2_eh'], 'AQ']
	});
	map.addLayer({
		id: 'state-borders',
		type: 'line',
		source: 'countries',
		layout: {},
		paint: { 'line-color': '#627BC1', 'line-width': 2 },
		filter: ['!=', ['get', 'iso_a2_eh'], 'AQ']
	});
}

export function createColorExpression(stops: number[]) {
	const colorRamp = ['#1a9850', '#91cf60', '#fee090', '#fc8d59'];
	const interpolation: any[] = ['interpolate', ['linear'], ['get', 'value']];

	stops.forEach((stop, i) => {
		interpolation.push(stop, colorRamp[i]);
	});

	return ['case', ['!=', ['get', 'value'], null], interpolation, '#b0b0b0'];
}

// MAIN prepare of data

export async function prepareDataset(
	indicatorKey: string | null,
	rows: IndicatorRow[],
	countriesMeta: Record<string, { iso3?: string | null }>,
	callbacks: {
		loadGeoData: () => Promise<any>;
		updateMapSource: (data: any) => void;
		updateStores: (dataset: string, scale: any) => void;
	}
) {
	const geoData = await callbacks.loadGeoData();

	if (!indicatorKey || !rows.length) {
		callbacks.updateMapSource(geoData);
		return { geoData, valueData: [], scale: null };
	}

	const valueData = rowsToValueData(rows, countriesMeta);
	if (!valueData.length) {
		console.warn(`[map] No valid values for "${indicatorKey}"`);
		callbacks.updateMapSource(geoData);
		return { geoData, valueData: [], scale: null };
	}

	const mergedData = mergeDataWithGeo(geoData, valueData);
	const scale = calculateColorScale(valueData);
	callbacks.updateMapSource(mergedData);
	callbacks.updateStores(indicatorKey, scale);
	return { geoData, valueData, scale };
}

// FLAT display setup

let activePopup: any = null;

export function setupFlatDisplay(map: any, colorExpression: any, labelName: string) {
	if (!labelName) return;
	cleanFlat(map);
	clean3D(map);
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
		paint: { 'line-color': '#627BC1', 'line-width': 2 }
	});
	activePopup = new maplibregl.Popup({ closeButton: false, className: 'custom-popup', offset: 25 });
	map.on('mousemove', 'state-fills', (e: any) => {
		const value = e.features[0].properties.value;
		if (!value || !activePopup) return;
		// activePopup
		// 	.setText(`${labelName}: ${formatLargeNumbers(Number(value))}`)
		createLabel(e.features[0].properties.name, labelName, value);
		activePopup.setLngLat(e.lngLat).addTo(map);
	});
	map.on('mouseleave', 'state-fills', () => {
		if (!activePopup) return;
		activePopup.remove();
		// activePopup = null;
	});
}

function createLabel(countryName: string, labelName: string, value: string) {
	if (activePopup) {
		activePopup.remove();
		activePopup = null;
	}
	const componentDom = document.createElement('div');
	activePopup = mount(AnalysisMapInfoModal, {
		target: componentDom,
		props: {
			countryName,
			labelName,
			value
		}
	});

	activePopup = createPopup();
	activePopup.setDOMContent(componentDom);
	// return currentPopup;
}

export function createPopup(): maplibregl.Popup {
	return new maplibregl.Popup({
		closeButton: false,
		closeOnClick: false,
		className: 'custom-popup',
		offset: 25
	});
}

export function cleanFlat(map: any) {
	if (activePopup) {
		activePopup.remove();
		activePopup = null;
	}
	if (map.getLayer('state-fills')) {
		map.removeLayer('state-fills');
	}
	if (map.getLayer('state-borders')) map.removeLayer('state-borders');
}

// 3D COLUMN setup

function hexToRgb(hex: string, alpha: number = 200): [number, number, number, number] {
	const r = parseInt(hex.slice(1, 3), 16);
	const g = parseInt(hex.slice(3, 5), 16);
	const b = parseInt(hex.slice(5, 7), 16);
	return [r, g, b, alpha];
}

export function getColumnColor(value: number, stops: number[]): [number, number, number, number] {
	const colorRamp = ['#1a9850', '#91cf60', '#fee090', '#fc8d59', '#d73027'];

	// If the value is null or undefined
	if (value == null) return [200, 200, 200, 200];

	// Find which "bucket" the value falls into based on our stops
	// We iterate backwards to find the highest stop the value exceeds
	for (let i = stops.length - 1; i >= 0; i--) {
		if (value >= stops[i]) {
			// Map the stop index to a color in the ramp
			const colorIdx = Math.floor((i / (stops.length - 1)) * (colorRamp.length - 1));
			return hexToRgb(colorRamp[colorIdx]);
		}
	}

	// Default to the first color
	return hexToRgb(colorRamp[0]);
}

export function setupColumnsDisplay(map: any, geoData: any, valueData: any[], stops: number[]) {
	if (map.getLayer('state-fills')) map.removeLayer('state-fills');
	if (map.getLayer('state-borders')) map.removeLayer('state-borders');
	const b3 = Object.fromEntries(valueData.map((d: any) => [d.iso3, d]));
	const b2 = Object.fromEntries(valueData.map((d: any) => [d.iso2, d]));
	const maxVal = stops[stops.length - 1];
	const cols = geoData.features
		.map((f: any) => {
			const iso3 = f.properties.adm0_a3,
				iso2 = f.id ?? f.properties.iso_a2_eh;
			const item = b3[iso3] ?? b2[iso2];
			if (!item) return null;
			const lx = f.properties.label_x,
				ly = f.properties.label_y;
			if (lx == null || ly == null) return null;
			return {
				position: [lx, ly] as [number, number],
				height: Math.max(item.value / maxVal, 0.01) * 500000,
				value: item.value,
				iso3,
				name: f.properties.name || iso3
			};
		})
		.filter(Boolean);
	if (!cols.length) {
		console.warn('[columns] no data');
		return null;
	}
	const layer = new ColumnLayer({
		id: 'column-layer',
		data: cols,
		diskResolution: 12,
		radius: 50000,
		extruded: true,
		getPosition: (d: any) => d.position,
		getElevation: (d: any) => d.height,
		getFillColor: (d: any) => getColumnColor(d.value, stops),
		pickable: true,
		autoHighlight: true,
		highlightColor: [255, 255, 255, 80],
		parameters: {
			depthTest: true, // 3d depth
			depthMask: true,
			blend: true
		},
		onHover: (i: any) => {
			map.getCanvas().style.cursor = i.object ? 'pointer' : '';
		}
	});
	const overlay = new MapboxOverlay({
		interleaved: true,
		layers: [layer]
	});
	map.addControl(overlay);
	return overlay;
}

export function cleanupDeckGL(overlay: any) {
	if (!overlay) return;
	try {
		overlay._map?.removeControl(overlay);
		overlay.finalize?.();
	} catch (e) {
		console.warn('cleanupDeckGL:', e);
	}
}

function clean3D(map: any) {
	if (map.getLayer('state-fills-3d')) map.removeLayer('state-fills-3d');
}

export function setupMapInteractions(map: any, onCountryClick: Function, onSecondClick: Function) {
	let hovered: any = null;
	map.on('mousemove', 'state-fills', (e: any) => {
		if (e.features.length) {
			if (hovered) map.setFeatureState({ source: 'countries', id: hovered }, { hover: false });
			hovered = e.features[0].id;
			map.setFeatureState({ source: 'countries', id: hovered }, { hover: true });
			map.getCanvas().style.cursor = 'pointer';
		}
	});
	map.on('mouseleave', 'state-fills', () => {
		if (hovered) map.setFeatureState({ source: 'countries', id: hovered }, { hover: false });
		hovered = null;
		map.getCanvas().style.cursor = '';
	});
	map.on('click', 'state-fills', (e: any) => onCountryClick(e));
	map.on('click', (e: any) => onSecondClick(e));

	return { hoveredStateId: hovered };
}

// UTILS

//  DATA utils

export async function loadGeoData(url: string) {
	const res = await fetch(url);
	return res.json();
}

function rowsToValueData(
	rows: IndicatorRow[],
	meta: Record<string, { iso3?: string | null }>
): { iso2: string; iso3: string; value: number }[] {
	return rows
		.filter((r): r is IndicatorRow & { value: number } => r.value !== null && isFinite(r.value))
		.map((r) => ({ iso2: r.iso2, iso3: meta[r.iso2]?.iso3 ?? r.iso2, value: r.value as number }));
}

export function mergeDataWithGeo(
	geoData: any,
	valueData: { iso2: string; iso3: string; value: number }[]
) {
	const byIso3 = Object.fromEntries(valueData.map((d) => [d.iso3, d.value]));
	const byIso2 = Object.fromEntries(valueData.map((d) => [d.iso2, d.value]));
	const clone = JSON.parse(JSON.stringify(geoData));
	clone.features.forEach((f: any) => {
		const iso3 = f.properties.adm0_a3;
		const iso2 = f.id ?? f.properties.iso_a2_eh;
		f.properties.value = byIso3[iso3] ?? byIso2[iso2] ?? null;
	});
	return clone;
}
