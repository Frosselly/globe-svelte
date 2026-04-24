<script>
	import SmallGraphIcon from '$lib/components/smallGraphIcon.svelte';
	import { ChartBarIcon, FactoryIcon, LeafIcon, TargetIcon } from 'phosphor-svelte';
	import CollapsibleTopic from '../CollapsibleTopic/CollapsibleTopic.svelte';

	const props = {
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
						<b class="num-big">{props.renewableGrowth.toFixed(1)}%</b>
						<SmallGraphIcon sign="+" trend={props.renewableGrowth} />
					</div>
					<div class="graph"></div>
				</div>
				<div class=" flex-col flex">
					<div class="flex-row">
						<div class="card flex-col flex">
							<div class="text-gray bold">Production</div>
							<div><b class="num-mid">{props.totalProduction}</b></div>
						</div>
						<div class="card flex-col flex">
							<div class="text-gray bold">Consumption</div>
							<div><b class="num-mid">{props.totalConsumption}</b></div>
						</div>
					</div>
					<div class="card flex-col flex">
						<div class="text-gray bold">CO2 Emissions</div>
						<div><b class="num-mid">{props.CO2Emissions}</b></div>
					</div>
				</div>
			</div>
			<div class="card flex-col wide">
				<div class="text-gray bold align-center">
					<ChartBarIcon size={20} /> Energy Mix
				</div>
				<br />
				<div class="flex-col">
					{#each Object.entries(props.production) as [key, value]}
						<div class=" flex-col">
							<div class="between">
								<div><span><img src="" alt="from-key" /></span> {key}</div>
								<div>{value}%</div>
							</div>
							<div class="progress-bar">
								<div class="progress-fill" style="width: {value}%;"></div>
							</div>
						</div>
					{/each}
				</div>
			</div>
			<div class="flex-row">
				<div class="card flex-col flex">
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
				</div>
				<div class="card flex-col flex">
					<div class="text-gray bold align-center"><FactoryIcon size={20} /> Infrastructure</div>
					<br />
					{#each Object.entries(props.infrastructure) as [key, value]}
						<div class="info-card flex-col">
							<div class="text-gray">{key.charAt(0).toUpperCase() + key.slice(1)}</div>
							<div><b>{value}</b></div>
						</div>
					{/each}
				</div>
			</div>
			<div class="card flex-col wide">
				<div class="text-gray bold align-center">
					<TargetIcon size={20} /> Climate & Energy Targets
				</div>
				<br />
				<div class="flex-row">
					{#each Object.entries(props.climateTargets) as [key, value]}
						<div class="info-card flex-col flex center">
							<div class="text-gray">{key.charAt(0).toUpperCase() + key.slice(1)}</div>
							<div><b>{value}</b></div>
						</div>
					{/each}
				</div>
			</div>
		</div>
	</CollapsibleTopic>
</section>

<style>
</style>
