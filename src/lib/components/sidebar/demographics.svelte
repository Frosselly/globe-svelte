<script lang="ts">
	import CityIcon from 'phosphor-svelte/lib/CityIcon';
	import FirstAidIcon from 'phosphor-svelte/lib/FirstAidIcon';
	import GraduationCapIcon from 'phosphor-svelte/lib/GraduationCapIcon';
	import HeartIcon from 'phosphor-svelte/lib/HeartIcon';
	import UsersIcon from 'phosphor-svelte/lib/UsersIcon';
	import CollapsibleTopic from '../CollapsibleTopic/CollapsibleTopic.svelte';

	const props = {
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
</script>

<section class="topicSection" id="demographics">
	<CollapsibleTopic topicName="Demographics">
		<div class="flex-col">
			<div class="flex-row">
				<div class="card flex-col flex">
					<div class="text-gray bold align-center">
						<span><UsersIcon size={20} /></span> Population
					</div>
					<div>
						<b class="num-big">{props.population.value}</b>
					</div>
					<div class="text-gray">
						<span>{props.population.rank}</span>
						{' | '}
						<span>{props.population.growthRate}%</span>
					</div>
				</div>
				<div class="card flex-col flex">
					<div class="text-gray bold align-center">
						<span><CityIcon size={20} /></span> Urbanization
					</div>
					<div>
						<b class="num-big">{props.urbanization}%</b>
					</div>
					<div class="text-gray">
						Density: <span>{props.density}</span>
					</div>
				</div>
			</div>
			<div class="card flex-col wide">
				<div class="text-gray bold align-center">
					<UsersIcon size={20} /> Age Distribution
				</div>
				<br />
				<div class="between">
					<div class="progress-bar-divided">
						{#each props.ageDistribution as { percentage, color }, i}
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
					{#each props.ageDistribution as { group, label, percentage, color }}
						<div class="flex-col align-center">
							<div
								style="height: 1rem; width: 1rem; background-color: {color}; border-radius: 50%"
							></div>
							<div>{group}</div>
							<div class="text-gray">{label}</div>
						</div>
					{/each}
				</div>
			</div>
			<div class="card flex-col wide">
				<div class="between">
					<div class="text-gray bold align-center">
						<span><HeartIcon size={20} /></span> Life Expectancy
					</div>
					<div class=" bold flex-col">
						<div><span class={'text-gray'}>Male: </span> {props.lifeExpectancy.male}</div>
						<div><span class={'text-gray'}>Female: </span>{props.lifeExpectancy.female}</div>
					</div>
				</div>
				<div>
					<div><b>{props.lifeExpectancy.total}</b></div>
				</div>
				<div class="badge">Rank #{props.lifeExpectancy.rank}</div>
			</div>
			<div class="card flex-col wide">
				<div class="text-gray bold align-center">
					<FirstAidIcon size={20} /> Healthcare
				</div>
				<br />
				<div class="grid-2">
					<div class=" flex-row between">
						<div class="align-center">Healthcare Spending</div>
						<div><b class="num-mid">{props.health.healthcareSpending}</b></div>
					</div>
					<div class=" flex-row between align-center">
						<div class="align-center">Physicians</div>
						<div><b class="num-mid">{props.health.physicians}</b></div>
					</div>
					<div class=" flex-row between align-center">
						<div class="align-center">Hospital Beds</div>

						<div><b class="num-mid">{props.health.hospitalBeds}</b></div>
					</div>
					<div class=" flex-row between align-center">
						<div class="align-center">Infant Mortality</div>
						<div><b class="num-mid">{props.health.infantMortality}</b></div>
					</div>
				</div>
				<hr />
				<div class="flex-row">
					{#each props.health.vaccination as { label, value }}
						<div class="small-card">
							{String(label)
								.replace(/([A-Z])/g, ' $1')
								.replace(/^./, (c) => c.toUpperCase())}: {value}
						</div>
					{/each}
				</div>
			</div>
			<div class="card flex-col flex">
				<div class="text-gray bold align-center">
					<span><UsersIcon size={20} /></span> Ethnic Composition
				</div>
				{#each props.ethnicGroups as group}
					<div class="between">
						<div class="text-gray align-center">{group.name}</div>
						<div class="bold">{group.percentage}%</div>
					</div>
				{/each}
				<div class="between">
					<div class="text-gray align-center"><GraduationCapIcon size={18} /> Literacy Rate</div>
					<div class="bold">{props.literacy}%</div>
				</div>
			</div>
		</div>
		<h2>Population</h2>
		<p>Population growth rate</p>
		<p>Urbanization</p>
		<p>Youth employment</p>
		<p>Education</p>
		<p>Age structure</p>
		<p>Sex ratio</p>
		<p>Life expectancy from birth</p>
		<p>Infant mortality rate</p>
		<br />
		<h2>health</h2>
		<p>Health index</p>
		<p>Outbreaks</p>
		<p>Availability</p>
		<p>Health spending</p>
		<p>Price for some operation</p>
		<p>Price for some dental procedure</p>
	</CollapsibleTopic>
</section>

<style>
</style>
