<script lang="ts">
	import {
		FactoryIcon,
		LeafIcon,
		MedalIcon,
		RecycleIcon,
		ShieldIcon,
		TreeIcon,
		WarningIcon,
		WindIcon
	} from 'phosphor-svelte';
	import CollapsibleTopic from '../CollapsibleTopic/CollapsibleTopic.svelte';

	const props = {
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
</script>

<section class="topicSection" id="environment">
	<CollapsibleTopic topicName="Environment">
		<div class="flex-col">
			<div class="card flex-col wide">
				<div class="text-gray bold align-center">Environmental Performance Index</div>
				<div class="between">
					<div><b class="num-big">{props.envPerformance.score}</b></div>
					<div class="badge">Rank #{props.envPerformance.rank}</div>
				</div>
			</div>
			<div class="flex-row">
				<div class="card flex-col flex">
					<div><TreeIcon size={20} /></div>
					<div class="text-gray align-center">Forest Coverage</div>
					<div>
						<b class="num-mid">{props.forestCoverage}</b>
					</div>
				</div>
				<div class="card flex-col flex">
					<div><ShieldIcon size={20} /></div>
					<div class="text-gray align-center">Protected Areas</div>
					<div>
						<b class="num-mid">{props.protectedAreas}%</b>
					</div>
				</div>
			</div>
			<div class="flex-row">
				<div class="card flex-col flex">
					<div>
						<WindIcon size={20} />
					</div>
					<div class="text-gray align-center">Air Quality</div>
					<div>
						<b class="num-mid">{props.airQuality}</b>
					</div>
				</div>
				<div class="card flex-col flex">
					<div><RecycleIcon size={20} /></div>
					<div class="text-gray align-center">Recycling Rate</div>
					<div>
						<b class="num-mid">{props.recyclingRate}%</b>
					</div>
				</div>
			</div>
			<div class="card flex-col flex">
				<div class="text-gray bold align-center">
					<span><FactoryIcon size={20} /></span> Carbon Emissions
				</div>
				<div class="between">
					<div class="text-gray align-center">CO2 per Capita</div>
					<div class="bold">{props.co2.co2PerCapita}</div>
				</div>
				<div class="between">
					<div class="text-gray align-center">Total Emissions</div>
					<div class="bold">{props.co2.totalEmissions}</div>
				</div>
				<div class="between">
					<div class="text-gray align-center">World Rank</div>
					<div class="bold">#{props.co2.worldRank}</div>
				</div>
			</div>
			<div class="card flex-col flex">
				<div class="text-gray bold align-center">
					<span><TreeIcon size={20} /></span> Biodiversity
				</div>
				<div class="between">
					<div class="text-gray align-center"><span><LeafIcon size={20} /></span>Species</div>
					<div class="bold">{props.biodiversity.species}</div>
				</div>
				<div class="between">
					<div class="text-gray align-center"><span><MedalIcon size={20} /></span>Endemic</div>
					<div class="bold">{props.biodiversity.endemic}</div>
				</div>
				<div class="between">
					<div class="text-gray align-center"><span><WarningIcon size={20} /></span>Threatened</div>
					<div class="bold">{props.biodiversity.threatened}</div>
				</div>
			</div>
			<div class="card flex-col wide">
				<div class="text-gray bold align-center">
					<WarningIcon size={20} /> Natural Hazards
				</div>

				<hr />
				<div class="flex-row">
					{#each props.naturalHazards as hazard}
						<div class="small-card">
							{hazard}
						</div>
					{/each}
				</div>
			</div>
		</div>
		<p>CO2 emissions</p>
		<p>Environmental issues</p>
		<p>Environmental agreements</p>
		<p>Recruiting law</p>
	</CollapsibleTopic>
</section>

<style>
	.row {
		display: flex;
		gap: 16px;
	}
</style>
