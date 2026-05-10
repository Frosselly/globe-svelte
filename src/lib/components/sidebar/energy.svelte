<script>
	import SmallGraphIcon from '$lib/components/smallGraphIcon.svelte';
	import ChartBarIcon from 'phosphor-svelte/lib/ChartBarIcon';
	import FactoryIcon from 'phosphor-svelte/lib/FactoryIcon';
	import LeafIcon from 'phosphor-svelte/lib/LeafIcon';
	import TargetIcon from 'phosphor-svelte/lib/TargetIcon';
	import CollapsibleTopic from '../CollapsibleTopic/CollapsibleTopic.svelte';
	import { formatLargeNumbers } from '$lib/core/utils/utils';
	import MediumGraph from '../mediumGraph.svelte';

	const props = $props();

	$effect(() => {
		$inspect(props);
	});

	const props2 = {
		renewableGrowth: 22.4,
		renewablePercentage: 45.3,
		totalProduction: '500 TWh',
		totalConsumption: '480 TWh',
		CO2Emissions: '300 Mt',
		production: {
			renewable: 45.3,
			fossil: 40.2,
			nuclear: 14.5
		},
		consumption: {
			residential: 30.1,
			commercial: 25.4,
			industrial: 20.3,
			transportation: 24.2
		},
		renewableSources: {
			solar: 15.2,
			wind: 20.1,
			hydro: 10.0
		},
		infrastructure: {
			powerPlants: 150,
			transmissionLines: '100,000 km',
			substations: 500
		},
		energyImports: '20%',
		energyExports: '10%',
		energyPolicies: {},
		climateTargets: {
			CO2Reduction: '50% by 2030',
			netZero: '2050'
		}
	};
</script>

<section class="topicSection" id="energy">
	<CollapsibleTopic topicName={'Energy'}>
		<div class="flex-col">
			<div class="flex-row">
				<div class="card flex-col flex">
					<div class="text-gray bold">Renewable Growth</div>
					<br />
					<div>
						<b class="num-big">{props.renewableGrowth.current.toFixed(1)}%</b>
						<SmallGraphIcon sign="+" trend={props.renewableGrowth.trend} />
					</div>
					<div class="graph">
						<MediumGraph data={props.renewableGrowth.historicalData} toFixed={0} extraSign={'%'} />
					</div>
				</div>
				<div class=" flex-col flex">
					<div class="flex-row">
						<div class="card flex-col flex">
							<div class="text-gray bold">Production</div>
							<div><b class="num-mid">{formatLargeNumbers(props.production.current)}</b></div>
						</div>
						<div class="card flex-col flex">
							<div class="text-gray bold">Consumption</div>
							<div><b class="num-mid">{formatLargeNumbers(props.consumption.current)}</b></div>
						</div>
					</div>
					<div class="card flex-col flex">
						<div class="text-gray bold">CO2 Emissions</div>
						<div><b class="num-mid">{formatLargeNumbers(props.co2Emissions.current)}</b></div>
					</div>
				</div>
			</div>
			<div class="card flex-col wide">
				<div class="text-gray bold align-center">
					<ChartBarIcon size={20} /> Energy Mix
				</div>

				<br />

				<div class="flex-col">
					{#each [...props.energyMix.current].sort((a, b) => b.percentage - a.percentage) as item}
						<div class="flex-col">
							<div class="between">
								<div>
									{item.name}
								</div>
								<div>{item.percentage.toFixed(1)}%</div>
							</div>

							<div class="progress-bar">
								<div class="progress-fill" style="width: {item.percentage}%;"></div>
							</div>
						</div>
					{/each}
				</div>
			</div>
			<div class="flex-row">
				<!-- <div class="card flex-col flex">
					<div class="text-gray bold align-center">
						<LeafIcon size={20} /> Renewable Sources
					</div>
					<br />
					<div class="grid-2">
						{#each Object.entries(props.renewableSources) as [key, value]}
							<div class=" flex-row between">
								<div class="text-gray">
									<span><img src="" alt={key + '-icon'} /></span>
									{key}
								</div>
								<div><b>{value}%</b></div>
							</div>
						{/each}
					</div>
				</div> -->
				<!-- <div class="card flex-col flex">
					<div class="text-gray bold align-center"><FactoryIcon size={20} /> Infrastructure</div>
					<br />
					{#each Object.entries(props.infrastructure) as [key, value]}
						<div class="info-card flex-col">
							<div class="text-gray">{key.charAt(0).toUpperCase() + key.slice(1)}</div>
							<div><b>{value}</b></div>
						</div>
					{/each}
				</div> -->
			</div>
			{#if props.targets && props.targets.length > 0}
				<div class="card flex-col wide">
					<div class="text-gray bold align-center">
						<TargetIcon size={20} /> Climate & Energy Targets
					</div>
					<br />
					<div class="flex-col">
						{#each props.targets as target}
							<div class="info-card flex-col flex center">
								<div class="text-gray">{target.title}</div>
								<div><b>{target.startYear} - {target.endYear || ''}</b></div>
							</div>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	</CollapsibleTopic>
</section>

<style>
</style>
