<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import CountrySearch from '$lib/components/CountrySearch/CountrySearch.svelte';
	import { setSelectedMode } from './store.svelte.js';

	let { data, children } = $props();

	let loginState = $derived(data.user ? data.user.username : 'Sign in');
	let link = $derived(data.user ? '/auth/user' : '/auth/login');
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<header>
	<nav>
		<a href="/">Home</a>
		<!-- <input type="text" name="countrySearch" id="countrySearch" placeholder="Search country..." /> -->
		<CountrySearch
			onSelect={(country) => {
				console.log(country.cca2, country.name.common);
				// feed into your existing handleCountryClickLogic or store
			}}
		/>
		<!-- <a href="/auth/login">Auth</a> -->
	</nav>
	<nav>
		<div>
			<button onclick={() => setSelectedMode('map')}>Explore</button>
			<button onclick={() => setSelectedMode('analysis')}>Analysis</button>
			<button>Saved</button>
		</div>
		<a href={link} class="profile">{loginState}</a>
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
		gap: 1rem;

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
