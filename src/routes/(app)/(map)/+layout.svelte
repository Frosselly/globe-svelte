<script lang="ts">
	import { modeState, selectedCountryStore, sidebarState } from '$lib/core/stores/store.svelte.js';
	import TopicsSidebar from '$lib/components/sidebar/topicsSidebar.svelte';
	import Map from '$lib/components/map/map.svelte';
	import { page } from '$app/state';

	let { data, children } = $props();

	let selectedMode = $derived(modeState.selected);

	// $effect(() => {
	// 	// console.log('data.user', data?.user);
	// });

	let topicsVisible = $state(false);

	let lng = $state(-5.0684);
	let lat = $state(26.5199);
	let zoom = $state(2.67);
	$effect(() => {
		$inspect('mode', modeState.selected);
		$inspect('selectedMode', selectedMode);
		// if (modeState.selected) // console.log(modeState.selected);
		$inspect('selectedCountryStore.country', selectedCountryStore.country);
		$inspect('gdpHistory', selectedCountryStore.country?.gdpHistory);

		if (selectedCountryStore.country && !selectedCountryStore.historyLoaded)
			selectedCountryStore.loadHistory();
	});

	$effect(() => {
		const iso2 = data?.iso2;
		if (iso2 && selectedCountryStore.country?.iso2 !== iso2) {
			selectedCountryStore.selectCountry(iso2);
		}
	});

	// -- Mobile drag --------
	// sidebarHeightVh: how tall the sidebar is as % of viewport height
	let sidebarHeightVh = $state(45); // default: sidebar takes 45vh on mobile
	let isDragging = false;
	let dragStartY = 0;
	let dragStartHeight = 0;

	// Called by TopicsSidebar's drag-point via a prop callback
	function onDragStart(e: PointerEvent) {
		isDragging = true;
		dragStartY = e.clientY;
		dragStartHeight = sidebarHeightVh;
		window.addEventListener('pointermove', onDragMove);
		window.addEventListener('pointerup', onDragEnd);
		(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
	}

	function onDragMove(e: PointerEvent) {
		if (!isDragging) return;
		// Moving UP increases sidebar height
		const deltaVh = -((e.clientY - dragStartY) / window.innerHeight) * 100;
		sidebarHeightVh = Math.min(85, Math.max(15, dragStartHeight + deltaVh));
	}

	function onDragEnd() {
		isDragging = false;
		window.removeEventListener('pointermove', onDragMove);
		window.removeEventListener('pointerup', onDragEnd);
		// Tell MapLibre to re-measure its container
		mapRef?.resize();
	}

	// Map instance ref so we can call resize()
	let mapRef: { resize: () => void } | null = $state(null);
</script>

<main>
	<article class="window" style="--sidebar-h: {sidebarHeightVh}vh">
		<!-- Persistent map -->
		<div class="main-content map-layer">
			<Map
				bind:this={mapRef}
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
				Longitude: {lng.toFixed(4)}
				| Latitude: {lat.toFixed(4)}
				| Zoom: {zoom.toFixed(2)}
			</div>
		</div>

		<!-- Route overlay area -->
		<div class="main-content analysis-layer">
			{@render children?.()}
		</div>

		<!-- Persistent sidebar -->
		<div class="sidebar">
			<TopicsSidebar visible={true} selectedSidebar={sidebarState.selected} {onDragStart} />
		</div>
	</article>
</main>

<style>
	main {
		max-height: 95%;
		height: 100%;

		display: flex;
		flex-direction: column;

		width: 100%;
	}

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
		pointer-events: none;
		/* background-color: var(--color-background); */
	}

	.sidebar {
		z-index: 1;
		width: 40rem;
		min-width: 35rem;
		height: 100%;
		flex-shrink: 0;
		background-color: var(--color-background);
		box-shadow: -20px 8px 15px -3px rgba(0, 0, 0, 0.1);
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
			height: var(--sidebar-h, 45vh); /* ← driven by drag */
			flex-shrink: 0;
			position: relative;
			z-index: 20; /* above map */
		}

		.map-layer {
			width: 100%;
			flex: 1 1 0; /* takes remaining space */
			min-height: 15vh;
			height: auto;
		}

		.analysis-layer {
			right: 0;
			bottom: var(--sidebar-h, 45vh); /* stays above sidebar */
		}
	}
</style>
