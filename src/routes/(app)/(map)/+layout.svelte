<script lang="ts">
	import { selectedCountryStore, sidebarState } from '$lib/core/stores/store.svelte.js';
	import TopicsSidebar from '$lib/components/sidebar/topicsSidebar.svelte';
	import Map from '$lib/components/map/map.svelte';

	let { data, children } = $props();

	let topicsVisible = $state(false);

	let lng = $state(-5.0684);
	let lat = $state(26.5199);
	let zoom = $state(2.67);

	// Lazy-load history once a snapshot is ready (but not loading)
	$effect(() => {
		if (
			selectedCountryStore.country &&
			!selectedCountryStore.loading &&
			!selectedCountryStore.historyLoaded
		) {
			selectedCountryStore.loadHistory();
		}
	});

	// -- Mobile drag --------
	let sidebarHeightVh = $state(45);
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
		const deltaVh = -((e.clientY - dragStartY) / window.innerHeight) * 100;
		sidebarHeightVh = Math.min(85, Math.max(15, dragStartHeight + deltaVh));
	}

	function onDragEnd() {
		isDragging = false;
		window.removeEventListener('pointermove', onDragMove);
		window.removeEventListener('pointerup', onDragEnd);
	}
</script>

<main>
	<article class="window" style="--sidebar-h: {sidebarHeightVh}vh">
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
				<span><strong>Lon</strong> {lng.toFixed(4)}</span>
				<span><strong>Lat</strong> {lat.toFixed(4)}</span>
				<span><strong>Zoom</strong> {zoom.toFixed(2)}</span>
			</div>

			<div class="analysis-layer">
				{@render children?.()}
			</div>
		</div>

		<!-- Persistent sidebar -->
		<div class="sidebar">
			<TopicsSidebar visible={true} selectedSidebar={sidebarState.selected} {onDragStart} />
		</div>
	</article>
</main>

<style>
	main {
		max-height: calc(100vh - 82px);
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

	.map-layer {
		flex: 1 1 0;
		position: relative;
	}

	.analysis-layer {
		position: absolute;
		inset: 0;
		z-index: 10;
		pointer-events: none;
	}

	.sidebar {
		z-index: 1;
		width: 41rem;
		min-width: 35rem;
		height: 100%;
		flex-shrink: 0;
		background-color: var(--color-background);
		box-shadow: -20px 8px 15px -3px rgba(0, 0, 0, 0.1);
	}

	.mapInfo {
		position: absolute;
		top: 12px;
		left: 12px;

		display: flex;
		gap: 12px;
		align-items: center;

		padding: 8px 12px;
		border-radius: 999px;

		background: rgba(255, 255, 255, 0.85);
		backdrop-filter: blur(12px);

		font-size: 13px;
		color: #222;

		box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1);
	}

	.mapInfo strong {
		font-weight: 600;
		color: #666;
		margin-right: 4px;
	}
	@media (max-width: 1200px) {
		.window {
			flex-direction: column;
		}

		.sidebar {
			width: 100%;
			min-width: 100%;
			max-width: 100%;
			height: var(--sidebar-h, 45vh);
			flex-shrink: 0;
			position: relative;
			z-index: 20;
		}

		.map-layer {
			width: 100%;
			flex: 1 1 0;
			min-height: 15vh;
			height: auto;
		}
	}
</style>
