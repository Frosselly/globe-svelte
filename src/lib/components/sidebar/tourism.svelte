<script lang="ts">
	import SmallGraphIcon from '$lib/components/smallGraphIcon.svelte';
	import CalendarIcon from 'phosphor-svelte/lib/CalendarIcon';
	import ClockIcon from 'phosphor-svelte/lib/ClockIcon';
	import CoffeeIcon from 'phosphor-svelte/lib/CoffeeIcon';
	import GlobeIcon from 'phosphor-svelte/lib/GlobeIcon';
	import PlugIcon from 'phosphor-svelte/lib/PlugIcon';
	import SealCheckIcon from 'phosphor-svelte/lib/SealCheckIcon';
	import ShieldCheckIcon from 'phosphor-svelte/lib/ShieldCheckIcon';
	import TranslateIcon from 'phosphor-svelte/lib/TranslateIcon';
	import TrendDownIcon from 'phosphor-svelte/lib/TrendDownIcon';
	import TrendUpIcon from 'phosphor-svelte/lib/TrendUpIcon';
	import AirplaneTiltIcon from 'phosphor-svelte/lib/AirplaneTiltIcon';

	import WifiHighIcon from 'phosphor-svelte/lib/WifiHighIcon';
	import CollapsibleTopic from '../CollapsibleTopic/CollapsibleTopic.svelte';
	import { formatLargeNumbers } from '$lib/core/utils/utils';
	import MediumGraph from '../mediumGraph.svelte';
	import type { FullCountry } from '$lib/core/stores/store.svelte';
	import { TOPIC_COLORS } from '$lib/core/globals';

	const { e }: { e: FullCountry } = $props();

	const safetyScore = $derived(e.safetyScore ?? 0);

	const safetyLevel = $derived(Math.round(5 - (safetyScore / 100) * 4));
	// // console.log('tourism', props);
	// const props = {
	// 	annualVisitors: '31.9M',
	// 	trend: '12.4%',
	// 	revenue: '€12.4B',
	// 	worldRank: '#11',
	// 	unescoSites: '25 sites',
	// 	visaStatus: 'Visa-Free',
	// 	maxStay: '90 days',
	// 	safetyLevel: 1,
	// 	safetyScore: '92/100',
	// 	bestTime: 'Mar-May, Sep-Nov',
	// 	seasonsOffer: 'fewer crowds & lower prices',
	// 	peakSeason: 'Cherry Blossom (Late Mar-Apr)',
	// 	requirements: ['Valid Passport', 'Return Ticket', 'Proof of Funds'],
	// 	practicalInfo: {
	// 		language: 'Japanese',
	// 		timezone: 'JST (UTC+9)',
	// 		plugType: 'Type A/B',
	// 		internet: '186 Mbs/s'
	// 	},
	// 	dailyBudget: {
	// 		low: '€50',
	// 		mid: '€150',
	// 		high: '€300+',
	// 		categories: {
	// 			food: {
	// 				low: '€10-€20',
	// 				mid: '€20-€50',
	// 				high: '€50+'
	// 			},
	// 			accommodation: {
	// 				low: '€20-€50',
	// 				mid: '€50-€150',
	// 				high: '€150+'
	// 			},
	// 			transport: {
	// 				low: '€10-€30',
	// 				mid: '€30-€60',
	// 				high: '€60+'
	// 			},
	// 			activities: {
	// 				low: '€20-€70',
	// 				mid: '€70-€150',
	// 				high: '€150+'
	// 			}
	// 		}
	// 	}
	// };
</script>

<section class="topicSection" id="tourism">
	<CollapsibleTopic topicName={'Tourism'} Icon={AirplaneTiltIcon} bgColor={TOPIC_COLORS.tourism}>
		<div class="flex-col">
			<div class="flex-row">
				<div class="card flex-col flex">
					<div class="text-gray bold">Annual Visitors</div>
					<br />
					{#if e.visitorsCurrent}
						<div>
							<b class="num-big">{formatLargeNumbers(e.visitorsCurrent)}</b>
							<SmallGraphIcon sign="+" trend={e.visitorsTrend} />
						</div>
						{#if e.visitorsHistory && e.visitorsHistory.length}
							<div class="graph">
								<MediumGraph data={e.visitorsHistory} toFixed={0} />
							</div>
						{:else}
							<div class="graph-placeholder"><span class="text-gray">No data</span></div>
						{/if}
					{:else}
						<span class="missing">No data</span>
					{/if}
				</div>
				<div class=" flex-col flex">
					<div class="flex-row">
						<div class="card flex-col flex">
							<div class="text-gray bold">Revenue</div>
							<div>
								<b class="num-mid">{e.revenueUsd ? formatLargeNumbers(e.revenueUsd) : '-'}</b>
							</div>
						</div>
						<div class="card flex-col flex">
							<div class="text-gray bold">World Rank</div>
							<div><b class="num-mid">{e.tourismRanking ? e.tourismRanking : '-'}</b></div>
						</div>
					</div>
					<div class="card flex-row between flex">
						<div class="text-gray">UNESCO Heritage Sites</div>
						<div><b class="num-mid">{e.unescoSites ?? '-'}</b></div>
					</div>
				</div>
			</div>
			<div class="flex-row">
				<!-- <div class="card flex-col flex">
					<div class="between">
						<div class="text-gray bold align-center">
							<span><SealCheckIcon size={20} /></span> Visa Requirements
						</div>
						<div class="badge green">{props.visaStatus}</div>
					</div>
					<div class="info-card between">
						<span>Max Stay</span> <span><b>{props.maxStay}</b></span>
					</div>
					<div>
						<div class="text-gray">Requirements</div>
						<ul>
							{#each props.requirements as requirement}
								<li>{requirement}</li>
							{/each}
						</ul>
					</div>
				</div> -->
				<div class="card flex-col flex">
					<div class="between">
						<div class="text-gray bold align-center">
							<span><ShieldCheckIcon size={20} /></span> Safety
						</div>
						<div class="badge green">
							{#if safetyLevel === 1}
								Very Safe
							{:else if safetyLevel === 2}
								Safe
							{:else if safetyLevel === 3}
								Moderate
							{:else if safetyLevel === 4}
								Unsafe
							{:else}
								Dangerous
							{/if}
						</div>
					</div>
					<div class="between text-gray"><b>Safety score</b> <span>{e.safetyScore}</span></div>
					<div class="progress-bar">
						<div class="progress-fill" style="width: {e.safetyScore}%;"></div>
					</div>
					<div class="info-card flex-col">
						<div class="bold">Level {safetyLevel}</div>
						<div class="text-gray">
							{#if safetyLevel === 1}
								Exercise Normal Precautions
							{:else if safetyLevel === 2}
								Be Aware of Surroundings
							{:else if safetyLevel === 3}
								Increased Risk of Crime, Take Precautions
							{:else if safetyLevel === 4}
								High Crime, Exercise Caution
							{:else}
								Severe Crime, Avoid Travel
							{/if}
						</div>
					</div>
				</div>
			</div>
			<!-- {#if props.dailyBudget}
				<div class="card flex-col wide">
					<div class="text-gray bold align-center">
						<span><CalendarIcon size={20} /></span> Daily Budget Guide
					</div>
					<div class="flex-row">
						<div class="info-card flex-col flex center">
							<div class="text-gray">BUDGET</div>
							<div>{props.dailyBudget.low}</div>
							<div class="text-gray">/day</div>
						</div>
						<div class="info-card flex-col flex center">
							<div class="text-gray">MID</div>
							<div>{props.dailyBudget.mid}</div>
							<div class="text-gray">/day</div>
						</div>
						<div class="info-card flex-col flex center">
							<div class="text-gray">LUXURY</div>
							<div>{props.dailyBudget.high}</div>
							<div class="text-gray">/day</div>
						</div>
					</div>
					<div class="flex-row">
						<div class="flex">CATEGORY</div>
						<div class="flex center">BUDGET</div>
						<div class="flex center">MID</div>
						<div class="flex center">LUXURY</div>
					</div>
					<hr class="m-0" />
					<div class="flex-col">
						{#each Object.entries(props.dailyBudget.categories) as [category, budgets]}
							<div class="flex-row flex">
								<div class="bold flex">{category}</div>
								<div class="flex center">{budgets.low}</div>
								<div class="flex center">{budgets.mid}</div>
								<div class="flex center">{budgets.high}</div>
							</div>
						{/each}
					</div>
				</div>
			{/if} -->
			<!-- {#if props.bestTime}
				<div class="card flex-col wide">
					<div class="between">
						<div class="text-gray bold align-center">
							<span><CalendarIcon size={20} /></span> Best time to visit
						</div>
						<div class="text-gray bold">Seasons offer</div>
					</div>
					<div class="between">
						<div><b>{props.bestTime}</b></div>
						<div class="bold">{props.seasonsOffer}</div>
					</div>
					<div class="text-gray">Peak: <span>{props.peakSeason}</span></div>
				</div>
			{/if} -->
			{#if e.practicalInfo}
				<div class="flex-row">
					<div class="card flex-col flex">
						<div class="text-gray bold align-center">
							<span><CoffeeIcon size={20} /></span> Practical info
						</div>
						<div class="between">
							<div class="text-gray align-center">
								<TranslateIcon size={18} /> Language
							</div>
							<div class="bold">{e.practicalInfo.language}</div>
						</div>
						<div class="between">
							<div class="text-gray align-center"><ClockIcon size={18} /> Timezone</div>
							<div class="bold">{e.practicalInfo.timezone}</div>
						</div>
						<div class="between">
							<div class="text-gray align-center"><PlugIcon size={18} /> Plug Type</div>
							<div class="bold">{e.practicalInfo.plugType}</div>
						</div>
						<div class="between">
							<div class="text-gray align-center"><WifiHighIcon size={18} />Internet</div>
							<div class="bold">
								{e.practicalInfo.internetSpeed.mbps} Mbps
								<span>({e.practicalInfo.internetSpeed.quality})</span>
							</div>
						</div>
					</div>
					<!-- <div class="card flex-col flex">
						<div><span><img src="" alt="checklist" /></span> idfg</div>
					</div> -->
				</div>
			{/if}
		</div>
	</CollapsibleTopic>
</section>
