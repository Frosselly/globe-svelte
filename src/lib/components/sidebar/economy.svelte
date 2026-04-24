<script lang="ts">
	import SmallGraphIcon from '$lib/components/smallGraphIcon.svelte';
	import {
		CalendarIcon,
		ChartBarIcon,
		CurrencyCircleDollar,
		CurrencyCircleDollarIcon,
		GlobeIcon,
		GraphIcon,
		PiggyBankIcon,
		ScalesIcon,
		TruckIcon,
		UsersIcon
	} from 'phosphor-svelte';
	import CollapsibleTopic from '../CollapsibleTopic/CollapsibleTopic.svelte';

	const props = {
		gdpTrend: {
			value: '31.9M',
			change: '12.4%',
			graph: '' // placeholder for graph data
		},
		worldRank: '€12.4B',
		perCapitaGDP: '#11',
		inflation: '€12.4B',
		unemployment: '#11',
		economicSectors: {
			services: 12.1,
			industry: 58.5,
			agriculture: 29.4
		},
		trade: {
			exports: '31.9M',
			imports: '31.9M',
			tradeBalance: '31.9M',

			exportVanities: ['Valid passport', 'Return ticket', 'Accommodation proof']
		},
		businessEnvironment: {
			easeOfDoingBusiness: '31.9M',
			corruptionPerceptionsIndex: '31.9M',
			globalCompetitivenessIndex: '31.9M',
			globalInnovationIndex: '31.9M',
			majorCompanies: ['Company s', 'Company Name', 'Company Name', 'Company Name']
		},
		labourMarket: {
			workforce: '68.9M',
			avgSalary: '$3,456/month',
			minWage: '$12.4/hr',
			workWeek: '40 hours'
		}
	};

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
						<b class="num-big">{props.gdpTrend.value}</b>
						<SmallGraphIcon sign="+" trend={props.gdpTrend.change} />
					</div>
					<div class="graph"></div>
				</div>
				<div class=" flex-col flex">
					<div class="flex-row">
						<div class="card flex-col flex">
							<div class="text-gray bold">World Rank</div>
							<div><b class="num-mid">{props.worldRank}</b></div>
						</div>
						<div class="card flex-col flex">
							<div class="text-gray bold">Per Capita GDP</div>
							<div><b class="num-mid">{props.perCapitaGDP}</b></div>
						</div>
					</div>
					<div class="flex-row">
						<div class="card flex-col flex">
							<div class="text-gray bold">Inflation</div>
							<div><b class="num-mid">{props.inflation}</b></div>
						</div>
						<div class="card flex-col flex">
							<div class="text-gray bold">Unemployment</div>
							<div><b class="num-mid">{props.unemployment}</b></div>
						</div>
					</div>
				</div>
			</div>
			<div class="card flex-col wide">
				<div class="text-gray bold align-center">
					<ChartBarIcon size={20} /> Economic Sectors
				</div>
				<br />
				<div class="between">
					<div class="progress-bar-divided">
						{#each Object.entries(props.economicSectors) as [sector, value], i}
							<div
								class="segment bold center"
								style="width: {value}%; background-color: {colors[i]}; color: white;"
								title="{value}%"
							>
								{value}%
							</div>
						{/each}
					</div>
				</div>
				<div class="flex-row between">
					{#each Object.entries(props.economicSectors) as [sector, value], i}
						<div class="flex-col align-center">
							<div
								style="height: 1rem; width: 1rem; background-color: {colors[i]}; border-radius: 50%"
							></div>
							<div>{sector.charAt(0).toUpperCase() + sector.slice(1)}</div>
						</div>
					{/each}
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
						<span>Trade Balance</span> <span><b>{props.trade.tradeBalance}</b></span>
					</div>
				</div>
				<div class="card flex-col flex">
					<div class="text-gray bold align-center"><TruckIcon size={20} /> Top Exports</div>
					<div>
						<ol>
							{#each props.trade.exportVanities as item}
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
				<div class="flex-row">
					{#each props.businessEnvironment.majorCompanies as company}
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
						<div class="num-mid">{props.labourMarket.workforce}</div>
					</div>
					<div class=" flex-col">
						<div class="text-gray">Avg. Salary</div>
						<div class="num-mid">{props.labourMarket.avgSalary}</div>
					</div>
					<div class=" flex-col">
						<div class="text-gray">Min Wage</div>
						<div class="num-mid">{props.labourMarket.minWage}</div>
					</div>
					<div class=" flex-col">
						<div class="text-gray">Work Week</div>
						<div class="num-mid">{props.labourMarket.workWeek}</div>
					</div>
				</div>
			</div>
		</div>
	</CollapsibleTopic>
</section>

<style>
</style>
