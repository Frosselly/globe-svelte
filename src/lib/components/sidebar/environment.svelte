<script lang="ts">
	import FactoryIcon from 'phosphor-svelte/lib/FactoryIcon';
	import BirdIcon from 'phosphor-svelte/lib/BirdIcon';
	import RabbitIcon from 'phosphor-svelte/lib/RabbitIcon';
	import RecycleIcon from 'phosphor-svelte/lib/RecycleIcon';
	import FishIcon from 'phosphor-svelte/lib/FishIcon';
	import TreeIcon from 'phosphor-svelte/lib/TreeIcon';
	import WarningIcon from 'phosphor-svelte/lib/WarningIcon';
	import WindIcon from 'phosphor-svelte/lib/WindIcon';
	import CollapsibleTopic from '../CollapsibleTopic/CollapsibleTopic.svelte';
	import type { FullCountry } from '$lib/core/stores/store.svelte';
	import { formatLargeNumbers, formatText } from '$lib/core/utils/utils';
	const { c }: { c: FullCountry } = $props();

	const props2 = {
		forestCoverage: '68.4%',
		protectedAreas: '20.5%',
		airQuality: 'Good (AQI: 42)',
		waterAccess: '99%',
		recyclingRate: '20%',
		co2: {
			co2PerCapita: '8.5 tonnes',
			totalEmissions: '1.03B tonnes',
			worldRank: 5
		},
		biodiversity: {
			species: '90,000+',
			endemic: '~40%',
			threatened: '1,369 species'
		},
		naturalHazards: ['Earthquakes', 'Typhoons', 'Tsunamis', 'Volcanos'],
		envPerformance: {
			rank: 12,
			score: '75.1/100'
		}
	};

	// $effect(() => {
	// 	$inspect(c.naturalHazards);
	// });
</script>

<section class="topicSection" id="environment">
	<CollapsibleTopic topicName="Environment">
		<div class="flex-col">
			<div class="card flex-col wide">
				<div class="text-gray bold align-center">Environmental Performance Index</div>
				<div class="between">
					<div><b class="num-big">{c.envPerformanceIndex}/100</b></div>
					<!-- <div class="badge">Rank #{c.envPerformance.rank}</div> -->
				</div>
			</div>
			<div class="flex-row">
				<div class="card flex-col flex">
					<div><TreeIcon size={20} /></div>
					<div class="text-gray align-center">Forest Coverage</div>
					<div>
						<b class="num-mid">{c.forestCoverageCurrent}%</b>
					</div>
				</div>
				<!-- <div class="card flex-col flex">
					<div><ShieldIcon size={20} /></div>
					<div class="text-gray align-center">Protected Areas</div>
					<div>
						<b class="num-mid">{c.protectedAreas}%</b>
					</div>
				</div> -->
			</div>
			<div class="flex-row">
				<div class="card flex-col flex">
					<div>
						<WindIcon size={20} />
					</div>
					<div class="text-gray align-center">Air Quality</div>
					<div>
						<b class="num-mid">{c.airQuality}/100</b>
					</div>
				</div>
				<div class="card flex-col flex">
					<div><RecycleIcon size={20} /></div>
					<div class="text-gray align-center">Recycling Rate</div>
					<div>
						<b class="num-mid">{c.recyclingRateIndex}/100</b>
					</div>
				</div>
			</div>
			<div class="card flex-col flex">
				<div class="text-gray bold align-center">
					<span><FactoryIcon size={20} /></span> Carbon Emissions
				</div>
				<!-- <div class="between">
					<div class="text-gray align-center">CO2 per Capita</div>
					<div class="bold">{c.co2.co2PerCapita}</div>
				</div> -->
				<div class="between">
					<div class="text-gray align-center">Total Emissions</div>
					<div class="bold">{c.co2Current ? formatLargeNumbers(c.co2Current) : '-'}</div>
				</div>
				<!-- <div class="between">
					<div class="text-gray align-center">World Rank</div>
					<div class="bold">#{c.co2.worldRank}</div>
				</div> -->
			</div>
			<div class="card flex-col flex">
				<div class="text-gray bold align-center">
					<span><TreeIcon size={20} /></span> Threatened species
				</div>
				{#if c.threatenedSpecies?.mammal && c.threatenedSpecies?.fishes && c.threatenedSpecies?.birds}
					<div class="between">
						<div class="text-gray align-center"><span><RabbitIcon size={20} /></span>Mammals</div>
						<div class="bold">{c.threatenedSpecies?.mammal}</div>
					</div>
					<div class="between">
						<div class="text-gray align-center"><span><FishIcon size={20} /></span>Fishes</div>
						<div class="bold">{c.threatenedSpecies?.fishes}</div>
					</div>
					<div class="between">
						<div class="text-gray align-center"><span><BirdIcon size={20} /></span>Birds</div>
						<div class="bold">{c.threatenedSpecies?.birds}</div>
					</div>
				{:else}
					<span class="missing">No data</span>
				{/if}
			</div>
			<div class="card flex-col wide">
				<div class="text-gray bold align-center">
					<WarningIcon size={20} /> Natural Hazards
				</div>

				<hr />
				{#if c.naturalHazards}
					<div class="flex-row">
						{#each Object.entries(c.naturalHazards) as [hazardKey, hazardValue]}
							<div class="small-card">
								{formatText(hazardKey)}:
								<strong>{hazardValue}</strong>
							</div>
						{/each}
					</div>
				{:else}
					<span class="missing">No data</span>
				{/if}
			</div>
		</div>
	</CollapsibleTopic>
</section>

<style>
	.row {
		display: flex;
		gap: 16px;
	}
</style>
