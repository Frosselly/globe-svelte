<script lang="ts">
	import SmallGraphIcon from '$lib/components/smallGraphIcon.svelte';
	import ChartBarIcon from 'phosphor-svelte/lib/ChartBarIcon';
	import FactoryIcon from 'phosphor-svelte/lib/FactoryIcon';
	import LeafIcon from 'phosphor-svelte/lib/LeafIcon';
	import LightningIcon from 'phosphor-svelte/lib/LightningIcon';

	import TargetIcon from 'phosphor-svelte/lib/TargetIcon';
	import CollapsibleTopic from '../CollapsibleTopic/CollapsibleTopic.svelte';
	import { formatLargeNumbers } from '$lib/core/utils/utils';
	import MediumGraph from '../mediumGraph.svelte';
	import type { FullCountry } from '$lib/core/stores/store.svelte';
	import { TOPIC_COLORS } from '$lib/core/globals';

	const { e }: { e: FullCountry } = $props();

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

	$effect(() => {
		// console.log('e.energyMixCurrent', e.energyMixCurrent);
	});
</script>

<section class="topicSection" id="energy">
	<CollapsibleTopic topicName="Energy" Icon={LightningIcon} bgColor={TOPIC_COLORS.energy}>
		<div class="flex-col">
			<div class="flex-row">
				{#if e.renewableCurrent}
					<div class="card flex-col flex" style="max-width: 16rem;">
						<div class="text-gray bold">Renewable Growth</div>
						<br />
						<div>
							<b class="num-big">{e?.renewableCurrent.toFixed(1)}%</b>
							<SmallGraphIcon sign="+" trend={e.renewableTrend} />
						</div>
						{#if e.renewableHistory && e.renewableHistory.length}
							<div class="graph">
								<MediumGraph data={e.renewableHistory} toFixed={0} extraSign={'%'} />
							</div>
						{:else}
							<div class="graph-placeholder"><span class="text-gray">No data</span></div>
						{/if}
					</div>
				{:else}
					<span class="missing">No data</span>
				{/if}
				<div class=" flex-col flex">
					<div class="flex-row">
						<div class="card flex-col flex">
							<div class="text-gray bold">Production</div>
							<div>
								<b class="num-mid"
									>{e.productionCurrent ? formatLargeNumbers(e.productionCurrent) : '-'}</b
								>
							</div>
						</div>
						<div class="card flex-col flex">
							<div class="text-gray bold">Consumption</div>
							<div>
								<b class="num-mid"
									>{e.consumptionCurrent ? formatLargeNumbers(e.consumptionCurrent) : '-'}</b
								>
							</div>
						</div>
					</div>
					<div class="card flex-col flex">
						<div class="text-gray bold">CO2 Emissions</div>
						<div>
							<b class="num-mid">{e.co2Current ? formatLargeNumbers(e.co2Current) : '-'}</b>
						</div>
					</div>
				</div>
			</div>
			<div class="card flex-col wide">
				<div class="text-gray bold align-center">
					<ChartBarIcon size={20} /> Energy Mix
				</div>

				<br />

				<div class="flex-col">
					{#if e.energyMixCurrent}
						{#each (e.energyMixCurrent ?? [])
							.slice()
							.sort((a, b) => b.percentage - a.percentage) as item (item.name)}
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
					{:else}
						<div class="missing"><span class="text-gray">No data</span></div>
					{/if}
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
			{#if e.targets && e.targets.length > 0}
				<div class="card flex-col wide">
					<div class="text-gray bold align-center">
						<TargetIcon size={20} /> Climate & Energy Targets
					</div>
					<br />
					<div class="flex-col">
						{#each e.targets as target}
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
