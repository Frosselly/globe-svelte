<script lang="ts">
	import '../globals.css';

	import globeIcon from '$lib/assets/globe-icon.svg';
	import CountrySearch from '$lib/components/CountrySearch/CountrySearch.svelte';
	import { setSelectedSidebar, sidebarState } from '$lib/core/stores/store.svelte.js';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	let { data, children } = $props();

	let current_url = $derived(page.url.pathname.split('/').filter(Boolean)[0] || '/');
</script>

<svelte:head>
	<link rel="icon" href={globeIcon} />
	<title>Project Earth</title>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
	<link href="https://fonts.googleapis.com/css2?family=Metrophobic&display=swap" rel="stylesheet" />
</svelte:head>

<header>
	<nav>
		<a href="/"> <img class="icon" src={globeIcon} alt="" /></a>

		<CountrySearch
			onSelect={(country) => {
				// // console.log(country.cca2, country.name.common);
			}}
		/>
	</nav>
	<nav>
		{#if data.user?.isAdmin}
			<a href={'/auth/admin'} class="btn btn-sm btn-default">Manage users</a>
		{/if}
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
				class:save-selected={sidebarState.selected === 'saved'}
				onclick={() =>
					setSelectedSidebar(sidebarState.selected === 'saved' ? 'countryInfo' : 'saved')}
				>Saved</button
			>
		</div>
	</nav>
</header>

{@render children()}

<style>
	:global {
		body,
		html {
			height: 100%;
			overflow: hidden;
		}
		* {
			margin: 0;
			font-family: 'Metrophobic', sans-serif;
			/*font-weight: 300;*/
		}
		h3 {
			text-decoration: underline;
		}
		.btn {
			/*font-family: 'Metrophobic', sans-serif;*/
			display: inline-flex;
			align-items: center;
			justify-content: center;
			gap: 6px;
			border-radius: 8px;
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
			/*user-select: none;*/
			color: var(--color-background);
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
	@media (max-width: 768px) {
		:global {
			h2 {
				font-size: 1.2rem;
			}
		}
	}
	.save-selected {
		background: #8ee1fa;
	}
	.icon {
		box-sizing: border-box;
		height: auto;
		width: 50px;
		padding: 2px;
	}

	/*.countrySearch {
		max-height: 24px;
		margin-bottom: 8px;
	}*/
	header {
		z-index: 2;
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.6rem 1rem;
		padding-top: 1rem;
		max-height: 82px;
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
</style>
