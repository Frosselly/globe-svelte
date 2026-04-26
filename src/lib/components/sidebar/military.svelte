<script lang="ts">
	import SmallGraphIcon from '$lib/components/smallGraphIcon.svelte';
	import GlobeIcon from 'phosphor-svelte/lib/GlobeIcon';
	import MedalMilitaryIcon from 'phosphor-svelte/lib/MedalMilitaryIcon';
	import TargetIcon from 'phosphor-svelte/lib/TargetIcon';
	import TrendUpIcon from 'phosphor-svelte/lib/TrendUpIcon';
	import WarehouseIcon from 'phosphor-svelte/lib/WarehouseIcon';
	import CollapsibleTopic from '../CollapsibleTopic/CollapsibleTopic.svelte';

	const props = {
		defenseBudget: 31.9,
		budgetChange: 12.4,
		globalRank: 11,
		gdpPercent: 4.2,
		personnel: 500000,
		reserve: 200000,
		miliatryBranch: {
			Army: 90,
			Navy: 60,
			AirForce: 80
		},
		militaryEquipment: {
			Tanks: 500,
			FighterJets: 200,
			NavalShips: 50
		},
		alliances: ['Alliance A', 'Alliance B', 'Alliance C'],
		organizations: ['UN', 'NATO', 'ASEAN'],
		capabilities: {
			'Nuclear weapons': 80,
			'Space program': 'JAXA',
			'Cyber command': 'Established',
			'Misslie defense': 'Aegis, SM-3'
		},
		trend: {
			status: 'Increasing',
			note: 'Highest in Asia after China'
		}
	};
</script>

<section class="topicSection" id="military">
	<CollapsibleTopic topicName={'Military'}>
		<div class="flex-col">
			<div class="flex-row">
				<div class="card flex-col flex">
					<div class="text-gray bold">Defense Budget</div>
					<br />
					<div>
						<b class="num-big">{props.defenseBudget}B</b>
						<SmallGraphIcon sign="+" trend={props.budgetChange} />
					</div>
					<div class="graph"></div>
				</div>
				<div class=" flex-col flex">
					<div class="flex-row">
						<div class="card flex-col flex">
							<div class="text-gray bold">Global Rank</div>
							<div><b class="num-mid">{props.globalRank}</b></div>
						</div>
						<div class="card flex-col flex">
							<div class="text-gray bold">% of GDP</div>
							<div><b class="num-mid">{props.gdpPercent}%</b></div>
						</div>
					</div>
					<div class="card flex-col flex">
						<div class="text-gray bold between">
							<span>Total Personnel</span><span>Reserve</span>
						</div>
						<div class="between">
							<b class="num-mid">{props.personnel}</b><b>{props.reserve}</b>
						</div>
					</div>
				</div>
			</div>
			<div class="card flex-col wide">
				<div class="text-gray bold align-center">
					<WarehouseIcon size={20} /> Military Branches
				</div>
				<br />
				<div class="flex-row">
					{#each Object.entries(props.miliatryBranch) as [key, value]}
						<div class="info-card flex-col flex">
							<div class="text-gray">{key}</div>
							<div><b>{value}</b></div>
						</div>
					{/each}
				</div>
			</div>
			<div class="card flex-col wide">
				<div class="text-gray bold align-center">
					<TargetIcon size={20} /> Military Equipment
				</div>
				<br />
				<div class="flex-row">
					{#each Object.entries(props.militaryEquipment) as [key, value]}
						<div class="info-card flex-col flex">
							<div class="text-gray">{key}</div>
							<div><b>{value}</b></div>
						</div>
					{/each}
				</div>
				<div class="flex-row">
					<div class="info-card flex-col flex">
						<div class="text-gray">Max Stay</div>
						<div><b>90 days</b></div>
					</div>
					<div class="info-card flex-col flex">
						<div class="text-gray">Max Stay</div>
						<div><b>90 days</b></div>
					</div>
				</div>
			</div>
			<div class="flex-row">
				<div class="card flex-col flex">
					<div class="text-gray bold align-center">
						<GlobeIcon size={20} /> Alliances
					</div>
					<br />
					<div class="flex-col">
						{#each props.alliances as alliance}
							<div class="info-card">{alliance}</div>
						{/each}
					</div>
					<div>Organizations</div>
					<div class="flex-row">
						{#each props.organizations as organization}
							<div class="small-card">{organization}</div>
						{/each}
					</div>
				</div>
				<div class="card flex-col flex">
					<div class="text-gray bold align-center">
						<MedalMilitaryIcon size={20} /> Capabilities
					</div>
					<br />
					<div class="flex-col">
						{#each Object.entries(props.capabilities) as [key, value]}
							<div class=" flex-row between">
								<div class="text-gray">
									{key}
								</div>
								<div><b>{value}%</b></div>
							</div>
						{/each}
					</div>
				</div>
			</div>
			<div class="card flex-col wide">
				<div class="text-gray bold align-center">
					<TrendUpIcon size={20} /> Defense Spending Trend
				</div>
				<br />
				<div class="flex-col">
					<div class="num-big bold">{props.trend.status}</div>
					<div class="text-gray">{props.trend.note}</div>
				</div>
			</div>
		</div>
	</CollapsibleTopic>
</section>

<style>
</style>
