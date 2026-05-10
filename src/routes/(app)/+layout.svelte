<script lang="ts">
	import '../globals.css';

	import favicon from '$lib/assets/favicon.svg';
	import globeIcon from '$lib/assets/globe-icon.svg';
	import CountrySearch from '$lib/components/CountrySearch/CountrySearch.svelte';
	import {
		countriesStore,
		modeState,
		selectedCountryStore,
		setSelectedMode,
		setSelectedSidebar,
		sidebarState
	} from '$lib/core/stores/store.svelte.js';
	import TopicsSidebar from '$lib/components/sidebar/topicsSidebar.svelte';
	import Map from '$lib/components/map/map.svelte';
	import AnalysisMode from '$lib/components/analysis-mode/analysisMode.svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	let { data, children } = $props();
	let selectedMode = $derived(modeState.selected);

	let current_url = $state($page.url.pathname.split('/').filter(Boolean).pop() || '/');

	// Set it as soon as pages update
	$effect(() => {
		current_url = $page.url.pathname.split('/').filter(Boolean).pop() || '/';
		console.log('curr URL', current_url);
	});

	let topicsVisible = $state(false);

	const countryData = $derived(selectedCountryStore.country);

	let lng = $state(-5.0684);
	let lat = $state(26.5199);
	let zoom = $state(2.67);
	let initialState = { lng, lat, zoom };

	let loginState = $derived(data.user ? data.user.username : 'Sign in');
	let link = $derived(data.user ? '/auth/user' : '/auth/login');
	$effect(() => {
		$inspect('mode', modeState.selected);
		$inspect('selectedMode', selectedMode);
		if (modeState.selected) console.log(modeState.selected);
		$inspect('selectedCountryStore.country', selectedCountryStore.country);
		$inspect('gdpHistory', selectedCountryStore.country?.gdpHistory);

		if (selectedCountryStore.country && !selectedCountryStore.historyLoaded)
			selectedCountryStore.loadHistory();
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<header>
	<nav>
		<a href="/"> <img class="icon" src={globeIcon} alt="" /></a>
		<!-- <input type="text" name="countrySearch" id="countrySearch" placeholder="Search country..." /> -->
		<div class="countrySearch">
			<CountrySearch
				onSelect={(country) => {
					console.log(country.cca2, country.name.common);
					// feed into your existing handleCountryClickLogic or store
				}}
			/>
		</div>
		<!-- <a href="/auth/login">Auth</a> -->
	</nav>
	<nav>
		<a href={'/userManagement'} class="btn btn-sm btn-default">Manage users</a>
		<a href={'/'} class="btn btn-sm btn-default">Map</a>
	</nav>
	<nav>
		<div>
			<button
				class="btn btn-sm btn-default"
				disabled={current_url === '/'}
				onclick={() => goto('/')}
			>
				Explore
			</button>
			<button
				class="btn btn-sm btn-default"
				disabled={current_url === 'analysis'}
				onclick={() => goto('/analysis')}>Analysis</button
			>
			<button
				class="btn btn-sm btn-default"
				onclick={() =>
					setSelectedSidebar(sidebarState.selected === 'saved' ? 'countryInfo' : 'saved')}
				>Saved</button
			>
		</div>
		<a href={link} class="btn btn-sm btn-primary">{loginState}</a>
	</nav>
</header>

<main>
	<article class="window">
		<!-- Persistent map -->
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
				Longitude: {lng.toFixed(4)}
				| Latitude: {lat.toFixed(4)}
				| Zoom: {zoom.toFixed(2)}
			</div>
		</div>

		<!-- Route overlay area -->
		<div class="main-content analysis-layer">
			<!-- {#if countryData}
				<AnalysisMode onClose={() => setSelectedMode('map')} />
			{/if} -->
			{@render children()}
		</div>

		<!-- Persistent sidebar -->
		<div class="sidebar">
			<TopicsSidebar visible={true} {countryData} selectedSidebar={sidebarState.selected} />
		</div>
	</article>
</main>

<style>
	:global {
		body,
		html {
			height: 100%;
			overflow: hidden;
		}
		* {
			margin: 0;
		}
		h3 {
			text-decoration: underline;
		}
		.btn {
			display: inline-flex;
			align-items: center;
			justify-content: center;
			gap: 6px;
			border-radius: 8px;
			font-family: inherit;
			font-weight: 500;
			font-size: 14px;
			line-height: 1;
			cursor: pointer;
			border: none;
			outline: none;
			transition:
				background 120ms ease,
				color 120ms ease,
				box-shadow 120ms ease,
				transform 80ms ease,
				opacity 120ms ease;
			white-space: nowrap;
			user-select: none;
		}
		.btn:active {
			transform: scale(0.97);
		}
		.btn:focus-visible {
			box-shadow: 0 0 0 3px color-mix(in srgb, currentColor 25%, transparent);
		}
		.btn:disabled {
			opacity: 0.45;
			cursor: not-allowed;
			pointer-events: none;
		}

		/* sizes */
		.btn-sm {
			height: 30px;
			padding: 0 10px;
			font-size: 13px;
			border-radius: 6px;
		}
		.btn-md {
			height: 36px;
			padding: 0 14px;
		}
		.btn-lg {
			height: 42px;
			padding: 0 20px;
			font-size: 15px;
		}
		.btn-icon {
			width: 36px;
			height: 36px;
			padding: 0;
		}
		/* variants */
		.btn-primary {
			background: var(--color-primary);
			color: #fff;
			border: 0.5px solid transparent;
		}
		.btn-primary:hover {
			opacity: 0.88;
		}
		.btn-default {
			background: var(--color-background);
			color: var(--color-text);
			border: 0.5px solid rgba(0, 0, 0, 0.18);
		}
		.btn-default:hover {
			background: #f5f5f5;
		}
	}
	.icon {
		height: auto;
		width: 50px;
		padding: 2px;
	}

	.countrySearch {
		max-height: 24px;
		margin-bottom: 8px;
	}
	header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem;
		height: 3dvh;
		font-size: 1.3rem;

		border-bottom: black solid 1px;
	}
	nav {
		display: flex;
		align-items: center;
		gap: 1rem;

		a {
			text-decoration: none;
		}

		a:visited {
			color: black;
		}
		a:hover {
			color: blue;
		}
	}

	main {
		max-height: 95%;
		height: 100%;

		display: flex;
		flex-direction: column;

		width: 100%;
	}
	.profile {
		box-sizing: border-box;
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
		width: 40rem;
		min-width: 35rem;
		height: 100%;
		flex-shrink: 0;
		background-color: var(--color-background);
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
