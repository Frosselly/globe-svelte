<script lang="ts">
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';
	import Graph from '$lib/components/graph/graph.svelte';
	import { mapState, setCurrentDataset, setDisplayMode } from '$lib/components/map/mapStore.svelte';

	let { data }: { data: PageData } = $props();

	const { view, option, rows, lineResults } = data;

	let label = $state(view.label);
	let renaming = $state(false);
	let deleting = $state(false);
	let renameErr = $state<string | null>(null);

	// For line mode: the first saved country is shown by default
	const firstIso2 = $derived(
		view.mode === 'line' && lineResults.length ? lineResults[0].iso2 : null
	);
	let selectedLineIso2 = $state<string | null>(null);
	$effect(() => {
		if (firstIso2 && !selectedLineIso2) selectedLineIso2 = firstIso2;
	});

	const activeHistory = $derived(
		lineResults.find((r) => r.iso2 === (selectedLineIso2 ?? firstIso2))?.history ?? null
	);

	async function saveLabel() {
		renaming = true;
		renameErr = null;
		const res = await fetch('/api/save', {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ id: view.id, label })
		});
		if (!res.ok) renameErr = 'Failed to rename';
		renaming = false;
	}

	async function deleteView() {
		if (!confirm('Delete this analysis?')) return;
		deleting = true;
		await fetch(`/api/save?id=${view.id}`, { method: 'DELETE' });
		goto('/dashboard');
	}
</script>

<div class="container">
	<header class="analysis-header">
		<div class="label-row">
			<input
				class="label-input"
				bind:value={label}
				onblur={saveLabel}
				onkeydown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
			/>
			{#if renaming}<span class="hint">Saving…</span>{/if}
			{#if renameErr}<span class="hint err">{renameErr}</span>{/if}
		</div>

		<div class="meta">
			<span class="mode-pill">{view.mode}</span>
			{option.label} · {view.startYear}–{view.endYear}
			{view.selectedYear ? `· Year ${view.selectedYear}` : ''}
		</div>

		<div class="actions">
			<a href="/analysis" class="btn-ghost">← New analysis</a>
			<a href="/dashboard" class="btn-ghost">Dashboard</a>
			<button class="btn-danger" onclick={deleteView} disabled={deleting}>
				{deleting ? 'Deleting…' : 'Delete'}
			</button>
		</div>
	</header>

	<!-- Chart -->
	<div class="chart-wrapper" class:transparent={view.mode === 'map'}>
		{#if view.mode === 'map'}
			<div class="map-controls">
				<div class="map-controls-label">Display Mode</div>
				<div class="map-mode-options">
					<button
						class="map-mode-btn"
						class:active={mapState.displayMode === 'flat'}
						onclick={() => {
							// Ensure the dataset is synced and mode updated
							setCurrentDataset(option);
							setDisplayMode('flat');
						}}>Heatmap</button
					>
					<button
						class="map-mode-btn"
						class:active={mapState.displayMode === 'columns'}
						onclick={() => {
							setCurrentDataset(option);
							setDisplayMode('columns');
						}}>Columns</button
					>
				</div>
				<p class="map-hint">{option.label} colour-coded on the map.</p>
			</div>
		{:else if view.mode === 'line' && lineResults.length === 0}
			<div class="state-error">⚠ No time-series data found for the saved countries.</div>
		{:else if view.mode !== 'line' && rows.length === 0}
			<div class="state-error">⚠ No data found for the saved countries and indicator.</div>
		{:else}
			<Graph
				view={view.mode}
				{option}
				{rows}
				history={activeHistory}
				selectedIso2={selectedLineIso2}
				onSelectCountry={(iso2) => (selectedLineIso2 = iso2)}
			/>
		{/if}
	</div>
</div>

<style>
	.transparent {
		background: transparent !important;
		pointer-events: none;
	}
	.page {
		display: flex;
		flex-direction: column;
		height: 100%;
		overflow: hidden;
	}

	.analysis-header {
		padding: 14px 20px;
		border-bottom: 1px solid #f0f0f0;
		display: flex;
		flex-direction: column;
		gap: 6px;
		flex-shrink: 0;
		background: var(--color-background);
	}
	.label-row {
		display: flex;
		align-items: center;
		gap: 10px;
	}
	.label-input {
		font-size: 1.2rem;
		font-weight: 700;
		border: none;
		border-bottom: 2px solid transparent;
		background: transparent;
		padding: 2px 4px;
		flex: 1;
	}
	.label-input:focus {
		outline: none;
		border-bottom-color: #0ea5e9;
	}
	.hint {
		font-size: 0.75rem;
		color: #9ca3af;
	}
	.err {
		color: #dc2626;
	}

	.meta {
		font-size: 0.84rem;
		color: #6b7280;
		display: flex;
		align-items: center;
		gap: 8px;
	}
	.mode-pill {
		background: #f3f4f6;
		color: #374151;
		padding: 2px 8px;
		border-radius: 20px;
		font-size: 11px;
		font-weight: 600;
		text-transform: uppercase;
	}
	.actions {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
	}

	.btn-ghost {
		background: transparent;
		border: 1px solid #d1d5db;
		color: #374151;
		border-radius: 7px;
		padding: 5px 12px;
		font-size: 0.84rem;
		text-decoration: none;
		display: inline-flex;
		align-items: center;
	}
	.btn-ghost:hover {
		background: #f3f4f6;
	}
	.btn-danger {
		background: #fef2f2;
		border: 1px solid #fecaca;
		color: #dc2626;
		border-radius: 7px;
		padding: 5px 12px;
		font-size: 0.84rem;
		cursor: pointer;
	}
	.btn-danger:hover:not(:disabled) {
		background: #fee2e2;
	}
	.btn-danger:disabled {
		opacity: 0.5;
		cursor: default;
	}

	.chart-wrapper {
		flex: 1;
		min-height: 0;
		overflow: hidden;
	}

	.state-error {
		margin: 2rem;
		background: #fef2f2;
		border: 1px solid #fecaca;
		color: #dc2626;
		border-radius: 10px;
		padding: 1rem 1.5rem;
	}

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
