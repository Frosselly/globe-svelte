<script lang="ts">
	import SmallGraphIcon from '$lib/components/smallGraphIcon.svelte';
	import GlobeIcon from 'phosphor-svelte/lib/GlobeIcon';
	import MedalMilitaryIcon from 'phosphor-svelte/lib/MedalMilitaryIcon';
	import TargetIcon from 'phosphor-svelte/lib/TargetIcon';
	import TrendUpIcon from 'phosphor-svelte/lib/TrendUpIcon';
	import WarehouseIcon from 'phosphor-svelte/lib/WarehouseIcon';
	import CollapsibleTopic from '../CollapsibleTopic/CollapsibleTopic.svelte';
	import type { FullCountry } from '$lib/core/stores/store.svelte';
	import MediumGraph from '../mediumGraph.svelte';
	import { formatLargeNumbers } from '$lib/core/utils/utils';

	const { c }: { c: FullCountry } = $props();

	const props2 = {
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

	$effect(() => {
		$inspect(Object.values(c.branches));
		$inspect(c.equipment);
		$inspect(c.alliances);
		$inspect(c.capabilities);
	});
</script>

<section class="topicSection" id="military">
	<CollapsibleTopic topicName={'Military'}>
		<div class="flex-col">
			<div class="flex-row">
				<div class="card flex-col flex">
					<div class="text-gray bold">Defense Budget</div>
					<br />
					{#if c.budgetCurrent}
						<div>
							<b class="num-big">{formatLargeNumbers(c.budgetCurrent)}</b>
							<SmallGraphIcon sign="+" trend={c.budgetTrend} />
						</div>
					{/if}
					{#if c.budgetHistory && c.budgetHistory.length}
						<div class="graph"><MediumGraph data={c.budgetHistory} /></div>
					{:else}
						<div class="graph-placeholder"><span class="text-gray">No data</span></div>
					{/if}
				</div>
				<div class=" flex-col flex">
					<div class="flex-row">
						<div class="card flex-col flex">
							<div class="text-gray bold">Global Rank</div>
							<div><b class="num-mid">{c.militaryRank ?? '-'}</b></div>
						</div>
						<div class="card flex-col flex">
							<div class="text-gray bold">% of GDP</div>
							<div><b class="num-mid">{c.gdpPercentage ?? '-'}%</b></div>
						</div>
					</div>
					<div class="card flex-col flex">
						<div class="text-gray bold between">
							<span>Total Personnel</span><span>Reserve</span>
						</div>
						<div class="between">
							<b class="num-mid"
								>{c.activePersonnel ? formatLargeNumbers(c.activePersonnel) : '-'}</b
							>
							<b>{c.reservePersonnel ? formatLargeNumbers(c.reservePersonnel) : '-'}</b>
						</div>
					</div>
				</div>
			</div>
			<div class="card flex-col wide">
				<div class="text-gray bold align-center">
					<WarehouseIcon size={20} /> Military Branches
				</div>
				<br />
				{#if c.branches}
					<div class="flex-row">
						{#each c.branches as item}
							<div class="info-card flex-col flex">
								<div class="text-gray">{item.name}</div>
								<div><b>{formatLargeNumbers(item.personnel, 0)}</b></div>
							</div>
						{/each}
					</div>
				{:else}
					<span class="missing">No data</span>
				{/if}
			</div>
			<div class="card flex-col wide">
				<div class="text-gray bold align-center">
					<TargetIcon size={20} /> Military Equipment
				</div>
				<br />
				{#if c.equipment}
					<div class="flex-row">
						{#each c.equipment as item}
							<div class="info-card flex-col flex">
								<div class="text-gray">{item.category}</div>
								<div><b>{formatLargeNumbers(item.count, 0)}</b></div>
							</div>
						{/each}
					</div>
				{:else}
					<span class="missing">No data</span>
				{/if}
				<!-- <div class="flex-row">
					<div class="info-card flex-col flex">
						<div class="text-gray">Max Stay</div>
						<div><b>90 days</b></div>
					</div>
					<div class="info-card flex-col flex">
						<div class="text-gray">Max Stay</div>
						<div><b>90 days</b></div>
					</div>
				</div> -->
			</div>
			<div class="flex-row">
				<div class="card flex-col flex">
					<div class="text-gray bold align-center">
						<GlobeIcon size={20} /> Alliances
					</div>
					<br />
					{#if c.alliances}
						<div class="flex-col">
							{#each c.alliances as alliance}
								<div class="info-card">{alliance.name}</div>
							{/each}
						</div>
					{:else}
						<span class="missing">No data</span>
					{/if}
					<!-- <div>Organizations</div>
				<div class="flex-row">
					{#each props.organizations as organization}
						<div class="small-card">{organization}</div>
					{/each}
				</div> -->
				</div>
				<div class="card flex-col flex">
					<div class="text-gray bold align-center">
						<MedalMilitaryIcon size={20} /> Capabilities
					</div>
					<br />
					{#if c.capabilities}
						<div class="flex-col">
							{#each c.capabilities as item}
								<div class=" flex-row between">
									<div class="text-gray">
										{item.name}
									</div>
									<div><b>{item.description}</b></div>
								</div>
							{/each}
						</div>
					{:else}
						<span class="missing">No data</span>
					{/if}
				</div>
			</div>
			<!-- <div class="card flex-col wide">
				<div class="text-gray bold align-center">
					<TrendUpIcon size={20} /> Defense Spending Trend
				</div>
				<br />
				<div class="flex-col">
					<div class="num-big bold">{props.trend.status}</div>
					<div class="text-gray">{props.trend.note}</div>
				</div>
			</div> -->
		</div>
	</CollapsibleTopic>
</section>

<style>
</style>
