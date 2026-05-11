import { formatLargeNumbers } from '$lib/core/utils/utils';
import { ColumnLayer } from '@deck.gl/layers';
import { MapboxOverlay } from '@deck.gl/mapbox';
import maplibregl from 'maplibre-gl';

export type IndicatorRow = { iso2: string; name: string; value: number | null };

// ── Geo ───────────────────────────────────────────────────────────────────────

export async function loadGeoData(url: string) {
	const res = await fetch(url);
	return res.json();
}

// ── Convert rows → valueData for geo merge ────────────────────────────────────

function rowsToValueData(
	rows: IndicatorRow[],
	meta: Record<string, { iso3?: string | null }>
): { iso2: string; iso3: string; value: number }[] {
	return rows
		.filter((r): r is IndicatorRow & { value: number } => r.value !== null && isFinite(r.value))
		.map((r) => ({ iso2: r.iso2, iso3: meta[r.iso2]?.iso3 ?? r.iso2, value: r.value as number }));
}

// ── Merge + scale ─────────────────────────────────────────────────────────────

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

// ── Layer helpers  ──────────────────────────────────────────

export function calculateColorScale(valueData: { value: number }[]) {
	const vals = valueData
		.map((d) => d.value)
		.filter((v) => isFinite(v) && v !== null)
		.sort((a, b) => a - b);

	if (vals.length === 0) return [0, 1];

	const rawStops = [
		vals[0],
		vals[Math.floor((vals.length - 1) * 0.25)],
		vals[Math.floor((vals.length - 1) * 0.5)],
		vals[Math.floor((vals.length - 1) * 0.75)],
		vals[vals.length - 1]
	];
	const uniqueStops = Array.from(new Set(rawStops)).sort((a, b) => a - b);

	if (uniqueStops.length < 2) {
		return [uniqueStops[0], uniqueStops[0] + 0.000001];
	}

	return uniqueStops;
}

export function createColorExpression(stops: number[]) {
	const colorRamp = ['#1a9850', '#91cf60', '#fee090', '#fc8d59', '#d73027'];
	const interpolation: any[] = ['interpolate', ['linear'], ['get', 'value']];

	stops.forEach((stop, index) => {
		const colorIndex = Math.floor((index / (stops.length - 1)) * (colorRamp.length - 1));
		interpolation.push(stop, colorRamp[colorIndex]);
	});

	return ['case', ['!=', ['get', 'value'], null], interpolation, '#cccccc'];
}

function cleanFlat(map: any) {
	if (activePopup) activePopup.remove();
	if (map.getLayer('state-fills')) map.removeLayer('state-fills');
	if (map.getLayer('state-borders')) map.removeLayer('state-borders');
}
function clean3D(map: any) {
	if (map.getLayer('state-fills-3d')) map.removeLayer('state-fills-3d');
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
		activePopup
			.setText(`${labelName}: ${value ? formatLargeNumbers(Number(value)) : 'No data'}`)
			.setLngLat(e.lngLat)
			.addTo(map);
	});
	map.on('mouseleave', 'state-fills', () => activePopup.remove());
}

export function getColumnColor(value: number, max: number): [number, number, number, number] {
	const r = value / max;
	if (r < 0.33) return [211, 48, 39, 200];
	if (r < 0.66) return [254, 224, 144, 200];
	return [26, 152, 80, 200];
}

export function setupColumnsDisplay(map: any, geoData: any, valueData: any[], scale: any) {
	if (map.getLayer('state-fills')) map.removeLayer('state-fills');
	if (map.getLayer('state-borders')) map.removeLayer('state-borders');
	const b3 = Object.fromEntries(valueData.map((d: any) => [d.iso3, d]));
	const b2 = Object.fromEntries(valueData.map((d: any) => [d.iso2, d]));
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
				height: Math.max(item.value / scale.max, 0.01) * 500000,
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
		radius: 40000,
		extruded: true,
		getPosition: (d: any) => d.position,
		getElevation: (d: any) => d.height,
		getFillColor: (d: any) => getColumnColor(d.value, scale.max),
		pickable: true,
		autoHighlight: true,
		highlightColor: [255, 255, 255, 80],
		onHover: (i: any) => {
			map.getCanvas().style.cursor = i.object ? 'pointer' : '';
		}
	});
	const overlay = new MapboxOverlay({ interleaved: false, layers: [layer] });
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
