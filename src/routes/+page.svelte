<script lang="ts">
	import './styles.css';
	import TopicsSidebar from '$lib/components/sidebar/topicsSidebar.svelte';
	import Map from '$lib/components/map/map.svelte';
	import AnalysisMode from '$lib/components/analysis mode/analysisMode.svelte';
	import { modeState, setSelectedMode } from './store.svelte.js';

	let { data } = $props();
	// let isMapSelected = $derived(modeState.selected !== 'map');

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
		if (data.msg) console.log(data.msg);
		if (modeState.selected) console.log(modeState.selected);
	});
</script>

<div class="window">
	<div class="main-content" class:hidden={modeState.selected !== 'map'}>
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
			Longitude: {lng.toFixed(4)} | Latitude: {lat.toFixed(4)} | Zoom:
			{zoom.toFixed(2)}
		</div>
	</div>

	<div class="main-content" class:hidden={modeState.selected !== 'analysis'}>
		<AnalysisMode onClose={() => setSelectedMode('map')} />
	</div>

	<div class="sidebar">
		<TopicsSidebar visible={true} />
	</div>
</div>

<style>
	.hidden {
		display: none !important;
	}
	.window {
		position: relative;
		flex: 1;
		height: 100%;
		width: 100%;
		display: flex;
	}

	@media (max-width: 1200px) {
		.window {
			flex-direction: column;
		}

		.sidebar.sidebar {
			width: 100%;
			min-width: 100%;
			max-width: 100%;
			height: 40rem;
		}

		.main-content {
			width: 100%;
			height: auto;
			min-height: 30vh;
		}
	}

	.main-content {
		display: flex;
		flex-direction: column;
		height: 100%;
		min-width: 0;
		flex: 1 1 0;
	}

	.sidebar {
		width: 40rem;
		min-width: 35rem;
		height: 100%;
		flex-shrink: 0;
		background-color: white;
	}

	.mapInfo {
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
</style>
