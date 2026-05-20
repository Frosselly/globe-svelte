<script lang="ts">
	import { Combobox } from 'melt/builders';
	import { selectedCountryStore } from '../../core/stores/store.svelte';

	interface CountrySearch {
		common: string;
		cca2: string;
		svg: string;
	}

	let countries = $state<CountrySearch[]>([]);
	type Option = (typeof countries)[number];

	const combobox = new Combobox<Option>();

	const filtered = $derived.by(() => {
		if (!combobox.touched) return countries;
		return countries.filter((o) =>
			o.common.toLowerCase().includes(combobox.inputValue.trim().toLowerCase())
		);
	});
	const selectedOption = $derived(combobox.value);

	$effect(() => {
		fetch('/countriesSearch.json')
			.then((r) => r.json())
			.then((data) => (countries = data));
		if (selectedOption) {
			// console.log('selected:', selectedOption);
			selectedCountryStore.selectCountry(selectedOption.cca2);
		}
	});
</script>

<!-- <label {...combobox.label}>Favorite Character</label> -->
<input {...combobox.input} class="search-input" placeholder="Search country..." />
<!-- <button {...combobox.trigger}>open</button> -->

<div {...combobox.content} class="dropdown">
	{#each filtered as option (option)}
		<div {...combobox.getOption(option)} class="dropdown-item">
			<span><img src={option.svg} alt="" /></span>
			<span>{option.common}</span>
			{#if combobox.isSelected(option)}
				✓
			{/if}
		</div>
	{:else}
		<span>No results found</span>
	{/each}
</div>

<style>
	.search-input {
		width: 260px;
		padding: 8px 12px;
		border: 1px solid #ccc;
		border-radius: 4px;
	}

	.dropdown {
		position: absolute;
		list-style: none;
		padding: 0;
		background: var(--color-bg);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
		max-height: 260px;
		overflow-y: auto;
		z-index: 100;
	}

	.dropdown-item {
		display: flex;
		gap: 8px;
		padding: 8px 12px;
		cursor: pointer;
		background: #fff;
	}

	img {
		width: 20px;
		height: auto;
	}

	.dropdown-item[data-highlighted] {
		background: #f0f0f0;
	}
</style>
