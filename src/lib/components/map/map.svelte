<script lang="ts">
	import './styles.css';
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
		loadValueData,
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
	import { mount, onDestroy, onMount, setContext } from 'svelte';
	import type { DataSource } from '$lib/types';

	const { toggleTopics, onPosChange } = $props();
	let lng = $state(-5.0684);
	let lat = $state(26.5199);
	let zoom = $state(2.67);

	let mapContainer: string | HTMLElement;
	let map: maplibregl.Map = $state();
	let popup: any;
	let currentPopup: any = null;
	let currentComponent: any = null;

	let deck: any = null;
	let scale: any = null;
	let geoData: any = null;
	let valueData: any = null;

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
	$effect(() => {
		if (mapState.currentDataset) {
			console.log('changes gere', mapState.currentDataset);
			setDisplayMode('flat');
			loadDataset(mapState.currentDataset);
		} else {
			setDisplayMode('none');
			loadDataset(mapState.currentDataset);
		}
	});

	onMount(() => {
		initializeMap(mapContainer);
	});

	onDestroy(() => {
		cleanupDeckGL(deck);
	});

	async function initializeMap(mapContainer: string | HTMLElement) {
		const protocol = new (pmtiles as any).Protocol();
		maplibregl.addProtocol('pmtiles', (protocol as any).tile.bind(protocol));
		const TILE_URL = 'pmtiles://planet_z6.pmtiles';

		map = new maplibregl.Map({
			container: mapContainer,
			style: {
				version: 8,
				glyphs: 'https://protomaps.github.io/basemaps-assets/fonts/{fontstack}/{range}.pbf',
				sources: {
					protomaps: {
						type: 'vector',
						url: TILE_URL,
						attribution:
							'<a href="https://protomaps.com">Protomaps</a> © <a href="https://openstreetmap.org">OpenStreetMap</a>'
					}
				},
				layers: layers('protomaps', namedFlavor('light'), { lang: 'en' })
			},
			center: [lng, lat],
			zoom: zoom
		});

		map.addControl(new maplibregl.GlobeControl(), 'top-right');
		map.on('move', updateData);

		popup = createPopup();
		setMapInstance(map);

		map.on('style.load', () => {
			map.addSource('countries', {
				type: 'geojson',
				data: 'http://localhost:5173/countries.geo.json',
				promoteId: 'adm0_a3'
			});

			// Load initial dataset
			loadDataset('');
		});
	}

	async function loadDataset(dataSourceKey: string) {
		try {
			const result = await prepareDataset(dataSourceKey, dataSources, {
				loadGeoData,
				loadValueData,
				mergeData: mergeDataWithGeo,
				calculateScale: calculateColorScale,
				updateMapSource: (data) => map.getSource('countries').setData(data),
				updateStores: (dataset, scale) => {
					setCurrentDataset(dataset);
					setColorScale(scale);
				}
			});

			geoData = result.geoData;
			valueData = result.valueData;
			scale = result.scale;

			// Render based on current display mode
			await onDataDisplayChange(mapState.displayMode);
		} catch (error) {
			console.error('Error loading dataset:', error);
		}
	}

	async function onDataDisplayChange(mode: 'flat' | 'columns' | 'none') {
		try {
			// Clean up deck.gl if switching away from columns
			if (mode !== 'columns' && deck) {
				cleanupDeckGL(deck);
				deck = null;
				setDeckInstance(null);
			}
			if (mode == 'none') {
				setupMapLayers(map, [0.5, 0]);
				setupMapInteractions(map, handleCountryClick);
			} else if (mode === 'flat') {
				const colorExpression = createColorExpression(scale.min, scale.max);
				console.log('flat: ' + mapState.currentDataset);
				setupFlatDisplay(map, colorExpression, dataSources[mapState.currentDataset]?.value);
				setupMapInteractions(map, handleCountryClick);

				// Hide deck canvas
				const canvas = document.getElementById('deck-canvas');
				if (canvas) {
					canvas.style.display = 'none';
				}
			} else if (mode === 'columns') {
				if (!valueData || valueData.length === 0) {
					console.warn('No data available for columns display');
					return;
				}

				// Hide map layers
				if (map.getLayer('state-fills')) {
					map.setLayoutProperty('state-fills', 'visibility', 'none');
				}
				if (map.getLayer('state-borders')) {
					map.setLayoutProperty('state-borders', 'visibility', 'none');
				}

				// Setup deck.gl columns
				deck = setupColumnsDisplay(map, geoData, valueData, scale);
				setDeckInstance(deck);
			}

			setDeckInstance(mode);
		} catch (error) {
			console.error('Error changing display mode:', error);
		}
	}

	function createPopup() {
		return new maplibregl.Popup({
			closeButton: false,
			closeOnClick: false,
			className: 'custom-popup',
			offset: 25
		});
	}

	async function handleCountryClick(e: any) {
		// Close previous popup
		if (currentPopup) {
			currentPopup.remove();
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
					currentPopup.remove();
					currentPopup = null;
					currentComponent = null;
				}
			}
		});

		currentPopup = createPopup();
		currentPopup.setDOMContent(componentDom);
		currentPopup.setLngLat(e.lngLat).addTo(map);
	}

	async function handleCountryClickLogic(feature: any) {
		// Your existing country click logic
		// await handleCountryClick(feature);

		const props = feature.properties || {};
		const name = props.name || 'N/A';
		countryGeneralInfo.name = name;

		let iso3 = feature.id;

		// If missing, resolve via restcountries.com
		if (iso3) {
			try {
				const res = await fetch(
					`https://restcountries.com/v3.1/alpha?codes=${encodeURIComponent(iso3)}`
				);
				console.log('restcountries res', res);
				if (res.ok) {
					const data = await res.json();
					console.log('restcountries data', data);
					if (Array.isArray(data) && data.length > 0) {
						const c = data[0];
						countryGeneralInfo = {
							name,
							iso3,
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

		// If we still don't have detailed info, at least store name and codes
		countryGeneralInfo = {
			name,
			iso3: iso3
		};

		// Note: data.un.org doesn't offer a simple public JSON profile endpoint here.
		// We provide the resolved ISO and a search link to data.un.org for convenience.
	}

	function updateData() {
		zoom = map.getZoom();
		lng = map.getCenter().lng;
		lat = map.getCenter().lat;
		onPosChange(lng, lat, zoom);
	}
</script>

<div class="mapContainer">
	<div class="map" bind:this={mapContainer}></div>
</div>

<style>
	.mapContainer {
		/* position: absolute;
		top: 0;
		bottom: 0;
		right: 0;
		left: 0; */
		flex: 2;
		height: 100%;
		width: 100%;
	}

	.map {
		height: 100%;
		width: 100%;
		/* overflow: clip; */
	}
</style>
