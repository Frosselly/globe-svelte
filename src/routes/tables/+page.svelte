<script lang="ts">
	import Chat from '$lib/components/chat.svelte';
	import { getCountryMetadataClean } from '$lib/components/countryData/country-metadata';
	// import { getCountryGeneralInfo } from '$lib/components/countryData/country-general';
	import { onMount } from 'svelte';
	import type { CountryMetadata, RESTCountry } from '$lib/components/countryData/types/c_metadata';
	import type { FactbookCountry } from '$lib/components/countryData/types/c_factbook';
	import { getCountryHealthInfo } from '$lib/components/countryData/country-health';
	import type { CountryHealthData } from '$lib/components/countryData/types/c_health';

	let metadata: CountryMetadata | null = $state(null);
	let generalInfo: FactbookCountry | null = $state(null);
	let healthInfo: CountryHealthData | null = $state(null);

	async function getCountry(iso3: string) {
		const meta = await getCountryMetadataClean(iso3);
		if (!meta) return;
		// const general = await getCountryGeneralInfo(meta.region, meta.cca2);
		const health = await getCountryHealthInfo(meta.name);
		return {
			metadata: meta,
			// generalInfo: general,
			healthInfo: health
		};
	}

	onMount(async () => {
		const result = await getCountry('FRA');
		if (!result) return;
		metadata = result.metadata;
		// generalInfo = result.generalInfo;
		healthInfo = result.healthInfo;
		console.log('country data', result.healthInfo);
	});
</script>

<section>
	<h2>General</h2>
	{#if metadata}
		<div>
			Flag:
			<img src={metadata.flag} alt="Flag" width="100" />
		</div>
		<div>
			Name: {metadata.name ?? '-'}
		</div>
		<div>
			Capital: {metadata.capital}
		</div>
		<div>
			Currency: {metadata.currencies}
		</div>
		<div>
			Coords: {metadata.latlng.join(', ')}
		</div>
		<div>
			Population: {metadata.population}
		</div>
		<div>
			Area (sq km): {metadata.area}
		</div>
		<div>
			Timezones: {metadata.timezones}
		</div>
		<div>
			Languages: {metadata.languages}
		</div>
		<div>
			Region: {metadata.region ?? '—'}
		</div>
		<div>
			Gini(low to high earning difference): {metadata.gini ?? '-'}
		</div>
		<div>
			Borders: {metadata.borders?.length ? metadata.borders.join(', ') : 'None'}
		</div>
		<div>
			Government: {#if generalInfo?.Government?.['Government type']?.text}
				<span>{generalInfo.Government['Government type'].text}</span>
			{:else}
				—
			{/if}
		</div>
	{:else}
		<div>Loading…</div>
	{/if}
</section>

<section>
	<h2>History</h2>
	<div>general history</div>
	<div>wars</div>
</section>
<section>
	<h2>Geography</h2>
	<div>general landscape: {@html generalInfo?.Geography.Terrain.text ?? '-'}</div>
	<div>fauna</div>
	<div>disasters</div>
	<div>Hazards: {@html generalInfo?.Geography['Natural hazards'].text ?? '-'}</div>
</section>
<section>
	<h2>Economics</h2>
	<div>general info: {generalInfo?.Economy['Economic overview'].text}</div>
	<div>GDP</div>
	<div>Growth</div>
	<div>
		resources
		<div>Agriculture: {generalInfo?.Economy['Agricultural products'].text}</div>
		<div>Natural: {@html generalInfo?.Geography['Natural resources'].text ?? '-'}</div>
	</div>
	<div>Influences</div>
	<div>Safety</div>
</section>
<section>
	<h2>Live news</h2>
	<div>general news</div>
	<div>politics</div>
	<div>sports</div>
	<div>entertainment</div>
</section>
<section>
	<h2>Healthcare</h2>
	<div>general info</div>
	<div style="font-weight: bold;">Overall health score: {healthInfo?.['OVERALL SCORE']}</div>
	<div>
		Prevention score: {healthInfo?.['1) PREVENTION OF THE EMERGENCE OR RELEASE OF PATHOGENS']}
	</div>
	<div>
		Early detection score: {healthInfo?.[
			"2) EARLY DETECTION & REPORTING FOR EPIDEMICS OF POTENTIAL INT'L CONCERN"
		]}
	</div>
	<div>
		Rapid response score: {healthInfo?.[
			'3) RAPID RESPONSE TO AND MITIGATION OF THE SPREAD OF AN EPIDEMIC'
		]}
	</div>
	<div>
		Health sector score: {healthInfo?.[
			'4) SUFFICIENT & ROBUST HEALTH SECTOR TO TREAT THE SICK & PROTECT HEALTH WORKERS'
		]}
	</div>
	<div>
		Commitments score: {healthInfo?.[
			'5) COMMITMENTS TO IMPROVING NATIONAL CAPACITY, FINANCING AND ADHERENCE TO NORMS'
		]}
	</div>
	<div>
		Risk environment score: {healthInfo?.[
			'6) OVERALL RISK ENVIRONMENT AND COUNTRY VULNERABILITY TO BIOLOGICAL THREATS'
		]}
	</div>
</section>
<section>
	<h2>Photos</h2>
	<div>general photos</div>
	<div>landscapes</div>
	<div>cities</div>
</section>
<section>
	<h2>Landmarks</h2>
	<div>general info</div>
	<div>photos</div>
</section>
