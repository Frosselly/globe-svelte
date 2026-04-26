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
	import { mount, unmount, onDestroy, onMount } from 'svelte'; // FIX: added unmount
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

	let deck: any = null;
	let scale: any = null;
	let geoData: any = null;
	let valueData: any = null;

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

	$effect(() => {
		if (mapState.currentDataset) {
			console.log('changes here', mapState.currentDataset);
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
			progress = 60;
			loadingText = 'Loading countries...';

			map.addSource('countries', {
				type: 'geojson',
				data: 'http://localhost:5173/countries.geo.json',
				promoteId: 'iso_a2_eh'
			});

			loadDataset('');
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

			await onDataDisplayChange(mapState.displayMode);
		} catch (error) {
			console.error('Error loading dataset:', error);
		}
	}

	async function onDataDisplayChange(mode: 'flat' | 'columns' | 'none') {
		try {
			if (mode !== 'columns' && deck) {
				cleanupDeckGL(deck);
				deck = null;
				setDeckInstance(null);
			}

			if (mode === 'none') {
				setupMapLayers(map, [0.5, 0]);
				setupMapInteractionsOnce(); // FIX: guarded registration
			} else if (mode === 'flat') {
				const colorExpression = createColorExpression(scale.min, scale.max);
				console.log('flat: ' + mapState.currentDataset);
				setupFlatDisplay(map, colorExpression, dataSources[mapState.currentDataset]?.value);
				setupMapInteractionsOnce(); // FIX: guarded registration

				const canvas = document.getElementById('deck-canvas');
				if (canvas) {
					canvas.style.display = 'none';
				}
			} else if (mode === 'columns') {
				if (!valueData || valueData.length === 0) {
					console.warn('No data available for columns display');
					return;
				}

				if (map.getLayer('state-fills')) {
					map.setLayoutProperty('state-fills', 'visibility', 'none');
				}
				if (map.getLayer('state-borders')) {
					map.setLayoutProperty('state-borders', 'visibility', 'none');
				}

				deck = setupColumnsDisplay(map, geoData, valueData, scale);
				setDeckInstance(deck);
			}

			// FIX: removed the erroneous setDeckInstance(mode) that was here
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
