<script lang="ts">
	import './style.css';
	import Overview from './overview.svelte';
	import Tourism from './tourism.svelte';
	import Economy from './economy.svelte';
	import Energy from './energy.svelte';
	import Environment from './environment.svelte';
	import Demographics from './demographics.svelte';
	import Military from './military.svelte';
	import { fly } from 'svelte/transition';
	// import { getCountryMetadataClean } from '$lib/components/countryData/country-metadata';
	// import { getCountryGeneralInfo } from '$lib/components/countryData/country-general';
	import CurrencyDollarIcon from 'phosphor-svelte/lib/CurrencyDollarIcon';
	import MapPinIcon from 'phosphor-svelte/lib/MapPinIcon';
	import UserIcon from 'phosphor-svelte/lib/UserIcon';

	import SmallGraphIcon from '$lib/components/smallGraphIcon.svelte';
	import { mapState, setCurrentDataset } from '$lib/components/map/mapStore.svelte';
	import { getContext } from 'svelte';
	import { countriesStore, modeState, selectedCountryStore } from '../../../routes/store.svelte';
	import { formatLargeNumbers } from '$lib/utils/utils';

	let selectedTopic = $state('overview');
	let { visible } = $props();
	// let countryData = $state(loadCountryData('FRA'));
	// let countryData = $state({
	// 	metadata: {
	// 		name: 'France',
	// 		population: 67000000,
	// 		gdp: 3000000000000,
	// 		area: 640679
	// 	}
	// });
	const countryData = $derived(selectedCountryStore.country);

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
		if (selectedCountryStore.country)
			console.log('cahnges', selectedCountryStore.country?.metadata);
	});
</script>

{#if visible}
	<div class="content" in:fly={{ x: 300, duration: 300 }} out:fly={{ x: 300, duration: 300 }}>
		<div class="drag-point">
			<hr />
		</div>
		<br />
		<section class="topicSection">
			<div class="row">
				{#if countryData}
					<div class="row">
						<figure class="country-flag">
							<picture>
								<img src="" alt="" />
							</picture>
						</figure>
						<div>
							<h2>{countryData?.metadata?.name.common}</h2>
							<h3>{countryData?.metadata?.capital[0]}</h3>
						</div>
					</div>
				{/if}
			</div>
			<hr />
			<div class="carousel">
				<div
					class="card card-selectable flex"
					onclick={() => {
						// switchDataset('population');
						console.log('sidebar', mapState.currentDataset);

						if (mapState.currentDataset) {
							setCurrentDataset('');
						} else {
							setCurrentDataset('population');
						}
					}}
				>
					<div>
						<span><UserIcon size={16} /></span>
						<span><b> Population</b></span>
					</div>
					<div><b>{formatLargeNumbers(Number(countryData?.metadata?.population))}</b></div>
					<!-- <div class="between">
						<span>Rank #11</span>
						<SmallGraphIcon sign="+" trend={1.2} />
					</div> -->
				</div>
				<div class="card card-selectable flex">
					<div class="flex-row">
						<span><CurrencyDollarIcon size={16} /></span>
						<span><b> GDP</b></span>
					</div>
					<div><b>{formatLargeNumbers(Number(countryData?.economyInfo?.gdp?.current))}</b></div>
					<!-- <div class="between">
						<span>Rank #11</span>
						<SmallGraphIcon sign="+" trend={0.3} />
					</div> -->
				</div>
				<div class="card card-selectable flex">
					<div class="flex-row">
						<span><MapPinIcon size={16} /></span>
						<span><b> Area</b></span>
					</div>
					<div><b>{formatLargeNumbers(Number(countryData?.metadata?.area))}</b></div>
					<!-- <div class="between">
						<span>Rank #11</span>
						<span>~Germany</span>
					</div> -->
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
		<!-- TODO: add later then data is wrangled -->
		<!-- <Overview />
		<Demographics /> -->
		{#if countryData?.tourismInfo}
			<Economy {...countryData?.economyInfo} />
		{/if}
		{#if countryData?.energyInfo}
			<Energy {...countryData?.energyInfo} />
		{/if}
		{#if countryData?.tourismInfo}
			<Tourism {...countryData?.tourismInfo} />
		{/if}
		<!-- <Environment /> -->
		<!-- <Military /> -->
	</div>
{:else}
	<div>Click on a country</div>
{/if}

<style>
	.drag-point {
		display: none;
	}
	@media (max-width: 1200px) {
		.drag-point {
			display: block;
			position: fixed;
			width: 100%;
			background-color: hsl(0, 0%, 97%);
			border: hsl(0, 0%, 95%) solid 1px;
			height: 20px;
		}
	}
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

	/* .container {
		position: absolute;
		right: 0;
		top: 0;
		bottom: 0;

		background-color: white;
		/* width: 40rem; */
	/* } */

	.content {
		display: flex;
		flex-direction: column;
		height: 100%;
		overflow-y: auto;
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
			padding-inline: 2rem;
			padding-block: 1rem;
		}
	}
</style>
