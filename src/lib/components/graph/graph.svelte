<script lang="ts">
	import { formatLargeNumbers } from '$lib/utils/utils';
	import * as d3 from 'd3';
	import { selectedCountryStore } from '../../../routes/store.svelte';

	const {
		selectedView: view,
		selectedAnalysis,
		countries
	} = $props<{
		selectedView: string;
		selectedAnalysis: { name: string; key: string; timeSeries: boolean };
		countries: Record<string, any>;
	}>();

	function getNestedValue(obj: any, path: string): number | null {
		if (!path) return null;
		const val = path.split('.').reduce((acc: any, k: string) => acc?.[k], obj);
		return val != null && !isNaN(Number(val)) ? Number(val) : null;
	}

	const allCountries = $derived(
		Object.entries(countries)
			.map(([iso2, country]: [string, any]) => {
				const value = getNestedValue(country, selectedAnalysis.key);
				const name = country?.metadata?.name?.common ?? iso2;
				return value != null ? { name, iso2, value } : null;
			})
			.filter(Boolean)
			.sort((a: any, b: any) => b.value - a.value) as {
			name: string;
			iso2: string;
			value: number;
		}[]
	);

	// Selected country from global store for line chart
	const selectedCountryName = $derived(
		selectedCountryStore.country?.metadata?.name?.common ?? null
	);

	const timeSeriesData = $derived(
		(() => {
			if (!selectedAnalysis.timeSeries) return null;

			// Use global selected country, fall back to first checked country
			const targetName = selectedCountryName ?? allCountries[0]?.name;

			if (!targetName) return null;

			const countryEntry = Object.values(countries).find(
				(c: any) => c?.metadata?.name?.common === targetName
			) as any;

			if (!countryEntry) return null;

			const parts = selectedAnalysis.key.split('.');
			const parent = parts.slice(0, -1).reduce((acc: any, k: string) => acc?.[k], countryEntry);
			const yoy = parent?.historicalData ?? parent?.yearOverYear ?? null;
			if (!yoy?.length) return null;

			return {
				country: targetName,
				yearOverYear: yoy as any[]
			};
		})()
	);

	let containerEl = $state<HTMLDivElement | null>(null);
	let svgEl = $state<SVGSVGElement | null>(null);
	let selectedCountries = $state<Set<string>>(new Set());
	let hoveredYear = $state<number | null>(null);

	// Auto-select top 5 on first load
	$effect(() => {
		if (allCountries.length && selectedCountries.size === 0) {
			selectedCountries = new Set(allCountries.slice(0, 5).map((c) => c.name));
		}
	});

	const filteredData = $derived(allCountries.filter((c) => selectedCountries.has(c.name)));

	let W = $state(600);
	let H = $state(400);
	const margin = { top: 40, right: 40, bottom: 40, left: 110 };
	const innerW = $derived(Math.max(W - margin.left - margin.right, 1));
	const innerH = $derived(Math.max(H - margin.top - margin.bottom, 1));

	const BAR_COLOR = '#4f8ef7';
	const LINE_COLOR = '#f7694f';
	const AXIS_COLOR = '#555';
	const GRID_COLOR = '#e5e7eb';
	const LABEL_COLOR = '#374151';
	const DOT_HOVER_COLOR = '#c0392b';

	$effect(() => {
		if (!svgEl) return;
		if (view === 'bar') drawBar();
		else drawLine();
	});

	$effect(() => {
		if (!containerEl) return;
		const ro = new ResizeObserver((entries) => {
			const { width, height } = entries[0].contentRect;
			W = Math.max(width, 1);
			H = Math.max(height, 1);
		});
		ro.observe(containerEl);
		return () => ro.disconnect();
	});

	function clearSvg() {
		if (!svgEl) return;
		d3.select(svgEl).selectAll('*').remove();
	}

	function baseGroup() {
		return d3
			.select(svgEl)
			.attr('width', W)
			.attr('height', H)
			.append('g')
			.attr('transform', `translate(${margin.left},${margin.top})`);
	}

	function drawBar() {
		clearSvg();
		const g = baseGroup();
		const data = filteredData;

		if (!data.length) {
			g.append('text')
				.attr('x', innerW / 2)
				.attr('y', innerH / 2)
				.attr('text-anchor', 'middle')
				.attr('fill', '#9ca3af')
				.attr('font-size', '14px')
				.text('Select countries to display');
			return;
		}

		const xScale = d3
			.scaleLinear()
			.domain([0, d3.max(data, (d) => d.value)! * 1.15])
			.range([0, innerW]);

		const yScale = d3
			.scaleBand()
			.domain(data.map((d) => d.name))
			.range([0, innerH])
			.padding(0.35);

		// Grid
		g.append('g')
			.attr('class', 'grid')
			.call(
				d3
					.axisBottom(xScale)
					.tickSize(innerH)
					.tickFormat(() => '')
			)
			.call((sel) => sel.select('.domain').remove())
			.selectAll('line')
			.attr('stroke', GRID_COLOR)
			.attr('stroke-dasharray', '4,3');

		// Bars
		g.selectAll<SVGRectElement, (typeof data)[0]>('rect.bar')
			.data(data, (d: any) => d.name)
			.join(
				(enter) =>
					enter
						.append('rect')
						.attr('class', 'bar')
						.attr('y', (d) => yScale(d.name)!)
						.attr('height', yScale.bandwidth())
						.attr('x', 0)
						.attr('width', 0)
						.attr('rx', 4)
						.attr('fill', BAR_COLOR)
						.attr('opacity', 0.88),
				(update) => update,
				(exit) => exit.remove()
			)
			.transition()
			.duration(600)
			.ease(d3.easeCubicOut)
			.attr('width', (d) => xScale(d.value));

		// Value labels
		g.selectAll<SVGTextElement, (typeof data)[0]>('text.val')
			.data(data, (d: any) => d.name)
			.join(
				(enter) =>
					enter
						.append('text')
						.attr('class', 'val')
						.attr('y', (d) => yScale(d.name)! + yScale.bandwidth() / 2)
						.attr('dy', '0.35em')
						.attr('opacity', 0),
				(update) => update,
				(exit) => exit.remove()
			)
			.transition()
			.delay(400)
			.duration(300)
			.attr('opacity', 1)
			.attr('x', (d) => (xScale(d.value) > 80 ? 8 : xScale(d.value) + 8))
			.attr('fill', (d) => (xScale(d.value) > 80 ? 'white' : LABEL_COLOR))
			.attr('text-anchor', 'start')
			.attr('font-size', '12px')
			.attr('font-weight', '600')
			.text((d) => formatLargeNumbers(d.value));

		// Y Axis
		g.append('g')
			.call(d3.axisLeft(yScale).tickSize(0))
			.call((sel) => {
				sel.select('.domain').attr('stroke', AXIS_COLOR);
				sel
					.selectAll('text')
					.attr('fill', LABEL_COLOR)
					.attr('font-size', '12px')
					.attr('text-anchor', 'end')
					.attr('dx', '-8px');
			});

		// X Axis
		g.append('g')
			.attr('transform', `translate(0,${innerH})`)
			.call(
				d3
					.axisBottom(xScale)
					.ticks(5)
					.tickFormat((d) => formatLargeNumbers(Number(d)))
			)
			.call((sel) => {
				sel.select('.domain').attr('stroke', AXIS_COLOR);
				sel.selectAll('.tick line').attr('stroke', AXIS_COLOR);
				sel
					.selectAll('text')
					.attr('fill', LABEL_COLOR)
					.attr('font-size', '12px')
					.attr('dy', '1.4em');
			});

		// Title
		g.append('text')
			.attr('x', innerW / 2)
			.attr('y', -16)
			.attr('text-anchor', 'middle')
			.attr('fill', LABEL_COLOR)
			.attr('font-size', '14px')
			.attr('font-weight', '700')
			.text(`${selectedAnalysis.name} by Country`);
	}

	function drawLine() {
		clearSvg();
		const g = baseGroup();
		const ts = timeSeriesData;

		if (!ts) {
			g.append('text')
				.attr('x', innerW / 2)
				.attr('y', innerH / 2)
				.attr('text-anchor', 'middle')
				.attr('fill', '#9ca3af')
				.attr('font-size', '14px')
				.text(
					selectedCountryName
						? `No time series data for ${selectedCountryName}`
						: 'Click a country on the map to view trend'
				);
			return;
		}

		const data = ts.yearOverYear;

		const xScale = d3
			.scaleLinear()
			.domain(d3.extent(data, (d) => d.year) as [number, number])
			.range([0, innerW]);

		const yScale = d3
			.scaleLinear()
			.domain([0, d3.max(data, (d) => d.value ?? d.visitors ?? d.percentage)! * 1.15])
			.range([innerH, 0]);

		// Grid
		g.append('g')
			.attr('class', 'grid')
			.call(
				d3
					.axisLeft(yScale)
					.tickSize(-innerW)
					.tickFormat(() => '')
			)
			.call((sel) => sel.select('.domain').remove())
			.selectAll('line')
			.attr('stroke', GRID_COLOR)
			.attr('stroke-dasharray', '4,3');

		// Area
		const area = d3
			.area<{ year: number; value: number }>()
			.x((d) => xScale(d.year))
			.y0(innerH)
			.y1((d) => yScale(d.value))
			.curve(d3.curveMonotoneX);
		g.append('path').datum(data).attr('fill', LINE_COLOR).attr('opacity', 0.1).attr('d', area);

		// Line
		const line = d3
			.line<{ year: number; value: number }>()
			.x((d) => xScale(d.year))
			.y((d) => yScale(d.value))
			.curve(d3.curveMonotoneX);
		const path = g
			.append('path')
			.datum(data)
			.attr('fill', 'none')
			.attr('stroke', LINE_COLOR)
			.attr('stroke-width', 2.5)
			.attr('d', line);
		const len = (path.node() as SVGPathElement).getTotalLength();
		path
			.attr('stroke-dasharray', `${len} ${len}`)
			.attr('stroke-dashoffset', len)
			.transition()
			.duration(800)
			.ease(d3.easeCubicOut)
			.attr('stroke-dashoffset', 0);

		// Dots — label only on hover
		const dots = g
			.selectAll<SVGCircleElement, { year: number; value: number }>('circle')
			.data(data)
			.join('circle')
			.attr('cx', (d) => xScale(d.year))
			.attr('cy', (d) => yScale(d.value))
			.attr('r', 0)
			.attr('fill', LINE_COLOR)
			.attr('stroke', 'white')
			.attr('stroke-width', 2)
			.style('cursor', 'pointer')
			.transition()
			.delay(700)
			.duration(300)
			.attr('r', 5);

		// Hover label (single element, repositioned on hover)
		const hoverLabel = g
			.append('text')
			.attr('class', 'hover-label')
			.attr('text-anchor', 'middle')
			.attr('font-size', '12px')
			.attr('font-weight', '700')
			.attr('fill', LABEL_COLOR)
			.attr('opacity', 0)
			.attr('pointer-events', 'none');

		// Invisible wider hit targets for easier hover
		g.selectAll<SVGCircleElement, { year: number; value: number }>('circle.hit')
			.data(data)
			.join('circle')
			.attr('class', 'hit')
			.attr('cx', (d) => xScale(d.year))
			.attr('cy', (d) => yScale(d.value))
			.attr('r', 14)
			.attr('fill', 'transparent')
			.on('mouseenter', function (_, d) {
				d3.select(this.parentNode as any)
					.selectAll<SVGCircleElement, { year: number; value: number }>('circle:not(.hit)')
					.filter((c) => c.year === d.year)
					.attr('fill', DOT_HOVER_COLOR)
					.attr('r', 7);

				hoverLabel
					.attr('x', xScale(d.year))
					.attr('y', yScale(d.value) - 14)
					.text(formatLargeNumbers(d.value))
					.attr('opacity', 1);
			})
			.on('mouseleave', function (_, d) {
				d3.select(this.parentNode as any)
					.selectAll<SVGCircleElement, { year: number; value: number }>('circle:not(.hit)')
					.filter((c) => c.year === d.year)
					.attr('fill', LINE_COLOR)
					.attr('r', 5);

				hoverLabel.attr('opacity', 0);
			});

		// X Axis — every 2nd or 3rd year
		const tickStep = data.length > 10 ? 3 : 2;
		const tickYears = data
			.map((d) => d.year)
			.filter((_, i) => i % tickStep === 0 || i === data.length - 1);

		g.append('g')
			.attr('transform', `translate(0,${innerH})`)
			.call(
				d3
					.axisBottom(xScale)
					.tickValues(tickYears)
					.tickFormat((d) => String(d))
					.tickSize(0)
			)
			.call((sel) => {
				sel.select('.domain').attr('stroke', AXIS_COLOR);
				sel
					.selectAll('text')
					.attr('fill', LABEL_COLOR)
					.attr('font-size', '12px')
					.attr('dy', '1.4em');
			});

		// Y Axis
		g.append('g')
			.call(
				d3
					.axisLeft(yScale)
					.ticks(5)
					.tickFormat((d) => formatLargeNumbers(Number(d)))
			)
			.call((sel) => {
				sel.select('.domain').attr('stroke', AXIS_COLOR);
				sel.selectAll('.tick line').attr('stroke', AXIS_COLOR);
				sel.selectAll('text').attr('fill', LABEL_COLOR).attr('font-size', '12px');
			});

		// Title
		g.append('text')
			.attr('x', innerW / 2)
			.attr('y', -16)
			.attr('text-anchor', 'middle')
			.attr('fill', LABEL_COLOR)
			.attr('font-size', '14px')
			.attr('font-weight', '700')
			.text(`${ts.country} — ${selectedAnalysis.name}`);
	}

	function toggleCountry(name: string) {
		const s = new Set(selectedCountries);
		s.has(name) ? s.delete(name) : s.add(name);
		selectedCountries = s;
	}

	function selectAll() {
		selectedCountries = new Set(allCountries.map((c) => c.name));
	}

	function clearAll() {
		selectedCountries = new Set();
	}
</script>

<div class="graphWindow">
	<div class="graphContainer" bind:this={containerEl}>
		<div class="content">
			<svg bind:this={svgEl}></svg>

			{#if view === 'bar'}
				<div class="sidebar">
					<div class="sidebar-header">
						<h3>Countries</h3>
						<div class="sidebar-actions">
							<button onclick={selectAll}>All</button>
							<button onclick={clearAll}>None</button>
						</div>
					</div>
					<div class="checkboxList">
						{#each allCountries as country (country.name)}
							<label class="checkboxItem">
								<input
									type="checkbox"
									checked={selectedCountries.has(country.name)}
									onchange={() => toggleCountry(country.name)}
								/>
								<span class="country-name">{country.name}</span>
								<span class="country-val">{formatLargeNumbers(country.value)}</span>
							</label>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	.graphWindow {
		width: 100%;
		height: 100%;
		overflow: hidden;
		display: flex;
	}

	.graphContainer {
		width: 100%;
		height: 100%;
		border-radius: 8px;
		background-color: var(--color-background);
		box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.content {
		display: flex;
		flex: 1;
		overflow: hidden;
		min-height: 0;
	}

	svg {
		flex: 1;
		min-width: 0;
		overflow: visible;
	}

	.sidebar {
		width: 200px;
		border-left: 1px solid #e5e7eb;
		display: flex;
		flex-direction: column;
		background: #fafbfc;
		overflow: hidden;
	}

	.sidebar-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 12px 12px 8px;
		flex-shrink: 0;
	}

	.sidebar-header h3 {
		margin: 0;
		font-size: 11px;
		font-weight: 700;
		color: #374151;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.sidebar-actions {
		display: flex;
		gap: 4px;
	}
	.sidebar-actions button {
		font-size: 11px;
		padding: 2px 7px;
		border-radius: 4px;
		border: 1px solid #e5e7eb;
		background-color: var(--color-background);
		cursor: pointer;
		color: #555;
	}
	.sidebar-actions button:hover {
		background: #f0f0f0;
	}

	.checkboxList {
		flex: 1;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		padding: 0 6px 8px;
		gap: 1px;
	}

	.checkboxItem {
		display: flex;
		align-items: center;
		gap: 7px;
		cursor: pointer;
		padding: 5px 6px;
		border-radius: 5px;
		transition: background 0.1s;
		user-select: none;
	}
	.checkboxItem:hover {
		background: #efefef;
	}
	.checkboxItem input {
		cursor: pointer;
		accent-color: #4f8ef7;
		flex-shrink: 0;
	}

	.country-name {
		flex: 1;
		font-size: 12px;
		color: #374151;
		font-weight: 500;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.checkboxItem input:checked + .country-name {
		color: #4f8ef7;
		font-weight: 600;
	}

	.country-val {
		font-size: 11px;
		color: #9ca3af;
		font-variant-numeric: tabular-nums;
		flex-shrink: 0;
	}

	.checkboxList::-webkit-scrollbar {
		width: 4px;
	}
	.checkboxList::-webkit-scrollbar-track {
		background: transparent;
	}
	.checkboxList::-webkit-scrollbar-thumb {
		background: #d1d5db;
		border-radius: 2px;
	}
</style>
