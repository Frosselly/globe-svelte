<script lang="ts">
	import './style.css';
	import Overview from './overview/overview.svelte';
	import Tourism from './tourism/tourism.svelte';
	import Economy from './economy/economy.svelte';
	import Energy from './energy/energy.svelte';
	import Environment from './environment/environment.svelte';
	import Demographics from './demographics/demographics.svelte';
	import Military from './military/military.svelte';
	import Health from './health/health.svelte';
	import { fly } from 'svelte/transition';
	import { getCountryMetadataClean } from '$lib/components/countryData/country-metadata';
	// import { getCountryGeneralInfo } from '$lib/components/countryData/country-general';
	import { load as loadCountryData, getCountryData } from '../store.svelte';
	import { CurrencyDollarIcon, MapPinIcon, UserIcon } from 'phosphor-svelte';
	import Graph from '$lib/components/graph.svelte';

	let selectedTopic = $state('overview');
	let visible = $state(true);
	// let countryData = $state(loadCountryData('FRA'));
	let countryData = $state({
		metadata: {
			name: 'France',
			population: 67000000,
			gdp: 3000000000000,
			area: 640679
		}
	});

	const topics = [
		{ id: 'overview', label: 'Overview' },
		{ id: 'tourism', label: 'Tourism' },
		{ id: 'economy', label: 'Economy' },
		{ id: 'energy', label: 'Energy' },
		{ id: 'environment', label: 'Environment' },
		{ id: 'military', label: 'Military' },
		{ id: 'demographics', label: 'Demographics' },
		{ id: 'health', label: 'Health' }
	];

	function scrollToSection(id: string) {
		selectedTopic = id;
		const element = document.getElementById(id);
		if (element) {
			element.scrollIntoView({ behavior: 'smooth' });
		}
	}

	$effect(() => {
		// loadCountryData('FRA');
	});
</script>

<div class="window">
	<button
		onclick={() => {
			visible = true;
		}}>Open about</button
	>
	<button
		onclick={() => {
			visible = false;
		}}>Close about</button
	>
	{#if visible}
		<div class="container" in:fly={{ x: 300, duration: 300 }} out:fly={{ x: 300, duration: 300 }}>
			<nav>
				{#each topics as topic}
					<button
						class:selected={selectedTopic === topic.id}
						onclick={() => scrollToSection(topic.id)}
					>
						{topic.label}
					</button>
				{/each}
			</nav>
			<div class="content">
				<section class="topicSection">
					<div class="row">
						{#await countryData then cData}
							<div class="row">
								<figure class="country-flag">
									<picture>
										<img src="" alt="" />
									</picture>
								</figure>
								<div>
									<h2>{cData?.metadata?.name}</h2>
									<h3>Paris</h3>
								</div>
							</div>
						{/await}
					</div>
					<hr />
					<div class="carousel">
						<div class="card flex">
							<div>
								<span><UserIcon size={16} /></span>
								<span><b> Population</b></span>
							</div>
							<div><b>125.7M</b></div>
							<div class="between">
								<span>Rank #11</span>
								<Graph sign="+" trend={1.2} />
							</div>
						</div>
						<div class="card flex">
							<div class="flex-row">
								<span><CurrencyDollarIcon size={16} /></span>
								<span><b> GDP</b></span>
							</div>
							<div><b>125.7M</b></div>
							<div class="between">
								<span>Rank #11</span>
								<Graph sign="+" trend={0.3} />
							</div>
						</div>
						<div class="card flex">
							<div class="flex-row">
								<span><MapPinIcon size={16} /></span>
								<span><b> Area</b></span>
							</div>
							<div><b>125.7M</b></div>
							<div class="between">
								<span>Rank #11</span>
								<span>~Germany</span>
							</div>
						</div>
					</div>
					<!-- {#await getMetadata}
						<p>loading...</p>
					{:then meta}
						<p>Population: {meta.population}</p>
						<p>GDP: {meta.gdp}</p>
						<p>Area: {meta.area}</p>
					{/await} -->
				</section>
				<Overview />
				<Tourism />
				<Economy />
				<Energy />
				<Environment />
				<Military />
				<Demographics />
				<Health />
			</div>
		</div>
	{/if}
</div>

<style>
	.between {
		display: flex;
		justify-content: space-between;
	}
	.country-flag picture {
		width: 80px;
		height: 50px;
		background-color: gray;
	}
	.main-card {
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 8px;
		padding: 1.5rem;
		padding-block: 4rem;
		background-color: rgb(247, 247, 247);
		flex: 1;
	}
	.carousel {
		display: flex;
		gap: 16px;
		width: 100%;
	}
	.row {
		display: flex;
		gap: 16px;
	}
	nav {
		position: absolute;
		left: -8rem;

		display: flex;
		flex-direction: column;
	}
	button {
		padding: 0.8rem;
		border: none;
		background-color: white;
		cursor: pointer;
		font-size: 1rem;
	}
	button:hover {
		background-color: #f0f0f0;
	}
	.window {
		position: relative;
		flex: 1;
		background-color: black;
	}

	.container {
		position: absolute;
		right: 0;
		top: 0;
		bottom: 0;

		background-color: white;
		width: 50rem;
	}

	.content {
		display: flex;
		flex-direction: column;
		overflow-y: scroll;
		height: 100%;
	}

	:global {
		.strong-hr {
			border: none;
			border-top: 2px solid black;
		}
		.topicSection {
			display: flex;
			flex-direction: column;
			gap: 16px;
			padding: 2rem;
		}
	}
</style>
