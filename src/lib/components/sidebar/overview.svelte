<script lang="ts">
	import {
		CalendarIcon,
		CarIcon,
		CityIcon,
		CrossIcon,
		CurrencyDollarIcon,
		GlobeIcon,
		MapPinIcon,
		TranslateIcon
	} from 'phosphor-svelte';
	import CollapsibleTopic from '../CollapsibleTopic/CollapsibleTopic.svelte';

	const props = {
		countryInfo: {
			capital: 'Tokyo',
			largestCity: 'Tokyo',
			language: 'Japanese (official)',
			currency: 'Japanese Yen',
			drivingSide: 'Left',
			nationalDay: 'February 11'
		},
		government: {
			type: 'Constitutional Monarchy',
			headOfState: 'Emperor Naruhito',
			headOfGov: 'PM Shigeru Ishiba',
			legislature: 'National Diet (Bicameral)'
		},
		religions: [
			{
				name: 'Shinto',
				percentage: 70
			},
			{
				name: 'Shinto',
				percentage: 40
			},
			{
				name: 'Shinto',
				percentage: 10
			},
			{
				name: 'Shinto',
				percentage: 10
			}
		]
	};
</script>

<section class="topicSection" id="overview">
	<CollapsibleTopic topicName={'Overview'}>
		<div class="flex-col">
			<div class="card flex-col flex">
				<div class="text-gray bold align-center">
					<span><GlobeIcon size={20} /></span> Practical info
				</div>
				<div class="between">
					<div class="text-gray align-center">
						<MapPinIcon size={18} /> Capital
					</div>
					<div class="bold">{props.countryInfo.capital}</div>
				</div>
				<div class="between">
					<div class="text-gray align-center"><CityIcon size={18} /> Largest City</div>
					<div class="bold">{props.countryInfo.largestCity}</div>
				</div>
				<div class="between">
					<div class="text-gray align-center"><TranslateIcon size={18} /> Language</div>
					<div class="bold">{props.countryInfo.language}</div>
				</div>
				<div class="between">
					<div class="text-gray align-center"><CurrencyDollarIcon size={18} /> Currency</div>
					<div class="bold">{props.countryInfo.currency}</div>
				</div>
				<div class="between">
					<div class="text-gray align-center"><CarIcon size={18} /> Driving Side</div>
					<div class="bold">{props.countryInfo.drivingSide}</div>
				</div>
				<div class="between">
					<div class="text-gray align-center"><CalendarIcon size={18} /> National Day</div>
					<div class="bold">{props.countryInfo.nationalDay}</div>
				</div>
			</div>
			<div class="card flex-col flex">
				<div class="text-gray bold align-center"><GlobeIcon size={20} /> Government</div>
				<br />
				<div class="info-card flex-col">
					<div>Type</div>
					<div><b>{props.government.type}</b></div>
				</div>
				<div class="flex-row">
					<div class="info-card white flex-col flex">
						<div>Head of State</div>
						<div><b>{props.government.headOfState}</b></div>
					</div>
					<div class="info-card white flex-col flex">
						<div>Head of Gov</div>
						<div><b>{props.government.headOfGov}</b></div>
					</div>
				</div>

				<div class="between">
					<div class="text-gray align-center">
						<MapPinIcon size={18} /> Legislature
					</div>
					<div class="bold">{props.government.legislature}</div>
				</div>
			</div>
			<div class="card flex-col wide">
				<div class="text-gray bold align-center">
					<CrossIcon size={20} /> Religions
				</div>
				<br />
				<div class="flex-col">
					{#each props.religions as { name, percentage }}
						<div class=" flex-col">
							<div class="between">
								<div>{name}</div>
								<div>{percentage}%</div>
							</div>
							<div class="progress-bar">
								<div class="progress-fill" style="width: {percentage}%;"></div>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</div>
	</CollapsibleTopic>
</section>
