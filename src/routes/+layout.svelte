<script lang="ts">
	import './globals.css';

	import favicon from '$lib/assets/favicon.svg';
	import globeIcon from '$lib/assets/globe-icon.svg';
	import CountrySearch from '$lib/components/CountrySearch/CountrySearch.svelte';
	import { modeState, setSelectedMode, setSelectedSidebar, sidebarState } from './store.svelte.js';

	let { data, children } = $props();
	let selectedMode = $derived(modeState.selected);

	let loginState = $derived(data.user ? data.user.username : 'Sign in');
	let link = $derived(data.user ? '/auth/user' : '/auth/login');
	$effect(() => {
		$inspect('mode', modeState.selected);
		$inspect('selectedMode', selectedMode);
		if (modeState.selected) return;
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
				disabled={selectedMode === 'map'}
				onclick={() => setSelectedMode('map')}
			>
				Explore
			</button>
			<button
				class="btn btn-sm btn-default"
				disabled={selectedMode === 'analysis'}
				onclick={() => setSelectedMode('analysis')}>Analysis</button
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

<article>
	{@render children()}
</article>

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

	article {
		max-height: 95%;
		height: 100%;

		display: flex;
		flex-direction: column;

		width: 100%;
	}
	.profile {
		box-sizing: border-box;
	}
</style>
