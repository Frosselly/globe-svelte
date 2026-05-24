<script lang="ts">
	import { onMount } from 'svelte';
	import * as d3 from 'd3';
	import type { ChartMode, DataResult, SeriesRow } from '$lib/core/types';
	import {
		setCurrentDataset,
		setDisplayMode,
		setIndicatorRows,
		type IndicatorRow
	} from './map/mapStore.svelte';
	import AGTable from './table/AGTable.svelte';
	import AGTableAdmin from './table/AGTableAdmin.svelte';
	import { SvelteURLSearchParams } from 'svelte/reactivity';
	import { goto } from '$app/navigation';

	let { result }: { result: DataResult } = $props();

	let mode = $state<ChartMode>(result.chart === 'bar' ? 'bar' : 'line');
	let selectedYear = $state(result.end);
	let canvasEl: HTMLElement | null = null;

	onMount(() => {
		draw();
	});

	$effect(() => {
		mode;
		selectedYear;
		draw();
	});

	function draw() {
		if (!canvasEl) return;
		canvasEl.innerHTML = '';
		if (mode === 'bar') showMap();
		else drawLine();
	}

	function showMap() {
		const params = new SvelteURLSearchParams();
		params.set('view', 'map');
		goto(`/analysis?${params}`, { replaceState: false, invalidateAll: true });
		const indicatorRows = seriesToIndicatorRows(result.series);
		setIndicatorRows(indicatorRows);
		setCurrentDataset(result.indicator);
		setDisplayMode('flat');
	}

	export function seriesToIndicatorRows(rows: SeriesRow[]): IndicatorRow[] {
		return rows.map((row) => {
			const latest = row.series
				.filter((p) => p.value !== null)
				.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

			return {
				iso2: row.code ?? '',
				name: row.country,
				value: latest?.value ?? null
			};
		});
	}

	// -- Line chart ------------

	function drawLine() {
		const el = canvasEl!;
		const m = { top: 16, right: 90, bottom: 34, left: 62 };
		const W = Math.max(280, el.clientWidth) - m.left - m.right;
		const H = 220 - m.top - m.bottom;

		const svg = d3
			.select(el)
			.append('svg')
			.attr('width', W + m.left + m.right)
			.attr('height', H + m.top + m.bottom)
			.style('font-family', 'system-ui,sans-serif');

		const g = svg.append('g').attr('transform', `translate(${m.left},${m.top})`);
		const all = result.series.flatMap((s) =>
			s.series
				.filter((p) => p.value !== null)
				.map((p) => ({ date: +p.date, value: p.value as number }))
		);

		if (!all.length) {
			g.append('text').attr('x', 8).attr('y', 20).attr('fill', '#888').text('No data');
			return;
		}

		const x = d3
			.scaleLinear()
			.domain(d3.extent(all, (d) => d.date) as [number, number])
			.range([0, W]);
		const y = d3
			.scaleLinear()
			.domain([d3.min(all, (d) => d.value)! * 0.9, d3.max(all, (d) => d.value)! * 1.1])
			.nice()
			.range([H, 0]);

		// Gridlines
		g.append('g')
			.attr('class', 'grid')
			.call(
				d3
					.axisLeft(y)
					.ticks(4)
					.tickSize(-W)
					.tickFormat('' as any)
			)
			.call((g) => g.select('.domain').remove())
			.call((g) => g.selectAll('line').attr('stroke', 'rgba(255,255,255,.06)'));

		g.append('g')
			.attr('transform', `translate(0,${H})`)
			.call(d3.axisBottom(x).tickFormat(d3.format('d')).ticks(6))
			.call((g) => g.select('.domain').attr('stroke', 'rgba(255,255,255,.15)'))
			.call((g) => g.selectAll('text').attr('fill', '#8ba8c4').attr('font-size', 10));

		g.append('g')
			.call(d3.axisLeft(y).ticks(4).tickFormat(d3.format('.2s')))
			.call((g) => g.select('.domain').attr('stroke', 'rgba(255,255,255,.15)'))
			.call((g) => g.selectAll('text').attr('fill', '#8ba8c4').attr('font-size', 10));

		const color = d3.scaleOrdinal(d3.schemeTableau10).domain(result.series.map((s) => s.country));
		const line = d3
			.line<{ date: number; value: number }>()
			.defined((d) => d.value !== null)
			.x((d) => x(d.date))
			.y((d) => y(d.value))
			.curve(d3.curveMonotoneX);

		result.series.forEach((s) => {
			const pts = s.series.map((p) => ({ date: +p.date, value: p.value as number }));
			const col = color(s.country) as string;

			// Area fill
			const area = d3
				.area<{ date: number; value: number }>()
				.defined((d) => d.value !== null)
				.x((d) => x(d.date))
				.y0(H)
				.y1((d) => y(d.value))
				.curve(d3.curveMonotoneX);

			g.append('path')
				.datum(pts)
				.attr('fill', col)
				.attr('opacity', 0.06)
				.attr('d', area as any);

			// Line
			g.append('path')
				.datum(pts)
				.attr('fill', 'none')
				.attr('stroke', col)
				.attr('stroke-width', 2)
				.attr('d', line as any);

			// End label
			const last = pts
				.slice()
				.reverse()
				.find((d) => d.value !== null);
			if (last)
				g.append('text')
					.attr('x', x(last.date) + 5)
					.attr('y', y(last.value))
					.attr('fill', col)
					.attr('font-size', 10)
					.attr('dominant-baseline', 'middle')
					.text(s.country);
		});
	}

	// -- Bar chart -------------

	function drawBar() {
		const el = canvasEl!;
		const m = { top: 14, right: 16, bottom: 60, left: 66 };
		const W = Math.max(280, el.clientWidth) - m.left - m.right;
		const H = 200 - m.top - m.bottom;

		const pts = result.series
			.map((s) => ({
				country: s.country,
				value: s.series.find((p) => p.date === String(selectedYear))?.value ?? null
			}))
			.filter((p) => p.value !== null) as { country: string; value: number }[];

		const svg = d3
			.select(el)
			.append('svg')
			.attr('width', W + m.left + m.right)
			.attr('height', H + m.top + m.bottom)
			.style('font-family', 'system-ui,sans-serif');

		const g = svg.append('g').attr('transform', `translate(${m.left},${m.top})`);

		if (!pts.length) {
			g.append('text')
				.attr('x', 8)
				.attr('y', 20)
				.attr('fill', '#888')
				.text(`No data for ${selectedYear}`);
			return;
		}

		const x = d3
			.scaleBand()
			.domain(pts.map((p) => p.country))
			.range([0, W])
			.padding(0.28);
		const y = d3
			.scaleLinear()
			.domain([0, d3.max(pts, (p) => p.value)! * 1.1])
			.nice()
			.range([H, 0]);
		const col = d3.scaleOrdinal(d3.schemeTableau10).domain(pts.map((p) => p.country));

		// Gridlines
		g.append('g')
			.call(
				d3
					.axisLeft(y)
					.ticks(4)
					.tickSize(-W)
					.tickFormat('' as any)
			)
			.call((g) => g.select('.domain').remove())
			.call((g) => g.selectAll('line').attr('stroke', 'rgba(255,255,255,.06)'));

		g.append('g')
			.attr('transform', `translate(0,${H})`)
			.call(d3.axisBottom(x))
			.call((g) => g.select('.domain').attr('stroke', 'rgba(255,255,255,.15)'))
			.selectAll('text')
			.attr('transform', 'rotate(-28)')
			.style('text-anchor', 'end')
			.attr('fill', '#8ba8c4')
			.attr('font-size', 10);

		g.append('g')
			.call(d3.axisLeft(y).ticks(4).tickFormat(d3.format('.2s')))
			.call((g) => g.select('.domain').attr('stroke', 'rgba(255,255,255,.15)'))
			.call((g) => g.selectAll('text').attr('fill', '#8ba8c4').attr('font-size', 10));

		g.selectAll('rect')
			.data(pts)
			.join('rect')
			.attr('x', (p) => x(p.country)!)
			.attr('y', (p) => y(p.value))
			.attr('width', x.bandwidth())
			.attr('height', (p) => H - y(p.value))
			.attr('fill', (p) => col(p.country) as string)
			.attr('rx', 3);

		// Value labels on top of bars
		g.selectAll('.bar-label')
			.data(pts)
			.join('text')
			.attr('class', 'bar-label')
			.attr('x', (p) => x(p.country)! + x.bandwidth() / 2)
			.attr('y', (p) => y(p.value) - 4)
			.attr('text-anchor', 'middle')
			.attr('fill', '#8ba8c4')
			.attr('font-size', 9)
			.text((p) => d3.format('.2s')(p.value));
	}
</script>

<!-- -- Template ------------ -->

<div class="card-inner">
	<!-- Toolbar -->
	<div class="toolbar">
		<span class="ind-label">{result.indicator}</span>

		<!-- Mode tabs -->
		<div class="tabs">
			{#each ['line', 'bar'] as const as m}
				<button class="tab" class:active={mode === m} onclick={() => (mode = m)}
					>{m === 'line' ? '📈 Trend' : '📊 Compare'}</button
				>
			{/each}
		</div>

		<!-- Year slider — only for bar mode -->
		{#if mode === 'bar'}
			<div class="year-row">
				<span class="year-val">{selectedYear}</span>
				<input type="range" min={result.start} max={result.end} bind:value={selectedYear} />
			</div>
		{/if}
	</div>

	<!-- Chart canvas — bind:this so D3 can write into it -->
	<div class="canvas" bind:this={canvasEl}></div>
</div>

<style>
	.card-inner {
		display: flex;
		flex-direction: column;
		gap: 6px;
		padding: 10px 12px;
	}

	.toolbar {
		display: flex;
		align-items: center;
		gap: 10px;
		flex-wrap: wrap;
	}
	.ind-label {
		flex: 1;
		font-size: 0.8rem;
		color: #7ba3c8;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.tabs {
		display: flex;
		gap: 4px;
	}
	.tab {
		padding: 3px 9px;
		border-radius: 5px;
		border: 1px solid rgba(255, 255, 255, 0.1);
		background: transparent;
		color: #aac4e0;
		font-size: 0.76rem;
		cursor: pointer;
	}
	.tab.active {
		background: #0ea5e9;
		border-color: #0ea5e9;
		color: #fff;
	}
	.tab:hover:not(.active) {
		background: rgba(255, 255, 255, 0.07);
	}

	.year-row {
		display: flex;
		align-items: center;
		gap: 7px;
		font-size: 0.78rem;
		color: #93c5fd;
	}
	.year-val {
		min-width: 2.6rem;
		text-align: right;
		font-variant-numeric: tabular-nums;
	}
	.year-row input[type='range'] {
		width: 100px;
		accent-color: #0ea5e9;
	}

	.canvas {
		min-height: 180px;
		overflow: hidden;
		width: 100%;
	}
</style>
