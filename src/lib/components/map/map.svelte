<script lang="ts">
	import './styles.css';
	import analysisOptions from '$lib/assets/analysisOptions.json';
	import {
		mapState,
		setColorScale,
		setCurrentDataset,
		setDeckInstance,
		setDisplayMode,
		setMapInstance
	} from './mapStore.svelte.ts';
	import {
		loadGeoData,
		mergeDataWithGeo,
		calculateColorScale,
		createColorExpression,
		setupMapLayers,
		setupMapInteractions,
		cleanupDeckGL,
		setupFlatDisplay,
		setupColumnsDisplay,
		prepareDataset
	} from './mapUtils';
	import CountryBubble from '$lib/components/countryBubble.svelte';
	import { layers, namedFlavor } from '@protomaps/basemaps';
	import maplibregl from 'maplibre-gl';
	import 'maplibre-gl/dist/maplibre-gl.css';
	import * as pmtiles from 'pmtiles';
	import { mount, unmount, onDestroy, onMount, untrack } from 'svelte'; // FIX: added unmount
	import type { DataSource } from '$lib/types';
	import { countriesStore, selectedCountryStore } from '../../../routes/store.svelte.ts';

	const { toggleTopics, onPosChange } = $props();

	let loading = $state(true);
	let progress = $state(0);
	let fadeOut = $state(false);
	let loadingText = $state('Initializing map...');

	let lng = $state(-5.0684);
	let lat = $state(26.5199);
	let zoom = $state(2.67);

	let mapContainer: string | HTMLElement;
	let map: maplibregl.Map = $state();
	let popup: any;
	let currentPopup: maplibregl.Popup | null = $state(null);
	let currentComponent: any = null;

	let deck: any = $state(null);
	let scale: any = $state(null);
	let geoData: any = $state(null);
	let valueData: any = $state(null);

	// FIX: guard so setupMapInteractions is only registered once
	let interactionsSetup = false;

	let countryGeneralInfo = $state({
		flag: '🇯🇵',
		name: 'Japan',
		capital: 'Tokyo',
		population: '125.7M',
		region: 'East Asia',
		currency: '¥ Yen (JPY)'
	});

	const dataSources: Record<string, DataSource> = {
		population: {
			link: 'http://localhost:5173/country-pop-list.json',
			key: 'cca3',
			value: 'population'
		},
		gdp: {
			link: 'http://localhost:5173/country-pop-list.json',
			key: 'cca3',
			value: 'population'
		}
	};

	// Single effect — only tracks currentDataset, display mode handled inside
	$effect(() => {
		const dataset = mapState.currentDataset;
		const mode = mapState.displayMode;
		if (!map) return;

		untrack(() => {
			if (dataset) {
				loadDataset(dataset, mode);
			} else {
				loadDataset(null, mode);
			}
		});
	});

	onMount(() => {
		initializeMap(mapContainer);
	});

	onDestroy(() => {
		cleanupDeckGL(deck);
		// FIX: clean up popup and mounted component on destroy
		if (currentComponent) unmount(currentComponent);
		if (currentPopup) currentPopup.remove();
	});

	async function initializeMap(mapContainer: string | HTMLElement) {
		const protocol = new (pmtiles as any).Protocol();
		maplibregl.addProtocol('pmtiles', (protocol as any).tile.bind(protocol));
		const TILE_URL = 'pmtiles://planet_z6.pmtiles';

		progress = 10;
		loadingText = 'Loading tiles...';

		map = new maplibregl.Map({
			container: mapContainer,

			// style: {
			// 	version: 8,
			// 	glyphs: 'https://protomaps.github.io/basemaps-assets/fonts/{fontstack}/{range}.pbf',
			// 	sources: {
			// 		protomaps: {
			// 			type: 'vector',
			// 			url: TILE_URL,
			// 			attribution:
			// 				'<a href="https://protomaps.com">Protomaps</a> © <a href="https://openstreetmap.org">OpenStreetMap</a>'
			// 		}
			// 	},
			// 	layers: layers('protomaps', namedFlavor('light'), { lang: 'en' })
			// },
			// style: {
			// 	version: 8,
			// 	sources: {
			// 		'raster-tiles': {
			// 			type: 'raster',
			// 			tiles: ['https://tiles.openfreemap.org/styles/bright'],
			// 			tileSize: 256,
			// 			minzoom: 0,
			// 			maxzoom: 19,
			// 			attribution: '© OpenStreetMap contributors'
			// 		}
			// 	},
			// 	layers: [
			// 		{
			// 			id: 'simple-tiles',
			// 			type: 'raster',
			// 			source: 'raster-tiles'
			// 		}
			// 	],
			// 	id: 'blank'
			// },
			style: 'https://tiles.openfreemap.org/styles/positron',
			center: [lng, lat],
			zoom: zoom
		});

		map.addControl(new maplibregl.GlobeControl(), 'top-right');
		map.on('move', updateData);

		popup = createPopup();
		setMapInstance(map);

		map.on('style.load', () => {
			progress = 60;
			loadingText = 'Loading countries...';

			map.addSource('countries', {
				type: 'geojson',
				data: 'countries.geo.json',
				promoteId: 'iso_a2_eh'
			});

			loadDataset('', 'none');
			progress = 85;
			loadingText = 'Finalizing...';
		});

		map.on('idle', () => {
			progress = 100;
			loadingText = 'Ready';

			setTimeout(() => {
				fadeOut = true;
				setTimeout(() => {
					loading = false;
				}, 600);
			}, 200);
		});
	}
	async function loadDataset(keyPath: string | null, mode: 'flat' | 'columns' | 'none') {
		try {
			const result = await prepareDataset(keyPath, countriesStore.countries, {
				loadGeoData,
				updateMapSource: (data) => map.getSource('countries').setData(data),
				updateStores: (dataset, newScale) => {
					// plain assignment, no setCurrentDataset/setColorScale to avoid re-triggering
					mapState.currentDataset = dataset;
					mapState.colorScale = newScale ?? { min: 0, max: 0 };
				}
			});

			geoData = result.geoData;
			valueData = result.valueData;
			scale = result.scale;

			await onDataDisplayChange(mode);
		} catch (error) {
			console.error('Error loading dataset:', error);
		}
	}

	async function onDataDisplayChange(mode: 'flat' | 'columns' | 'none') {
		try {
			if (deck) {
				try {
					deck._map?.removeControl(deck);
					deck.finalize?.();
				} catch (e) {
					console.warn('deck cleanup:', e);
				}
				deck = null;
				mapState.deckInstance = null; // direct write, no setter
			}

			if (mode === 'none') {
				setupMapLayers(map, [0.5, 0]);
				setupMapInteractionsOnce();
			} else if (mode === 'flat') {
				if (!scale) {
					setupMapLayers(map, [0.5, 0]);
					setupMapInteractionsOnce();
					return;
				}
				const colorExpression = createColorExpression(scale.min, scale.max);
				const label =
					analysisOptions.find((o) => o.key === mapState.currentDataset)?.name ??
					mapState.currentDataset;
				setupFlatDisplay(map, colorExpression, label);
				setupMapInteractionsOnce();

				const canvas = document.getElementById('deck-canvas');
				if (canvas) canvas.style.display = 'none';
			} else if (mode === 'columns') {
				if (!valueData?.length || !scale) {
					console.warn('No data for columns display');
					return;
				}

				if (map.getLayer('state-fills')) map.setLayoutProperty('state-fills', 'visibility', 'none');
				if (map.getLayer('state-borders'))
					map.setLayoutProperty('state-borders', 'visibility', 'none');

				const newDeck = setupColumnsDisplay(map, geoData, valueData, scale);
				deck = newDeck;
				mapState.deckInstance = newDeck; // direct write
			}
		} catch (error) {
			console.error('Error changing display mode:', error);
		}
	}

	// FIX: only register click/hover handlers once across dataset changes
	function setupMapInteractionsOnce() {
		if (interactionsSetup) return;
		interactionsSetup = true;
		setupMapInteractions(map, handleCountryClick);
	}

	function createPopup(): maplibregl.Popup {
		return new maplibregl.Popup({
			closeButton: false,
			closeOnClick: false,
			className: 'custom-popup',
			offset: 25
		});
	}

	async function handleCountryClick(e: any) {
		if (!e.features?.length) return;

		// FIX: unmount previous Svelte component before creating a new one
		if (currentComponent) {
			unmount(currentComponent);
			currentComponent = null;
		}

		// FIX: remove previous popup cleanly before making a new one
		if (currentPopup) {
			currentPopup.remove();
			currentPopup = null;
		}

		await handleCountryClickLogic(e.features[0]);

		const componentDom = document.createElement('div');
		currentComponent = mount(CountryBubble, {
			target: componentDom,
			props: {
				country: countryGeneralInfo,
				toggleMore: () => {
					toggleTopics();
				},
				onclose: () => {
					if (currentPopup) {
						currentPopup.remove();
						currentPopup = null;
					}
					if (currentComponent) {
						unmount(currentComponent);
						currentComponent = null;
					}
				}
			}
		});

		currentPopup = createPopup();
		currentPopup.setDOMContent(componentDom);
		currentPopup.setLngLat(e.lngLat).addTo(map);
	}

	$effect(() => {
		$inspect(currentPopup);
	});

	async function handleCountryClickLogic(feature: any) {
		const props = feature.properties || {};
		const name = props.name || 'N/A';
		countryGeneralInfo.name = name;

		let iso2 = feature.id;

		if (iso2) {
			try {
				const res = await fetch(
					`https://restcountries.com/v3.1/alpha?codes=${encodeURIComponent(iso2)}`
				);
				console.log('restcountries res', res);
				if (res.ok) {
					const data = await res.json();
					console.log('restcountries data', data);
					selectedCountryStore.setCountry(countriesStore.countries[iso2]);
					if (Array.isArray(data) && data.length > 0) {
						const c = data[0];
						countryGeneralInfo = {
							name,
							iso2,
							capital: c.capital ? c.capital[0] : undefined,
							population: c.population,
							region: c.region,
							subregion: c.subregion,
							currencies: c.currencies ? Object.keys(c.currencies).join(', ') : undefined,
							flag: c.flags && (c.flags.png || c.flags.svg)
						};
						return;
					}
				}
			} catch (err) {
				console.error('restcountries lookup failed', err);
			}
		}

		countryGeneralInfo = {
			name,
			iso2: iso2
		};
	}

	function updateData() {
		zoom = map.getZoom();
		lng = map.getCenter().lng;
		lat = map.getCenter().lat;
		onPosChange(lng, lat, zoom);
	}
</script>

{#if loading}
	<div class="map-loader" class:fade-out={fadeOut}>
		<div class="loader-content">
			<div class="loader-text">{loadingText}</div>
			<div class="progress-track">
				<div class="progress-fill" style="width: {progress}%"></div>
			</div>
			<div class="progress-pct">{progress}%</div>
		</div>
	</div>
{/if}

<div class="mapContainer">
	<div class="map" bind:this={mapContainer}></div>
</div>

<style>
	.mapContainer {
		flex: 2;
		height: 100%;
		width: 100%;
	}

	.map {
		height: 100%;
		width: 100%;
	}

	.map-loader {
		position: absolute;
		inset: 0;
		z-index: 100;
		background: var(--color-background-primary, #fff);
		display: flex;
		align-items: center;
		justify-content: center;
		transition: opacity 600ms ease;
	}

	.map-loader.fade-out {
		opacity: 0;
		pointer-events: none;
	}

	.loader-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 10px;
		width: 200px;
	}

	.loader-text {
		font-size: 13px;
		font-weight: 500;
		color: var(--color-text-secondary, #666);
		letter-spacing: 0.01em;
	}

	.progress-track {
		width: 100%;
		height: 3px;
		background: var(--color-background-tertiary, #ebebeb);
		border-radius: 99px;
		overflow: hidden;
	}

	.progress-fill {
		height: 100%;
		background: var(--color-text-primary, #0f0f0f);
		border-radius: 99px;
		transition: width 300ms ease;
	}

	.progress-pct {
		font-size: 12px;
		color: var(--color-text-tertiary, #aaa);
		font-variant-numeric: tabular-nums;
	}
</style>
