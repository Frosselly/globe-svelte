<script lang="ts">
	import ChartBarHorizontalIcon from 'phosphor-svelte/lib/ChartBarHorizontalIcon';
	import MapTrifoldIcon from 'phosphor-svelte/lib/MapTrifoldIcon';
	import TrendUpIcon from 'phosphor-svelte/lib/TrendUpIcon';
	import Graph from '../graph/graph.svelte';
	import { Combobox } from 'melt/builders';
	import { derived } from 'svelte/store';
	import analysisOptions from '$lib/assets/analysisOptions.json';
	import { countriesStore, modeState } from '../../core/stores/store.svelte';
	import { mapState, setCurrentDataset, setDisplayMode } from '../map/mapStore.svelte';

	const { onClose } = $props();

	type AnalysisOption = { name: string; key: string; timeSeries: boolean };

	const combobox = new Combobox<string>({
		value: analysisOptions[0].name
	});

	const filtered = $derived.by(() => {
		if (!combobox.touched) return analysisOptions;
		return analysisOptions.filter((o) =>
			o.name.toLowerCase().includes(combobox.inputValue.trim().toLowerCase())
		);
	});

	const selectedAnalysis = $derived(
		analysisOptions.find((o) => o.name === combobox.value) ?? analysisOptions[0]
	);
	// --- View mode ---
	let selectedOption = $state(0);
	const options: { icon: any; text: string; value: 'line' | 'bar' | 'map' }[] = [
		{ icon: TrendUpIcon, text: 'Trend', value: 'line' },
		{ icon: ChartBarHorizontalIcon, text: 'Compare', value: 'bar' },
		{ icon: MapTrifoldIcon, text: 'Map', value: 'map' }
	];
	let selectedView = $derived(options[selectedOption].value);

	const availableRange = [2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026];
	let selectedYear = $state(availableRange[availableRange.length - 1]);
</script>

<div class="container">
	<div class="header">
		<div class="header-left">
			<div class="badge">Analysis Mode</div>

			<div class="combobox-wrap">
				<label {...combobox.label} class="sr-only">Select metric</label>
				<div class="combobox-input-wrap">
					<input {...combobox.input} class="combobox-input" placeholder="Select metric…" />
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
					{#each filtered as opt (opt.key)}
						<div {...combobox.getOption(opt.name)} class="combobox-option">
							<span>{opt.name}</span>
							<span class="option-right">
								{#if opt.timeSeries}
									<span class="ts-badge">time series</span>
								{/if}
								{#if combobox.isSelected(opt.name)}
									<span class="check">✓</span>
								{/if}
							</span>
						</div>
					{:else}
						<span class="combobox-empty">No results found</span>
					{/each}
				</div>
			</div>
		</div>

		<button class="close-btn" onclick={onClose}>✕</button>
	</div>

	<hr />

	<div class="options">
		{#each options as opt, index}
			<button
				class="option"
				class:selected={selectedOption === index}
				onclick={() => (selectedOption = index)}
			>
				<opt.icon size={18} />
				<span>{opt.text}</span>
			</button>
		{/each}
	</div>

	<hr />

	<div class="display" class:transparent={selectedView === 'map'}>
		{#if selectedView === 'map'}
			<div class="map-controls">
				<div class="map-controls-label">Display Mode</div>
				<div class="map-mode-options">
					<button
						class="map-mode-btn"
						class:active={mapState.displayMode === 'flat'}
						onclick={() => {
							setCurrentDataset(selectedAnalysis.key);
							setDisplayMode('flat');
						}}
					>
						<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
							<rect
								x="2"
								y="5"
								width="12"
								height="6"
								rx="1.5"
								stroke="currentColor"
								stroke-width="1.5"
							/>
						</svg>
						Heatmap
					</button>
					<button
						class="map-mode-btn"
						class:active={mapState.displayMode === 'columns'}
						onclick={() => {
							setCurrentDataset(selectedAnalysis.key);
							setDisplayMode('columns');
						}}
					>
						<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
							<rect x="2" y="8" width="3" height="6" rx="1" fill="currentColor" />
							<rect x="6.5" y="5" width="3" height="9" rx="1" fill="currentColor" />
							<rect x="11" y="2" width="3" height="12" rx="1" fill="currentColor" />
						</svg>
						Columns
					</button>
				</div>

				<div class="map-hint">
					Map is visible behind this panel. Close analysis mode to interact with it.
				</div>
			</div>
			<div class="mapWindow"></div>
		{:else}
			<Graph {selectedView} {selectedAnalysis} countries={countriesStore.countries} />
		{/if}
	</div>

	<hr />

	<div class="time-slider">
		<button onclick={() => (selectedYear = Math.max(availableRange[0], selectedYear - 1))}>‹</button
		>
		<button>Play</button>
		<div class="year-label">{availableRange[0]}</div>
		<input
			type="range"
			min={availableRange[0]}
			max={availableRange[availableRange.length - 1]}
			bind:value={selectedYear}
		/>
		<div class="year-label">{availableRange[availableRange.length - 1]}</div>
		<button
			onclick={() =>
				(selectedYear = Math.min(availableRange[availableRange.length - 1], selectedYear + 1))}
			>›</button
		>
	</div>
</div>

<style>
	.container > div {
		background-color: var(--color-background);
		pointer-events: auto;
	}
	div.transparent {
		background: none;
		pointer-events: none;
	}
	.mapWindow {
		height: 100%;
		flex: 1;
		background: transparent;
	}
	.container {
		display: flex;
		flex-direction: column;
		min-width: 0;
		height: 100%;
		flex: 1;
		pointer-events: none;
	}

	.header {
		padding: 12px 16px;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.header-left {
		display: flex;
		align-items: center;
		gap: 12px;
	}
	.badge {
		font-size: 11px;
		font-weight: 600;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		color: #888;
		white-space: nowrap;
	}

	.close-btn {
		background: none;
		border: none;
		cursor: pointer;
		font-size: 16px;
		color: #888;
		padding: 4px 8px;
		border-radius: 6px;
	}
	.close-btn:hover {
		background: #f0f0f0;
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
		width: 160px;
		background: transparent;
		color: #1a1a1a;
	}
	.combobox-chevron {
		background: none;
		border: none;
		cursor: pointer;
		color: #888;
		display: flex;
		align-items: center;
		padding: 2px;
		transition: transform 150ms ease;
	}
	.combobox-chevron.open {
		transform: rotate(180deg);
	}

	.combobox-menu {
		position: absolute;
		top: calc(100% + 4px);
		left: 0;
		min-width: 220px;
		background: #fff;
		border: 1px solid #e5e7eb;
		border-radius: 10px;
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
		padding: 4px;
		z-index: 100;
		max-height: 240px;
		overflow-y: auto;
	}
	.combobox-option {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 8px 10px;
		border-radius: 6px;
		font-size: 13px;
		cursor: pointer;
		color: #1a1a1a;
	}
	.combobox-option:hover,
	:global(.combobox-option[data-highlighted]) {
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
	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
	}

	hr {
		margin: 0;
		border: 1px solid #f0f0f0;
		width: 100%;
	}

	.options {
		display: flex;
		padding: 10px 12px;
		gap: 6px;
	}
	.option {
		cursor: pointer;
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 7px 12px;
		border-radius: 10px;
		border: none;
		background: none;
		font: inherit;
		font-size: 13px;
		color: #444;
	}
	.option:hover {
		background: #f0f0f0;
	}
	.option.selected {
		background: #eeeeee;
		font-weight: 600;
	}

	.display {
		flex: 1;
		min-height: 0; /* critical — prevents flex child from ignoring overflow */
		overflow: hidden;
	}

	.time-slider {
		display: flex;
		gap: 16px;
		align-items: center;
		padding: 12px 3rem;
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
		font-size: 13px;
		color: #888;
		font-variant-numeric: tabular-nums;
	}

	.map-controls {
		display: flex;
		flex-direction: column;
		gap: 16px;
		padding: 24px;
		/* height: 100%; */
		background-color: var(--color-background);
		pointer-events: auto;
		width: min-content;
		border-bottom-right-radius: 12px;
	}

	.map-controls-label {
		font-size: 11px;
		font-weight: 600;
		letter-spacing: 0.06em;
		text-transform: uppercase;
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
		background-color: var(--color-background);
		font-size: 13px;
		font-weight: 500;
		color: #444;
		cursor: pointer;
		transition: all 120ms ease;
	}

	.map-mode-btn:hover {
		background: #f5f5f5;
		border-color: #d1d5db;
	}

	.map-mode-btn.active {
		background: #0f0f0f;
		color: white;
		border-color: #0f0f0f;
	}

	.map-hint {
		font-size: 12px;
		color: #9ca3af;
		max-width: 280px;
		line-height: 1.5;
	}
</style>
