<script lang="ts">
	import './styles.css';
	import TopicsSidebar from '$lib/components/sidebar/topicsSidebar.svelte';
	import Map from '$lib/components/map/map.svelte';
	import AnalysisMode from '$lib/components/analysis mode/analysisMode.svelte';
	import {
		countriesStore,
		modeState,
		selectedCountryStore,
		setSelectedMode
	} from './store.svelte.js';
	import { mapState } from '$lib/components/map/mapStore.svelte.js';

	let { data } = $props();
	// let isMapSelected = $derived(modeState.selected !== 'map');
	const showAnalysis = $derived(modeState.selected === 'analysis');
	let topicsVisible = $state(false);
	// let selectedMode: 'view' | 'analysis' = $state('analysis');

	let lng = $state(-5.0684);
	let lat = $state(26.5199);
	let zoom = $state(2.67);

	let initialState = { lng, lat, zoom };

	// let countryGeneralInfo = $state({
	// 	flag: '🇯🇵',
	// 	name: 'Japan',
	// 	capital: 'Tokyo',
	// 	population: '125.7M',
	// 	region: 'East Asia',
	// 	currency: '¥ Yen (JPY)'
	// });

	$effect(() => {
		$inspect(countriesStore);
		if (data && !countriesStore.loaded) {
			countriesStore.setCountries(data.countries);
			selectedCountryStore.setCountry(data.countries['FR']);
			// console.log('data', data.countries);
		}
		if (data.msg) console.log(data.msg);
		if (modeState.selected) console.log(modeState.selected);
		// if (countriesStore.loaded) console.log('from page', countriesStore.countries['FR'].tourismInfo);
	});
</script>

<div class="window">
	<!-- Map always fills the window, never removed from DOM -->
	<div class="main-content map-layer">
		<Map
			toggleTopics={() => {
				topicsVisible = !topicsVisible;
			}}
			onPosChange={(nlng, nlat, nzoom) => {
				lng = nlng;
				lat = nlat;
				zoom = nzoom;
			}}
		/>
		<div class="mapInfo">
			Longitude: {lng.toFixed(4)} | Latitude: {lat.toFixed(4)} | Zoom: {zoom.toFixed(2)}
		</div>
	</div>

	<!-- Analysis overlays the map absolutely -->
	{#if showAnalysis}
		<div class="main-content analysis-layer">
			{#if countriesStore.loaded}
				<AnalysisMode onClose={() => setSelectedMode('map')} />
			{/if}
		</div>
	{/if}

	<div class="sidebar">
		<TopicsSidebar visible={true} />
	</div>
</div>

<style>
	.window {
		position: relative;
		flex: 1;
		height: 100%;
		width: 100%;
		display: flex;
	}

	.main-content {
		display: flex;
		flex-direction: column;
		height: 100%;
		min-width: 0;
	}

	/* Map always fills available space next to sidebar */
	.map-layer {
		flex: 1 1 0;
		position: relative; /* for mapInfo positioning */
	}

	/* Analysis sits on top of the map absolutely */
	.analysis-layer {
		position: absolute;
		top: 0;
		left: 0;
		right: 40rem; /* same width as sidebar, so it doesn't overlap it */
		bottom: 0;
		z-index: 10;
		background: white;
	}

	.sidebar {
		width: 40rem;
		min-width: 35rem;
		height: 100%;
		flex-shrink: 0;
		background-color: white;
	}

	.mapInfo {
		background-color: rgba(255, 255, 255, 0.9);
		color: #0e0e0e;
		padding: 6px 12px;
		font-family: monospace;
		z-index: 1;
		position: absolute;
		top: 0;
		left: 0;
		margin: 12px;
		border-radius: 4px;
	}

	@media (max-width: 1200px) {
		.window {
			flex-direction: column;
		}

		.sidebar {
			width: 100%;
			min-width: 100%;
			max-width: 100%;
			height: 40rem;
		}

		.map-layer {
			width: 100%;
			height: auto;
			min-height: 30vh;
		}

		.analysis-layer {
			right: 0;
			bottom: 40rem; /* leave room for sidebar on mobile */
		}
	}
</style>
