<script lang="ts">
	import SmallGraphIcon from '$lib/components/smallGraphIcon.svelte';
	import CalendarIcon from 'phosphor-svelte/lib/CalendarIcon';
	import ChartBarIcon from 'phosphor-svelte/lib/ChartBarIcon';
	import CurrencyCircleDollar from 'phosphor-svelte/lib/CurrencyCircleDollar';
	import CurrencyCircleDollarIcon from 'phosphor-svelte/lib/CurrencyCircleDollarIcon';
	import GlobeIcon from 'phosphor-svelte/lib/GlobeIcon';
	import GraphIcon from 'phosphor-svelte/lib/GraphIcon';
	import PiggyBankIcon from 'phosphor-svelte/lib/PiggyBankIcon';
	import ScalesIcon from 'phosphor-svelte/lib/ScalesIcon';
	import TruckIcon from 'phosphor-svelte/lib/TruckIcon';
	import UsersIcon from 'phosphor-svelte/lib/UsersIcon';
	import CollapsibleTopic from '../CollapsibleTopic/CollapsibleTopic.svelte';
	import { formatLargeNumbers } from '$lib/utils/utils';
	import MediumGraph from '../mediumGraph.svelte';

	const props = $props();
	$effect(() => {
		$inspect(props);
	});
	// const props = {
	// 	gdpTrend: {
	// 		value: '31.9M',
	// 		change: '12.4%',
	// 		graph: '' // placeholder for graph data
	// 	},
	// 	worldRank: '€12.4B',
	// 	perCapitaGDP: '#11',
	// 	inflation: '€12.4B',
	// 	unemployment: '#11',
	// 	economicSectors: {
	// 		services: 12.1,
	// 		industry: 58.5,
	// 		agriculture: 29.4
	// 	},
	// 	trade: {
	// 		exports: '31.9M',
	// 		imports: '31.9M',
	// 		tradeBalance: '31.9M',

	// 		exportVanities: ['Valid passport', 'Return ticket', 'Accommodation proof']
	// 	},
	// 	businessEnvironment: {
	// 		easeOfDoingBusiness: '31.9M',
	// 		corruptionPerceptionsIndex: '31.9M',
	// 		globalCompetitivenessIndex: '31.9M',
	// 		globalInnovationIndex: '31.9M',
	// 		majorCompanies: ['Company s', 'Company Name', 'Company Name', 'Company Name']
	// 	},
	// 	labourMarket: {
	// 		workforce: '68.9M',
	// 		avgSalary: '$3,456/month',
	// 		minWage: '$12.4/hr',
	// 		workWeek: '40 hours'
	// 	}
	// };

	const colors = ['black', 'red', 'orange'];
</script>

<section class="topicSection" id="economy">
	<CollapsibleTopic topicName={'Economy'}>
		<div class="flex-col">
			<div class="flex-row">
				<div class="card flex-col flex">
					<div class="text-gray bold">GDP Trend</div>
					<br />
					<div>
						<b class="num-big">{formatLargeNumbers(props.gdp.current)}</b>
						<SmallGraphIcon sign="+" trend={props.gdp.trend} />
					</div>
					<div class="graph">
						<MediumGraph data={props.gdp.yearOverYear} />
					</div>
				</div>
				<div class=" flex-col flex">
					<div class="flex-row">
						<div class="card flex-col flex">
							<div class="text-gray bold">World Rank</div>
							<div><b class="num-mid">{props.worldRankInEconomy}</b></div>
						</div>
						<div class="card flex-col flex">
							<div class="text-gray bold">Per Capita GDP</div>
							<div><b class="num-mid">{formatLargeNumbers(props.perCapitaGDP)}</b></div>
						</div>
					</div>
					<div class="flex-row">
						<div class="card flex-col flex">
							<div class="text-gray bold">Inflation</div>
							<div><b class="num-mid">{props.inflation.current}</b></div>
						</div>
						<div class="card flex-col flex">
							<div class="text-gray bold">Unemployment</div>
							<div><b class="num-mid">{props.unemploymentRank + 20}</b></div>
						</div>
					</div>
				</div>
			</div>

			<div class="card flex-col wide">
				<div class="text-gray bold align-center">
					<ChartBarIcon size={20} />
					Economic Sectors of GDP
				</div>

				<br />

				<div class="between">
					<div class="progress-bar-divided">
						{#each props.economicalSectors as sector, i}
							<div
								class="segment bold center"
								style="width: {sector.percentage}%; background-color: {colors[i]}; color: white;"
								title="{sector.percentage}%"
							>
								{sector.percentage}%
							</div>
						{/each}

						{#if props.economicalSectors.reduce((sum, s) => sum + s.percentage, 0) < 100}
							{@const unknownPct =
								100 - props.economicalSectors.reduce((sum, s) => sum + s.percentage, 0)}
							<div
								class="segment bold center"
								style="width: {unknownPct}%; background-color: #9ca3af; color: white;"
								title="{unknownPct}%"
							>
								{unknownPct.toFixed(1)}%
							</div>
						{/if}
					</div>
				</div>

				<div class="flex-row between">
					{#each props.economicalSectors as sector, i}
						<div class="flex-col align-center">
							<div
								style="height: 1rem; width: 1rem; background-color: {colors[i]}; border-radius: 50%"
							></div>
							<div>
								{sector.name.charAt(0).toUpperCase() + sector.name.slice(1)}
							</div>
						</div>
					{/each}

					{#if props.economicalSectors.reduce((sum, s) => sum + s.percentage, 0) < 100}
						<div class="flex-col align-center">
							<div
								style="height: 1rem; width: 1rem; background-color: #9ca3af; border-radius: 50%"
							></div>
							<div>Unknown</div>
						</div>
					{/if}
				</div>
			</div>
			<div class="flex-row">
				<div class="card flex-col flex">
					<div class="text-gray bold align-center"><GlobeIcon size={20} /> Trade</div>
					<br />
					<div class="flex-row">
						<div class="info-card flex-col flex">
							<span>Exports</span> <span><b>{props.trade.exports}</b></span>
						</div>
						<div class="info-card flex-col flex">
							<span>Imports</span> <span><b>{props.trade.imports}</b></span>
						</div>
					</div>
					<div class="info-card between">
						<span>Trade Balance</span> <span><b>{props.trade.balance}</b></span>
					</div>
				</div>
				<div class="card flex-col flex">
					<div class="text-gray bold align-center"><TruckIcon size={20} /> Top Exports</div>
					<div>
						<ol>
							{#each props.topExportedGoods as item}
								<li>{item}</li>
							{/each}
						</ol>
					</div>
				</div>
			</div>
			<div class="card flex-col wide">
				<div class="text-gray bold align-center">
					<CalendarIcon size={20} /> Business Environment
				</div>
				<br />
				<div class="grid-2">
					<div class=" flex-row between">
						<div class="align-center"><ScalesIcon size={16} /> Ease of Doing Business</div>
						<div><b class="num-mid">{props.businessEnvironment.easeOfDoingBusiness}</b></div>
					</div>
					<div class=" flex-row between align-center">
						<div class="align-center">
							<CurrencyCircleDollarIcon size={16} /> Corruption Perceptions Index
						</div>
						<div><b class="num-mid">{props.businessEnvironment.corruptionPerceptionsIndex}</b></div>
					</div>
					<div class=" flex-row between align-center">
						<div class="align-center"><PiggyBankIcon size={16} /> Global Competitiveness Index</div>
						<div><b class="num-mid">{props.businessEnvironment.globalCompetitivenessIndex}</b></div>
					</div>
					<div class=" flex-row between align-center">
						<div class="align-center"><ChartBarIcon size={16} /> Global Innovation Index</div>
						<div><b class="num-mid">{props.businessEnvironment.globalInnovationIndex}</b></div>
					</div>
				</div>
				<hr />
				<div class="text-gray">Major Companies</div>
				<div class="flex-row wrap">
					{#each props.majorCompanies.slice(0, 11) as company}
						<div class="small-card bold">{company}</div>
					{/each}
				</div>
			</div>
			<div class="card flex-col wide">
				<div class="text-gray bold align-center">
					<UsersIcon size={20} /> Labour Market
				</div>
				<br />
				<div class="grid-4">
					<div class=" flex-col">
						<div class="text-gray">Workforce</div>
						<div class="num-mid">{props.labourMarket.workforceGeneratedCash}</div>
					</div>
					<div class=" flex-col">
						<div class="text-gray">Avg. Salary</div>
						<div class="num-mid">{props.labourMarket.averageSalary}</div>
					</div>
					<div class=" flex-col">
						<div class="text-gray">Min Wage</div>
						<div class="num-mid">{props.labourMarket.minimumWage}</div>
					</div>
					<div class=" flex-col">
						<div class="text-gray">Work Week</div>
						<div class="num-mid">{props.labourMarket.avgWorkWeek}</div>
					</div>
				</div>
			</div>
		</div>
	</CollapsibleTopic>
</section>

<style>
</style>
