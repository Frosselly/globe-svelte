<script lang="ts">
	/**
	 * src/routes/(app)/analysis/+page.svelte
	 *
	 * Fixes:
	 * 1. Country in URL (?country=FR):
	 *    - When user clicks a country name in graph list → navigate({ country, view: 'line' })
	 *    - On mount: if ?country absent but selectedCountryStore has a country →
	 *      navigate({ country: store.iso2 }) so the server can load history
	 *    - Map click → selectedCountryStore updates → $effect picks it up → navigate
	 *
	 * 2. Save only selected countries (not all 250)
	 *    - graph exposes onSelectionChange(iso2s[]) → stored in selectedIso2s
	 *    - save uses selectedIso2s, falling back to top-10
	 *
	 * 3. Map uses ScalarIndicator key (flat DB column), not dot-path
	 */
	import { Combobox } from 'melt/builders';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Graph from '$lib/components/graph/graph.svelte';
	import {
		mapState,
		setCurrentDataset,
		setDisplayMode,
		setIndicatorRows
	} from '$lib/components/map/mapStore.svelte';
	import { selectedCountryStore } from '$lib/core/stores/store.svelte';
	import type { AnalysisOption } from '$lib/assets/analysisOptions';
	import ChartBarHorizontalIcon from 'phosphor-svelte/lib/ChartBarHorizontalIcon';
	import MapTrifoldIcon from 'phosphor-svelte/lib/MapTrifoldIcon';
	import TrendUpIcon from 'phosphor-svelte/lib/TrendUpIcon';
	import FloppyDiskIcon from 'phosphor-svelte/lib/FloppyDisk';
	import TableIcon from 'phosphor-svelte/lib/TableIcon';
	import type { PageData } from '../../../routes/(app)/$types';
	import AGTable from '$lib/components/table/AGTable.svelte';

	let { data }: { data: PageData } = $props();

	// ── URL-driven state ──────────────────────────────────────────────────────

	const currentIndicator = $derived($page.url.searchParams.get('indicator') ?? 'gdp');
	const currentView = $derived(
		($page.url.searchParams.get('view') ?? 'bar') as 'bar' | 'line' | 'map' | 'table'
	);
	const currentYear = $derived(
		Number($page.url.searchParams.get('year') ?? new Date().getFullYear())
	);
	const currentCountry = $derived($page.url.searchParams.get('country') ?? null);

	function navigate(patch: Record<string, string | null>) {
		const params = new URLSearchParams($page.url.searchParams);
		for (const [k, v] of Object.entries(patch)) {
			v === null ? params.delete(k) : params.set(k, v);
		}
		goto(`/analysis?${params}`, { replaceState: false, invalidateAll: true });
	}

	function setIndicator(key: string) {
		navigate({ indicator: key, country: null });
	}
	function setView(v: 'bar' | 'line' | 'map' | 'table') {
		navigate({ view: v });
	}
	function setYear(y: number) {
		navigate({ year: String(y) });
	}

	// ── Sync selectedCountryStore → URL ───────────────────────────────────────
	// This is the missing link: when the user clicks a country on the map,
	// selectedCountryStore.country updates. We pick that up and set ?country= in
	// the URL, which causes the server to load that country's history.
	// replaceState:true avoids polluting browser history on every map hover/click.

	$effect(() => {
		if (currentView === 'map' && mapState.displayMode === 'none') {
			setDisplayMode('flat');
		}
	});

	$effect(() => {
		const storeIso2 = selectedCountryStore.country?.iso2;
		if (storeIso2 && storeIso2 !== currentCountry) {
			const params = new URLSearchParams($page.url.searchParams);
			params.set('country', storeIso2);
			// Only switch to line view automatically if we're already in line mode
			// (don't hijack bar/map mode just because user clicked a country on the map)
			goto(`/analysis?${params}`, { replaceState: true, invalidateAll: true });
		}
	});

	// ── Clicking a country name in the graph list → line view ─────────────────

	function handleSelectCountry(iso2: string) {
		// Also update the store so the sidebar and map stay in sync
		selectedCountryStore.selectCountry(iso2);
		navigate({ country: iso2, view: 'line' });
	}

	// ── Combobox ──────────────────────────────────────────────────────────────
	const combobox = new Combobox<string>({ value: data.option.label });

	const filtered: AnalysisOption[] = $derived.by(() => {
		const q = combobox.inputValue.trim().toLowerCase();
		if (!q || !combobox.touched) return data.options;
		return data.options.filter((o) => o.label.toLowerCase().includes(q));
	});

	const grouped = $derived(
		filtered.reduce(
			(acc, o) => {
				(acc[o.topic] ??= []).push(o);
				return acc;
			},
			{} as Record<string, AnalysisOption[]>
		)
	);

	// Sync combobox pick → URL; only navigate when it actually changes
	$effect(() => {
		const picked = data.options.find((o) => o.label === combobox.value);
		if (picked && picked.key !== currentIndicator) {
			navigate({ indicator: picked.key }); // clear country when switching indicator
		}
	});

	// Keep combobox label in sync when URL changes externally (e.g. back button)
	$effect(() => {
		if (data.option.label !== combobox.value) {
			combobox.value = data.option.label;
		}
	});

	// ── View options ──────────────────────────────────────────────────────────

	const VIEW_OPTIONS = [
		{ icon: TrendUpIcon, text: 'Trend', value: 'line' as const },
		{ icon: ChartBarHorizontalIcon, text: 'Compare', value: 'bar' as const },
		{ icon: MapTrifoldIcon, text: 'Map', value: 'map' as const },
		{ icon: TableIcon, text: 'Table', value: 'table' as const }
	];

	const lineDisabled = $derived(!data.option.timeSeries);

	// ── Year range ────────────────────────────────────────────────────────────

	const MIN_YEAR = 2000;
	const MAX_YEAR = new Date().getFullYear();

	// ── Selection tracking for save ───────────────────────────────────────────
	// graph.svelte calls this whenever the checkbox set changes

	let selectedIso2s = $state<string[]>([]);
	function handleSelectionChange(iso2s: string[]) {
		selectedIso2s = iso2s;
	}

	// ── Save ──────────────────────────────────────────────────────────────────

	let saving = $state(false);
	let saveError = $state<string | null>(null);

	async function saveView() {
		if (!data.user || saving) return;
		saving = true;
		saveError = null;

		// Use checked countries; fall back to top 10 from server rows
		const countriesToSave = selectedIso2s.length
			? selectedIso2s
			: data.rows.slice(0, 10).map((r) => r.iso2);

		try {
			const res = await fetch('/api/save', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					label: `${data.option.label} — ${currentView} ${currentYear}`,
					mode: currentView,
					indicator: currentIndicator,
					indicatorName: data.option.label,
					countries: countriesToSave,
					startYear: MIN_YEAR,
					endYear: MAX_YEAR,
					selectedYear: currentView !== 'line' ? currentYear : null
				})
			});
			const json = await res.json();
			if (!res.ok) {
				saveError = json.error ?? `Save failed (${res.status})`;
			} else if (json.view) goto(`/analysis/${json.view.id}`);
		} catch (e: any) {
			saveError = e.message ?? 'Network error';
		}
		saving = false;
	}

	// ── Map integration ───────────────────────────────────────────────────────

	$effect(() => {
		if (currentView === 'map') {
			setCurrentDataset(currentIndicator);
			setIndicatorRows(data.rows);
		}
	});
</script>

<!-- ── Template ─────────────────────────────────────────────────────────── -->

<div class="container" class:map-mode={currentView === 'map'}>
	<!-- Header -->
	<div class="header">
		<div class="header-left">
			<div class="badge">Analysis</div>

			<!-- Indicator combobox -->
			<div class="combobox-wrap">
				<!-- <label {...combobox.label} class="sr-only">Select indicator</label> -->
				<div class="combobox-input-wrap">
					<input {...combobox.input} class="combobox-input" placeholder="Search indicator…" />
					<button {...combobox.trigger} class="combobox-chevron" class:open={combobox.open}>
						<svg width="12" height="12" viewBox="0 0 12 12" fill="none">
							<path
								d="M2 4l4 4 4-4"
								stroke="currentColor"
								stroke-width="1.5"
								stroke-linecap="round"
							/>
						</svg>
					</button>
				</div>
				<div {...combobox.content} class="combobox-menu">
					{#each Object.entries(grouped) as [topic, opts]}
						<div class="combobox-group-label">{topic}</div>
						{#each opts as opt (opt.key)}
							<div {...combobox.getOption(opt.label)} class="combobox-option">
								<span>{opt.label}</span>
								<span class="option-right">
									{#if opt.timeSeries}<span class="ts-badge">time series</span>{/if}
									{#if combobox.isSelected(opt.label)}<span class="check">✓</span>{/if}
								</span>
							</div>
						{/each}
					{/each}
					{#if !filtered.length}
						<span class="combobox-empty">No results</span>
					{/if}
				</div>
			</div>
		</div>

		<div class="header-right">
			{#if saveError}<span class="save-error">{saveError}</span>{/if}
			{#if data.user}
				<button class="btn-save" onclick={saveView} disabled={saving}>
					<FloppyDiskIcon size={15} />
					{saving ? 'Saving…' : 'Save view'}
				</button>
			{/if}
			<a href="/" class="close-btn" title="Close">✕</a>
		</div>
	</div>

	<hr />

	<!-- View tabs -->
	<div class="options">
		{#each VIEW_OPTIONS as opt}
			<button
				class="option"
				class:selected={currentView === opt.value}
				disabled={opt.value === 'line' && lineDisabled}
				title={opt.value === 'line' && lineDisabled ? 'No time-series for this indicator' : ''}
				onclick={() => setView(opt.value)}
			>
				<opt.icon size={16} /><span>{opt.text}</span>
			</button>
		{/each}

		{#if currentCountry}
			<span class="country-badge">
				{data.rows.find((r) => r.iso2 === currentCountry)?.name ?? currentCountry}
				<button onclick={() => navigate({ country: null })} title="Clear">×</button>
			</span>
		{/if}
	</div>

	<hr />

	<!-- Main display -->
	<div class="display" class:transparent={currentView === 'map'}>
		{#if currentView === 'map'}
			<div class="map-controls">
				<div class="map-controls-label">Display Mode</div>
				<div class="map-mode-options">
					<button
						class="map-mode-btn"
						class:active={mapState.displayMode === 'flat'}
						onclick={() => {
							setCurrentDataset(currentIndicator);
							setDisplayMode('flat');
						}}>Heatmap</button
					>
					<button
						class="map-mode-btn"
						class:active={mapState.displayMode === 'columns'}
						onclick={() => {
							setCurrentDataset(currentIndicator);
							setDisplayMode('columns');
						}}>Columns</button
					>
				</div>
				<p class="map-hint">{data.option.label} colour-coded on the map.</p>
			</div>
		{:else if currentView === 'table'}
			<!-- <AGTable columnDefs= 
rowData/> -->
			<div>Not implemented</div>
		{:else}
			<Graph
				view={currentView}
				option={data.option}
				rows={data.rows}
				history={data.history}
				selectedIso2={currentCountry}
				onSelectCountry={handleSelectCountry}
				onSelectionChange={handleSelectionChange}
			/>
		{/if}
	</div>

	<hr />

	<!-- Time slider -->
	{#if data.history}
		<div class="time-slider">
			<button onclick={() => setYear(Math.max(MIN_YEAR, currentYear - 1))}>‹</button>
			<span class="year-label">{MIN_YEAR}</span>
			<input
				type="range"
				min={MIN_YEAR}
				max={MAX_YEAR}
				value={currentYear}
				oninput={(e) => setYear(Number((e.target as HTMLInputElement).value))}
			/>
			<span class="year-label">{MAX_YEAR}</span>
			<button onclick={() => setYear(Math.min(MAX_YEAR, currentYear + 1))}>›</button>
			<span class="year-current">{currentYear}</span>
		</div>
	{/if}
</div>

<style>
	.container {
		display: flex;
		flex-direction: column;
		height: 100%;
		min-width: 0;
		pointer-events: none;
	}
	.container > * {
		pointer-events: auto;
		background: var(--color-background);
	}
	.container.map-mode > .display {
		background: transparent !important;
		pointer-events: none;
	}

	.header {
		padding: 10px 16px;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.header-left,
	.header-right {
		display: flex;
		align-items: center;
		gap: 10px;
	}
	.badge {
		font-size: 11px;
		font-weight: 600;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		color: #888;
		white-space: nowrap;
	}

	.combobox-wrap {
		position: relative;
	}
	.combobox-input-wrap {
		display: flex;
		align-items: center;
		border: 1px solid #e0e0e0;
		border-radius: 8px;
		padding: 0 8px 0 10px;
		background: #fff;
		height: 34px;
		gap: 4px;
	}
	.combobox-input {
		border: none;
		outline: none;
		font-size: 14px;
		font-weight: 500;
		width: 220px;
		background: transparent;
	}
	.combobox-chevron {
		background: none;
		border: none;
		cursor: pointer;
		color: #888;
		display: flex;
		align-items: center;
		transition: transform 150ms;
	}
	.combobox-chevron.open {
		transform: rotate(180deg);
	}
	.combobox-menu {
		position: absolute;
		top: calc(100% + 4px);
		left: 0;
		min-width: 280px;
		background: #fff;
		border: 1px solid #e5e7eb;
		border-radius: 10px;
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
		padding: 4px;
		z-index: 200;
		max-height: 320px;
		overflow-y: auto;
	}
	.combobox-group-label {
		font-size: 10px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: #9ca3af;
		padding: 8px 10px 4px;
	}
	.combobox-option {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 7px 10px;
		border-radius: 6px;
		font-size: 13px;
		cursor: pointer;
	}
	.combobox-option:hover,
	.combobox-option-selected {
		background: #f5f5f5;
	}
	.option-right {
		display: flex;
		align-items: center;
		gap: 6px;
	}
	.ts-badge {
		font-size: 10px;
		background: #e8f0fe;
		color: #3b6fd4;
		padding: 2px 6px;
		border-radius: 4px;
		font-weight: 500;
	}
	.check {
		color: #3b6fd4;
		font-size: 13px;
	}
	.combobox-empty {
		display: block;
		padding: 10px;
		font-size: 13px;
		color: #9ca3af;
		text-align: center;
	}

	.save-error {
		font-size: 12px;
		color: #dc2626;
	}
	.btn-save {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		background: #0f0f0f;
		color: #fff;
		border: none;
		padding: 6px 14px;
		border-radius: 7px;
		font-size: 13px;
		cursor: pointer;
	}
	.btn-save:hover:not(:disabled) {
		opacity: 0.85;
	}
	.btn-save:disabled {
		opacity: 0.5;
		cursor: default;
	}
	.close-btn {
		color: #888;
		text-decoration: none;
		font-size: 16px;
		padding: 4px 8px;
		border-radius: 6px;
	}
	.close-btn:hover {
		background: #f0f0f0;
	}

	hr {
		margin: 0;
		border: none;
		border-top: 1px solid #f0f0f0;
	}

	.options {
		display: flex;
		align-items: center;
		padding: 8px 12px;
		gap: 6px;
		flex-wrap: wrap;
	}
	.option {
		cursor: pointer;
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 6px 12px;
		border-radius: 8px;
		border: none;
		background: none;
		font: inherit;
		font-size: 13px;
		color: #444;
	}
	.option:hover:not(:disabled) {
		background: #f0f0f0;
	}
	.option.selected {
		background: #eeeeee;
		font-weight: 600;
	}
	.option:disabled {
		opacity: 0.4;
		cursor: default;
	}

	.country-badge {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		background: #fff7ed;
		border: 1px solid #fcd34d;
		color: #92400e;
		padding: 4px 10px;
		border-radius: 20px;
		font-size: 12px;
		font-weight: 600;
	}
	.country-badge button {
		background: none;
		border: none;
		cursor: pointer;
		color: #92400e;
		font-size: 14px;
		padding: 0;
		line-height: 1;
	}

	.display {
		flex: 1;
		min-height: 0;
		overflow: hidden;
	}
	.transparent {
		background: transparent !important;
		pointer-events: none;
	}

	.map-controls {
		display: flex;
		flex-direction: column;
		gap: 14px;
		padding: 20px;
		pointer-events: auto;
		background: var(--color-background);
		width: min-content;
		border-bottom-right-radius: 12px;
	}
	.map-controls-label {
		font-size: 11px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: #888;
	}
	.map-mode-options {
		display: flex;
		gap: 10px;
	}
	.map-mode-btn {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		padding: 10px 18px;
		border-radius: 10px;
		border: 1.5px solid #e5e7eb;
		background: var(--color-background);
		font-size: 13px;
		font-weight: 500;
		color: #444;
		cursor: pointer;
	}
	.map-mode-btn.active {
		background: #0f0f0f;
		color: #fff;
		border-color: #0f0f0f;
	}
	.map-hint {
		font-size: 12px;
		color: #9ca3af;
		max-width: 260px;
		line-height: 1.5;
	}

	.time-slider {
		display: flex;
		gap: 12px;
		align-items: center;
		padding: 10px 3rem;
		background: var(--color-background);
	}
	.time-slider input {
		flex: 1;
	}
	.time-slider button {
		background: none;
		border: none;
		cursor: pointer;
		font-size: 16px;
		padding: 4px 8px;
		border-radius: 6px;
		color: #555;
	}
	.time-slider button:hover {
		background: #f0f0f0;
	}
	.year-label {
		font-size: 12px;
		color: #aaa;
		font-variant-numeric: tabular-nums;
	}
	.year-current {
		font-size: 14px;
		font-weight: 700;
		color: #1a1a1a;
		font-variant-numeric: tabular-nums;
		min-width: 3rem;
	}
</style>
