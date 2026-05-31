<script lang="ts">
	import CityIcon from 'phosphor-svelte/lib/CityIcon';
	import FirstAidIcon from 'phosphor-svelte/lib/FirstAidIcon';
	import GraduationCapIcon from 'phosphor-svelte/lib/GraduationCapIcon';
	import HeartIcon from 'phosphor-svelte/lib/HeartIcon';
	import UsersIcon from 'phosphor-svelte/lib/UsersIcon';
	import CollapsibleTopic from '../CollapsibleTopic/CollapsibleTopic.svelte';
	import type { FullCountry } from '$lib/core/stores/store.svelte';
	import { formatLargeNumbers } from '$lib/core/utils/utils';
	import { TOPIC_COLORS } from '$lib/core/globals';

	const { c }: { c: FullCountry } = $props();

	const props2 = {
		population: {
			value: '125.7M',
			growthRate: '-0.3',
			rank: 11
		},

		density: '333/km²',
		urbanization: '91.8',

		medianAge: '48.6 years',
		ageDistribution: [
			{ group: '0-14', percentage: 12.1, label: 'Children', color: 'black' },
			{ group: '15-64', percentage: 58.5, label: 'Working Age', color: 'red' },
			{ group: '65+', percentage: 29.4, label: 'Elderly', color: 'orange' }
		],
		ethnicGroups: [
			{ name: 'Japanese', percentage: 97.5 },
			{ name: 'Chinese', percentage: 0.6 },
			{ name: 'Korean', percentage: 0.4 },
			{ name: 'Other', percentage: 1.5 }
		],
		literacy: '99',
		lifeExpectancy: {
			total: '84.6 years',
			male: '81.6 years',
			female: '87.7 years',
			rank: 1
		},
		health: {
			healthcareSpending: '10.9% of GDP',
			hospitalBeds: '13.0 per 1,000',
			physicians: '2.5 per 1,000',
			infantMortality: '1.8 per 1,000',
			healthcareRank: 4,
			majorCauses: ['Cancer', 'Heart Disease', 'Stroke'],
			vaccination: [
				{ label: 'vaccinationRate', value: '82%' },
				{ label: 'covidVaccinated', value: '83%' }
			]
		}
	};

	function calcGrowth(lastYear: number, currYear: number) {
		if (lastYear === 0) {
			return currYear > 0 ? Infinity : 0;
		}

		const growth = ((currYear - lastYear) / lastYear) * 100;
		return formatLargeNumbers(growth);
	}
</script>

<section class="topicSection" id="demographics">
	<CollapsibleTopic topicName="Demographics" bgColor={TOPIC_COLORS.demographics}>
		<div class="flex-col">
			<div class="flex-row">
				<div class="card flex-col flex">
					<div class="text-gray bold align-center">
						<span><UsersIcon size={20} /></span> Population
					</div>
					<div>
						<b class="num-big"
							>{c.populationCurrent ? formatLargeNumbers(c.populationCurrent) : '-'}</b
						>
					</div>
					<div class="text-gray">
						<span>{c.populationTrend}</span>
						{#if c.populationHistory && c.populationHistory.length >= 2}
							{' | '}
							<span>{calcGrowth(c.populationHistory[1].value, c.populationHistory[0].value)}%</span>
						{/if}
					</div>
				</div>
				<div class="card flex-col flex">
					<div class="text-gray bold align-center">
						<span><CityIcon size={20} /></span> Urbanization
					</div>
					<div>
						<b class="num-big"
							>{c.urbanization ? formatLargeNumbers(c.urbanization[0].value) : '-'}%</b
						>
					</div>
					<div class="text-gray">
						Density: <span>{c.density ? formatLargeNumbers(c.density[0].value) : '-'}</span>
					</div>
				</div>
			</div>
			<!-- <div class="card flex-col wide">
				<div class="text-gray bold align-center">
					<UsersIcon size={20} /> Age Distribution
				</div>
				<br />
				<div class="between">
					<div class="progress-bar-divided">
						{#each props2.medianAge as { percentage, color }, i}
							<div
								class="segment bold center"
								style="width: {percentage}%; background-color: {color}; color: white;"
								title="{percentage}%"
							>
								{percentage}%
							</div>
						{/each}
					</div>
				</div>
				<div class="flex-row between">
					{#each props2.medianAge as { group, label, percentage, color }}
						<div class="flex-col align-center">
							<div
								style="height: 1rem; width: 1rem; background-color: {color}; border-radius: 50%"
							></div>
							<div>{group}</div>
							<div class="text-gray">{label}</div>
						</div>
					{/each}
				</div>
			</div> -->
			<div class="card flex-col wide">
				<div class="between">
					<div class="text-gray bold align-center">
						<span><HeartIcon size={20} /></span> Life Expectancy
					</div>
					<!-- <div class=" bold flex-col">
						<div><span class={'text-gray'}>Male: </span> {c.lifeExpectancy.male}</div>
						<div><span class={'text-gray'}>Female: </span>{c.lifeExpectancy.female}</div>
					</div> -->
				</div>
				<div>
					<div>
						<b>{c.lifeExpectancy ? formatLargeNumbers(c.lifeExpectancy[0].value) : '-'} years</b>
					</div>
				</div>
				<!-- <div class="badge">Rank #{c.lifeExpectancy.rank}</div> -->
			</div>
			<div class="card flex-col wide">
				<div class="text-gray bold align-center">
					<FirstAidIcon size={20} /> Healthcare
				</div>
				<br />
				<div class="grid-2">
					<div class=" flex-row between">
						<div class="align-center">Healthcare Spending</div>
						<div>
							<b class="num-mid"
								>{c.healthcareSpending ? formatLargeNumbers(c.healthcareSpending[0].value) : '-'}</b
							>
						</div>
					</div>
					<!-- <div class=" flex-row between align-center">
						<div class="align-center">Physicians</div>
						<div><b class="num-mid">{c.physicians}</b></div>
					</div> -->
					<div class=" flex-row between align-center">
						<div class="align-center">Hospital Beds</div>

						<div><b class="num-mid">{c.hospitalBeds ? c.hospitalBeds[0].value : '-'}</b></div>
					</div>
					<div class=" flex-row between align-center">
						<div class="align-center">Infant Mortality</div>
						<div><b class="num-mid">{c.infantMortality ? c.infantMortality[0].value : '-'}</b></div>
					</div>
				</div>
				<!-- <hr /> -->
				<!-- <div class="flex-row">
					{#each c.vaccination as { label, value }}
						<div class="small-card">
							{String(label)
								.replace(/([A-Z])/g, ' $1')
								.replace(/^./, (c) => c.toUpperCase())}: {value}
						</div>
					{/each}
				</div> -->
			</div>
			<div class="card flex-col flex">
				<div class="text-gray bold align-center">
					<span><UsersIcon size={20} /></span> Ethnic Composition
				</div>
				{#if c.ethnicGroups && c.ethnicGroups.length > 0}
					{#each c.ethnicGroups as group}
						<div class="between">
							<div class="text-gray align-center">{group.group}</div>
							{#if group.percentage}
								<div class="bold">{group.percentage}%</div>
							{/if}
						</div>
					{/each}
				{/if}

				<hr />
				<div class="between">
					<div class="text-gray align-center"><GraduationCapIcon size={18} /> Literacy Rate</div>
					<div class="bold">{c.literacy ? formatLargeNumbers(c.literacy[0].value, 2) : '-'}%</div>
				</div>
			</div>
		</div>
	</CollapsibleTopic>
</section>

<style>
</style>
