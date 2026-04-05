<script lang="ts">
	import './styles.css';
	import CountryBubble from '$lib/components/countryBubble.svelte';
	import { layers, namedFlavor } from '@protomaps/basemaps';
	import maplibregl from 'maplibre-gl';
	import 'maplibre-gl/dist/maplibre-gl.css';
	import * as pmtiles from 'pmtiles';
	import { mount, onDestroy, onMount } from 'svelte';

	let tempC = $state({
		flag: '🇯🇵',
		name: 'Japan',
		capital: 'Tokyo',
		population: '125.7M',
		region: 'East Asia',
		currency: '¥ Yen (JPY)'
	});

	let map: maplibregl.Map;
	let mapContainer: string | HTMLElement;

	let lng = -4.2184;
	let lat = 44.1809;
	let zoom = 5.21;

	let initialState = { lng, lat, zoom };
	let countryInfo = { name: 'N/A' };

	const protocol = new (pmtiles as any).Protocol();
	maplibregl.addProtocol('pmtiles', (protocol as any).tile.bind(protocol));
	const TILE_URL = 'pmtiles://planet_z6.pmtiles';

	function updateData() {
		zoom = map.getZoom();
		lng = map.getCenter().lng;
		lat = map.getCenter().lat;
	}

	let componentMount;

	// $effect(() => {
	// 	if (!countryGeneralInfo || !countryInfo) return;
	// 	tempC = {
	// 		flag: countryGeneralInfo.flag,
	// 		name: countryInfo.name,
	// 		capital: countryGeneralInfo.capital,
	// 		population: countryGeneralInfo.population,
	// 		region: countryGeneralInfo.subregion,
	// 		currency: countryGeneralInfo.currencies
	// 	};
	// });

	onMount(() => {
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
				layers: layers('protomaps', namedFlavor('dark'), { lang: 'en' })
			},
			center: [lng, lat],
			zoom: zoom
		});
		map.addControl(new maplibregl.GlobeControl(), 'top-right');
		map.on('move', () => {
			updateData();
		});

		const componentDom = document.createElement('div');
		componentMount = mount(CountryBubble, {
			target: componentDom,
			props: {
				country: tempC
			}
		});
		const popup = new maplibregl.Popup({
			closeButton: false,
			closeOnClick: false,
			className: 'custom-popup',
			offset: 25
		}).setDOMContent(componentDom);

		let hoveredStateId: any = null;

		map.on('style.load', () => {
			map.addSource('countries', {
				type: 'geojson',
				data: 'http://localhost:5173/countries.geo.json',

				promoteId: 'iso_a3' // Use the ISO A3 code as the feature ID for easier state management
			});

			map.addLayer({
				id: 'state-fills',
				type: 'fill',
				source: 'countries',
				layout: {},
				paint: {
					'fill-color': '#627BC1',
					'fill-opacity': ['case', ['boolean', ['feature-state', 'hover'], false], 0.5, 0]
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

			// When the user moves their mouse over the state-fill layer, we'll update the
			// feature state for the feature under the mouse.
			map.on('mousemove', 'state-fills', (e) => {
				if (e.features.length > 0) {
					if (hoveredStateId) {
						map.setFeatureState({ source: 'countries', id: hoveredStateId }, { hover: false });
					}
					hoveredStateId = e.features[0].id;
					map.setFeatureState({ source: 'countries', id: hoveredStateId }, { hover: true });
					map.getCanvas().style.cursor = 'pointer';
				}
			});

			// When the mouse leaves the state-fill layer, update the feature state of the
			// previously hovered feature.
			map.on('mouseleave', 'state-fills', () => {
				if (hoveredStateId) {
					map.setFeatureState({ source: 'countries', id: hoveredStateId }, { hover: false });
				}
				hoveredStateId = null;
				map.getCanvas().style.cursor = '';
			});

			map.on('click', 'state-fills', async (e) => {
				// handle country click and fetch additional info
				await handleCountryClick(e.features[0]);
				// handleClick(e.point);
				popup.setLngLat(e.lngLat).addTo(map);

				tempC.flag = countryGeneralInfo.flag;
				tempC.name = countryInfo.name;
				tempC.capital = countryGeneralInfo.capital;
				tempC.region = countryGeneralInfo.subregion;
				tempC.currency = countryGeneralInfo.currencies;
			});
		});
	});

	onDestroy(() => {
		if (map) {
			map.remove();
		}
	});

	function handleReset() {
		map.flyTo({
			center: [initialState.lng, initialState.lat],
			zoom: initialState.zoom,
			essential: true
		});
	}

	// General info fetched for the selected country (populated on click)
	let countryGeneralInfo: any = null;

	async function handleCountryClick(feature: any) {
		const props = feature.properties || {};
		const name = props.name || 'N/A';
		countryInfo.name = name;

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
</script>

<div class="window">
	<div class="mapContainer">
		<div class="map" bind:this={mapContainer}></div>
	</div>

	<div class="sidebar">
		Longitude: {lng.toFixed(4)} | Latitude: {lat.toFixed(4)} | Zoom:
		{zoom.toFixed(2)}

		<div class="country-info">
			Name: {countryInfo.name}
		</div>
		<div class="country-general-info">
			{#if countryGeneralInfo}
				{#each Object.entries(countryGeneralInfo) as [key, value]}
					<div>
						<strong>{key}:</strong>
						{value}
					</div>
				{/each}
			{:else}
				<div>Click on a country to see details</div>
			{/if}
		</div>
	</div>
	<button onclick={handleReset} class="reset-button">Reset</button>
</div>

<style>
	.abs {
		z-index: 12;
		position: absolute;
		transform: translate(-50%, calc(-100% - 8px));
	}
	h1 {
		color: #ff3e00;
	}

	.window {
		position: relative;
		flex: 1;
		max-height: 95%;
	}

	.mapContainer {
		position: absolute;
		top: 0;
		bottom: 0;
		right: 0;
		left: 0;
	}

	.map {
		height: 100%;
		width: 100%;
		/* overflow: clip; */
	}

	.sidebar {
		background-color: rgb(35 55 75 / 90%);
		color: #fff;
		padding: 6px 12px;
		font-family: monospace;
		z-index: 1;
		position: absolute;
		top: 0;
		left: 0;
		margin: 12px;
		border-radius: 4px;
	}

	.reset-button {
		position: absolute;
		top: 50px;
		z-index: 1;
		left: 12px;
		padding: 4px 10px;
		border-radius: 10px;
		cursor: pointer;
	}
</style>
