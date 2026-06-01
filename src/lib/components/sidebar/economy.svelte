<script lang="ts">
	import CollapsibleTopic from '../CollapsibleTopic/CollapsibleTopic.svelte';
	import MediumGraph from '../mediumGraph.svelte';
	import SmallGraphIcon from '$lib/components/smallGraphIcon.svelte';
	import HistoryBadge from '$lib/components/HistoryBadge.svelte';
	// import { cd }            from '$lib/core/stores/countryDerived.svelte';
	import { formatLargeNumbers } from '$lib/core/utils/utils';

	import CalendarIcon from 'phosphor-svelte/lib/CalendarIcon';
	import ChartBarIcon from 'phosphor-svelte/lib/ChartBarIcon';
	import CurrencyCircleDollarIcon from 'phosphor-svelte/lib/CurrencyCircleDollarIcon';
	import GlobeIcon from 'phosphor-svelte/lib/GlobeIcon';
	import PiggyBankIcon from 'phosphor-svelte/lib/PiggyBankIcon';
	import ScalesIcon from 'phosphor-svelte/lib/ScalesIcon';
	import TruckIcon from 'phosphor-svelte/lib/TruckIcon';
	import UsersIcon from 'phosphor-svelte/lib/UsersIcon';
	import ChartLineIcon from 'phosphor-svelte/lib/ChartLineIcon';

	import type { FullCountry } from '$lib/core/stores/store.svelte';
	import { TOPIC_COLORS } from '$lib/core/globals';

	// All data comes from cd.economy - one line, reactive, null-safe
	// const e = $derived(cd.economy);
	const { e }: { e: FullCountry } = $props();

	const SECTOR_COLORS = ['#1d4ed8', '#dc2626', '#d97706', '#16a34a', '#7c3aed'];
	const sectorTotal = $derived(
		e.economicalSectors ? e.economicalSectors.reduce((s, x) => s + (x.percentage ?? 0), 0) : 0
	);
	const unknownPct = $derived(sectorTotal < 99 ? +(100 - sectorTotal).toFixed(1) : 0);
</script>

<section class="topicSection" id="economy">
	<CollapsibleTopic topicName="Economy" Icon={ChartLineIcon} bgColor={TOPIC_COLORS.economy}>
		<div class="flex-col">
			<!-- GDP trend - the one "main" indicator with graph -->
			<div class="flex-row">
				<div class="card flex-col flex" style="max-width: 16rem;">
					<div class="text-gray bold">
						GDP Trend
						<HistoryBadge />
					</div>
					<br />
					{#if e.gdpCurrent}
						<div class="flex-row align-center gap-6">
							<b class="num-big">{formatLargeNumbers(e?.gdpCurrent)}</b>
							<SmallGraphIcon
								sign={e.gdpTrend === 'growing' ? '+' : e.gdpTrend === 'declining' ? '-' : '='}
								trend={e.gdpTrend}
							/>
						</div>
						{#if e.gdpHistory && e.gdpHistory.length}
							<div class="graph"><MediumGraph data={e.gdpHistory} /></div>
						{:else}
							<div class="graph-placeholder"><span class="text-gray">No data</span></div>
						{/if}
					{:else}
						<span class="missing">No data</span>
					{/if}
				</div>

				<!-- 2×2 scalar grid -->
				<div class="flex-col flex">
					<div class="flex-row">
						<div class="card flex-col flex">
							<div class="text-gray bold">World Rank</div>
							<b class="num-mid">{e.worldRank !== null ? `#${e.worldRank}` : '-'}</b>
						</div>
						<div class="card flex-col flex">
							<div class="text-gray bold">Per Capita GDP</div>
							<b class="num-mid">{e.perCapitaGdp ? formatLargeNumbers(e.perCapitaGdp) : '-'}</b>
						</div>
					</div>
					<div class="flex-row">
						<div class="card flex-col flex">
							<div class="text-gray bold">
								Inflation
								<!-- Inflation also has yearly data -->
								<HistoryBadge />
							</div>
							<b class="num-mid">{e.inflationCurrent !== null ? `${e.inflationCurrent}%` : '-'}</b>
						</div>
						<!-- <div class="card flex-col flex">
							<div class="text-gray bold">Unemployment Rank</div>
							<b class="num-mid">{e.unemploymentRank !== null ? `#${e.unemploymentRank}` : '-'}</b>
						</div> -->
					</div>
				</div>
			</div>

			<!-- Economic Sectors -->
			{#if e.economicalSectors && e.economicalSectors?.length}
				<div class="card flex-col wide">
					<div class="text-gray bold align-center">
						<ChartBarIcon size={20} /> Economic Sectors of GDP
					</div>
					<br />
					<div class="progress-bar-divided">
						{#each e.economicalSectors as sector, i}
							<div
								class="segment bold center"
								style="width:{sector.percentage}%; background:{SECTOR_COLORS[
									i % SECTOR_COLORS?.length
								]}; color:#fff;"
								title="{sector.name}: {sector.percentage}%"
							>
								{sector.percentage}%
							</div>
						{/each}
						{#if unknownPct > 0}
							<div
								class="segment bold center"
								style="width:{unknownPct}%; background:#9ca3af; color:#fff;"
							>
								{unknownPct}%
							</div>
						{/if}
					</div>
					<div class="flex-row between" style="margin-top:.5rem;">
						{#each e.economicalSectors as sector, i}
							<div class="flex-col align-center">
								<div
									class="dot"
									style="background:{SECTOR_COLORS[i % SECTOR_COLORS?.length]};"
								></div>
								<div>{sector.name.charAt(0).toUpperCase() + sector.name.slice(1)}</div>
							</div>
						{/each}
						{#if unknownPct > 0}
							<div class="flex-col align-center">
								<div class="dot" style="background:#9ca3af;"></div>
								<div>Unknown</div>
							</div>
						{/if}
					</div>
				</div>
			{/if}

			<!-- Trade + Top Exports -->
			<div class="flex-row">
				<div class="card flex-col flex">
					<div class="text-gray bold align-center"><GlobeIcon size={20} /> Trade</div>
					<br />
					{#if e.trade?.exports || e.trade?.imports}
						<div class="flex-row">
							<div class="info-card flex-col flex">
								<span>Exports</span><b>{formatLargeNumbers(e.trade?.exports)}</b>
							</div>
							<div class="info-card flex-col flex">
								<span>Imports</span><b>{formatLargeNumbers(e.trade?.imports)}</b>
							</div>
						</div>
						<div class="info-card between">
							<span>Trade Balance</span><b>{formatLargeNumbers(e.trade?.balance)}</b>
						</div>
					{:else}
						<span class="missing">No trade data</span>
					{/if}
				</div>
				<div class="card flex-col flex">
					<div class="text-gray bold align-center"><TruckIcon size={20} /> Top Exports</div>
					{#if e.topExportedGoods && e.topExportedGoods?.length}
						<ol>
							{#each e.topExportedGoods.slice(0, 8) as item}<li>{item}</li>{/each}
						</ol>
					{:else}
						<span class="missing">No data</span>
					{/if}
				</div>
			</div>

			<!-- Business Environment -->
			<div class="card flex-col wide">
				<div class="text-gray bold align-center">
					<CalendarIcon size={20} /> Business Environment
				</div>
				<br />
				{#if e.businessEnvironment && Object.keys(e.businessEnvironment)?.length}
					<div class="grid-2">
						<div class="flex-row between align-center">
							<div><ScalesIcon size={16} /> Ease of Doing Business</div>
							<b class="num-mid">{e.businessEnvironment.easeOfDoingBusiness ?? 'No data'}</b>
						</div>
						<div class="flex-row between align-center">
							<div><CurrencyCircleDollarIcon size={16} /> Corruption Index</div>
							<b class="num-mid"
								>{e.businessEnvironment.corruptionPerceptionsIndex > 0
									? e.businessEnvironment.corruptionPerceptionsIndex
									: 'No data'}</b
							>
						</div>
						<div class="flex-row between align-center">
							<div><PiggyBankIcon size={16} /> Competitiveness Index</div>
							<b class="num-mid"
								>{e.businessEnvironment.globalCompetitivenessIndex > 0
									? e.businessEnvironment.globalCompetitivenessIndex
									: 'No data'}</b
							>
						</div>
						<div class="flex-row between align-center">
							<div><ChartBarIcon size={16} /> Innovation Index</div>
							<b class="num-mid"
								>{e.businessEnvironment.globalInnovationIndex > 0
									? e.businessEnvironment.globalInnovationIndex
									: 'No data'}</b
							>
						</div>
					</div>
				{:else}
					<span class="missing">No data</span>
				{/if}
				{#if e.majorCompanies?.length && e.majorCompanies?.length}
					<hr />
					<div class="text-gray">Major Companies</div>
					<div class="flex-row wrap">
						{#each e.majorCompanies.slice(0, 11) as company}
							<div class="small-card bold">{company}</div>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Labour Market -->
			<div class="card flex-col wide">
				<div class="text-gray bold align-center"><UsersIcon size={20} /> Labour Market</div>
				<br />
				{#if e.labourMarket && Object.keys(e.labourMarket)?.length}
					<div class="grid-4">
						<div class="flex-col">
							<div class="text-gray">Workforce</div>
							<div class="num-mid">{formatLargeNumbers(e.labourMarket.workforceGeneratedCash)}</div>
						</div>
						<div class="flex-col">
							<div class="text-gray">Avg. Salary</div>
							<div class="num-mid">{formatLargeNumbers(e.labourMarket.averageSalary)}/mo</div>
						</div>
						<div class="flex-col">
							<div class="text-gray">Min Wage</div>
							<div class="num-mid">{formatLargeNumbers(e.labourMarket.minimumWage)}/mo</div>
						</div>
						<div class="flex-col">
							<div class="text-gray">Work Week</div>
							<div class="num-mid">
								{e.labourMarket.avgWorkWeek ? e.labourMarket.avgWorkWeek + ' hrs' : '-'}
							</div>
						</div>
					</div>
				{:else}
					<span class="missing">No data</span>
				{/if}
			</div>
		</div>
	</CollapsibleTopic>
</section>

<style>
	.graph-placeholder {
		height: 60px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(0, 0, 0, 0.02);
		border-radius: 6px;
		margin-top: 0.5rem;
	}
	.dot {
		height: 1rem;
		width: 1rem;
		border-radius: 50%;
	}
	.gap-6 {
		gap: 6px;
	}
	.progress-bar-divided {
		display: flex;
		border-radius: 6px;
		overflow: hidden;
		height: 2rem;
	}
	.segment {
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.75rem;
		min-width: 2rem;
	}
</style>
