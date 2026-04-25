<script lang="ts">
	interface Country {
		name: { common: string };
		cca2: string;
		flag: string;
	}

	let { onSelect } = $props<{
		onSelect?: (country: Country) => void;
	}>();

	let query = $state('');
	let countries = $state<Country[]>([]);
	let filtered = $state<Country[]>([]);
	let open = $state(false);
	let activeIndex = $state(-1);
	let inputEl = $state<HTMLInputElement | null>(null);
	let listEl = $state<HTMLUListElement | null>(null);

	// Load JSON once
	$effect(() => {
		fetch('/countriesSearch.json')
			.then((r) => r.json())
			.then((data) => (countries = data));
	});

	// Filter on query change
	$effect(() => {
		const q = query.trim().toLowerCase();
		if (!q) {
			filtered = [];
			open = false;
			return;
		}
		filtered = countries.filter((c) => c.name.common.toLowerCase().includes(q)).slice(0, 8);
		open = filtered.length > 0;
		activeIndex = -1;
	});

	function select(country: Country) {
		query = country.name.common;
		open = false;
		activeIndex = -1;
		onSelect?.(country);
	}

	function onKeydown(e: KeyboardEvent) {
		if (!open) return;
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			activeIndex = Math.min(activeIndex + 1, filtered.length - 1);
			scrollActiveIntoView();
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			activeIndex = Math.max(activeIndex - 1, 0);
			scrollActiveIntoView();
		} else if (e.key === 'Enter' && activeIndex >= 0) {
			e.preventDefault();
			select(filtered[activeIndex]);
		} else if (e.key === 'Escape') {
			open = false;
		}
	}

	function scrollActiveIntoView() {
		if (!listEl) return;
		const item = listEl.children[activeIndex] as HTMLElement;
		item?.scrollIntoView({ block: 'nearest' });
	}

	function onBlur() {
		// Delay so click on item fires before blur closes the list
		setTimeout(() => (open = false), 150);
	}
</script>

<div class="country-search">
	<input
		bind:this={inputEl}
		bind:value={query}
		type="text"
		name="countrySearch"
		id="countrySearch"
		placeholder="Search country..."
		autocomplete="off"
		role="combobox"
		aria-expanded={open}
		aria-autocomplete="list"
		aria-controls="country-list"
		onkeydown={onKeydown}
		onfocus={() => query && (open = filtered.length > 0)}
		onblur={onBlur}
	/>

	{#if open}
		<ul bind:this={listEl} id="country-list" class="dropdown" role="listbox">
			{#each filtered as country, i}
				<li
					role="option"
					aria-selected={i === activeIndex}
					class:active={i === activeIndex}
					onmousedown={() => select(country)}
				>
					<span class="flag">{country.flag}</span>
					<span class="name">{country.name.common}</span>
					<span class="code">{country.cca2}</span>
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	.country-search {
		position: relative;
		display: inline-block;
		width: 100%;
	}

	input {
		width: 100%;
		box-sizing: border-box;
	}

	.dropdown {
		position: absolute;
		top: calc(100% + 4px);
		left: 0;
		right: 0;
		margin: 0;
		padding: 0;
		list-style: none;
		background: #fff;
		border: 1px solid #ccc;
		border-radius: 4px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
		max-height: 260px;
		overflow-y: auto;
		z-index: 100;
	}

	li {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 8px 12px;
		cursor: pointer;
		font-size: 14px;
	}

	li:hover,
	li.active {
		background: #f0f0f0;
	}

	.flag {
		font-size: 18px;
		line-height: 1;
	}

	.name {
		flex: 1;
	}

	.code {
		font-size: 11px;
		color: #888;
		font-family: monospace;
	}
</style>
