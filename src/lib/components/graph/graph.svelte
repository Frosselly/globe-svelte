<script lang="ts">
	import * as d3 from 'd3';
	import { onMount } from 'svelte';
	import { formatLargeNumbers } from '../utils/utils';

	// --- Types ---
	type CountryData = { name: string; caa3: string; population: number };
	type TimeSeriesData = { country: string; yearOverYear: { year: number; value: number }[] };

	// --- Data ---
	const allCountries: CountryData[] = [
		{ name: 'France', caa3: 'FRA', population: 20000 },
		{ name: 'Germany', caa3: 'DEU', population: 35000 },
		{ name: 'Spain', caa3: 'ESP', population: 15000 },
		{ name: 'Italy', caa3: 'ITA', population: 28000 },
		{ name: 'Poland', caa3: 'POL', population: 12000 },
		{ name: 'Greece', caa3: 'GRC', population: 9000 },
		{ name: 'Sweden', caa3: 'SWE', population: 11000 },
		{ name: 'Belgium', caa3: 'BEL', population: 8500 },
		{ name: 'Francea', caa3: 'FRA', population: 2000000 },
		{ name: 'Germanya', caa3: 'DEU', population: 35000 },
		{ name: 'Spaina', caa3: 'ESP', population: 15000 },
		{ name: 'Italya', caa3: 'ITA', population: 28000 },
		{ name: 'Polanda', caa3: 'POL', population: 12000 },
		{ name: 'Greecea', caa3: 'GRC', population: 9000 },
		{ name: 'Swedena', caa3: 'SWE', population: 11000 },
		{ name: 'Belgiuma', caa3: 'BEL', population: 8500 },
		{ name: 'Franceab', caa3: 'FRA', population: 20000 },
		{ name: 'Germanyab', caa3: 'DEU', population: 35000 },
		{ name: 'Spainab', caa3: 'ESP', population: 15000 },
		{ name: 'Italyab', caa3: 'ITA', population: 28000 },
		{ name: 'Polandab', caa3: 'POL', population: 12000 },
		{ name: 'Greeceab', caa3: 'GRC', population: 9000 },
		{ name: 'Swedenab', caa3: 'SWE', population: 11000 },
		{ name: 'Belgiumab', caa3: 'BEL', population: 8500 }
	];

	const tempDataTimeSeries: TimeSeriesData = {
		country: 'France',
		yearOverYear: [
			{ year: 2019, value: 8000 },
			{ year: 2020, value: 10000 },
			{ year: 2021, value: 14000 },
			{ year: 2022, value: 18000 },
			{ year: 2023, value: 20000 },
			{ year: 2024, value: 40000 }
		]
	};

	// --- State ---
	let { selectedView: view } = $props();

	let containerEl = $state<HTMLDivElement | null>(null);
	let svgEl = $state<SVGSVGElement | null>(null);

	let selectedCountries = $state<Set<string>>(new Set(['France', 'Germany', 'Spain', 'Italy']));

	// Get filtered data based on selection
	const filteredData = $derived(allCountries.filter((c) => selectedCountries.has(c.name)));

	// // Container dimensions
	// let containerWidth = $derived(containerEl?.clientWidth);
	// let containerHeight = $derived(containerEl?.clientHeight);

	// --- Dimensions ---
	let W = $state(1000);
	let H = $state(550);
	const margin = { top: 40, right: 40, bottom: 40, left: 100 };
	const innerW = $derived(Math.max(W - margin.left - margin.right, 1));
	const innerH = $derived(Math.max(H - margin.top - margin.bottom, 1));

	// --- Colors ---
	const BAR_COLOR = '#4f8ef7';
	const LINE_COLOR = '#f7694f';
	const AXIS_COLOR = '#555';
	const GRID_COLOR = '#e5e7eb';
	const LABEL_COLOR = '#374151';

	// --- Reactive draw on view or data change ---
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

	// --- Draw helpers ---
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

	function addGridLines(
		g: d3.Selection<SVGGElement, unknown, null, undefined>,
		xScale: d3.ScaleLinear<number, number>
	) {
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
	}

	// --- Horizontal Bar chart ---
	function drawBar() {
		clearSvg();
		const g = baseGroup();
		const data = filteredData;

		if (data.length === 0) {
			g.append('text')
				.attr('x', innerW / 2)
				.attr('y', innerH / 2)
				.attr('text-anchor', 'middle')
				.attr('fill', '#9ca3af')
				.attr('font-size', '16px')
				.text('Select countries to display');
			return;
		}

		const xScale = d3
			.scaleLinear()
			.domain([0, d3.max(data, (d) => d.population)! * 1.15])
			.range([0, innerW]);

		const yScale = d3
			.scaleBand()
			.domain(data.map((d) => d.name))
			.range([0, innerH])
			.padding(0.35);

		addGridLines(g, xScale);

		// Bars with enter animation
		g.selectAll<SVGRectElement, CountryData>('rect.bar')
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
			.attr('width', (d) => xScale(d.population));

		function getLabelPlacement(population: number) {
			const barWidth = xScale(population);
			const MIN_WIDTH = 80;
			const isInside = barWidth > MIN_WIDTH;

			return {
				x: isInside ? 8 : barWidth + 8,
				fill: isInside ? 'white' : LABEL_COLOR,
				textAnchor: 'start'
			};
		}
		// Value labels inside or outside bars based on bar width
		g.selectAll<SVGTextElement, CountryData>('text.val')
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
			.attr('x', (d) => getLabelPlacement(d.population).x)
			.attr('fill', (d) => getLabelPlacement(d.population).fill)
			.attr('text-anchor', (d) => getLabelPlacement(d.population).textAnchor)
			.attr('font-size', '13px')
			.attr('font-weight', '600')
			.text((d) => formatLargeNumbers(Number(d.population)).toLocaleString());

		// Y Axis (country names on left)
		g.append('g')
			.call(d3.axisLeft(yScale).tickSize(0))
			.call((sel) => {
				sel.select('.domain').attr('stroke', AXIS_COLOR);
				sel
					.selectAll('text')
					.attr('fill', LABEL_COLOR)
					.attr('font-size', '13px')
					.attr('text-anchor', 'end')
					.attr('dx', '-8px');
			});

		// X Axis (bottom)
		g.append('g')
			.attr('transform', `translate(0,${innerH})`)
			.call(
				d3
					.axisBottom(xScale)
					.ticks(6)
					.tickFormat((d) => d.toLocaleString())
			)
			.call((sel) => {
				sel.select('.domain').attr('stroke', AXIS_COLOR);
				sel.selectAll('.tick line').attr('stroke', AXIS_COLOR);
				sel
					.selectAll('text')
					.attr('fill', LABEL_COLOR)
					.attr('font-size', '13px')
					.attr('dy', '1.4em');
			});

		// Chart title
		g.append('text')
			.attr('x', innerW / 2)
			.attr('y', -16)
			.attr('text-anchor', 'middle')
			.attr('fill', LABEL_COLOR)
			.attr('font-size', '16px')
			.attr('font-weight', '700')
			.text('Population by Country — 2024');

		// X-axis label
		g.append('text')
			.attr('x', innerW / 2)
			.attr('y', innerH + 50)
			.attr('text-anchor', 'middle')
			.attr('fill', LABEL_COLOR)
			.attr('font-size', '13px')
			.text('Population');
	}

	// --- Line chart: one country over time ---
	function drawLine() {
		clearSvg();
		const g = baseGroup();
		const data = tempDataTimeSeries.yearOverYear;

		const xScale = d3
			.scaleLinear()
			.domain(d3.extent(data, (d) => d.year) as [number, number])
			.range([0, innerW]);

		const yScale = d3
			.scaleLinear()
			.domain([0, d3.max(data, (d) => d.value)! * 1.15])
			.range([innerH, 0]);

		// Grid lines
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

		// Area fill under line
		const area = d3
			.area<{ year: number; value: number }>()
			.x((d) => xScale(d.year))
			.y0(innerH)
			.y1((d) => yScale(d.value))
			.curve(d3.curveMonotoneX);

		g.append('path').datum(data).attr('fill', LINE_COLOR).attr('opacity', 0.12).attr('d', area);

		// Line path with draw animation
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

		const totalLength = (path.node() as SVGPathElement).getTotalLength();
		path
			.attr('stroke-dasharray', `${totalLength} ${totalLength}`)
			.attr('stroke-dashoffset', totalLength)
			.transition()
			.duration(800)
			.ease(d3.easeCubicOut)
			.attr('stroke-dashoffset', 0);

		// Dots
		g.selectAll<SVGCircleElement, { year: number; value: number }>('circle')
			.data(data)
			.join('circle')
			.attr('cx', (d) => xScale(d.year))
			.attr('cy', (d) => yScale(d.value))
			.attr('r', 0)
			.attr('fill', LINE_COLOR)
			.attr('stroke', 'white')
			.attr('stroke-width', 2)
			.transition()
			.delay(700)
			.duration(300)
			.attr('r', 5);

		// Value labels above dots
		g.selectAll<SVGTextElement, { year: number; value: number }>('text.val')
			.data(data)
			.join('text')
			.attr('class', 'val')
			.attr('x', (d) => xScale(d.year))
			.attr('y', (d) => yScale(d.value) - 12)
			.attr('text-anchor', 'middle')
			.attr('fill', LABEL_COLOR)
			.attr('font-size', '12px')
			.attr('font-weight', '600')
			.attr('opacity', 0)
			.text((d) => d.value.toLocaleString())
			.transition()
			.delay(900)
			.duration(300)
			.attr('opacity', 1);

		// X Axis
		g.append('g')
			.attr('transform', `translate(0,${innerH})`)
			.call(
				d3
					.axisBottom(xScale)
					.ticks(data.length)
					.tickFormat((d) => String(d))
					.tickSize(0)
			)
			.call((sel) => {
				sel.select('.domain').attr('stroke', AXIS_COLOR);
				sel
					.selectAll('text')
					.attr('fill', LABEL_COLOR)
					.attr('font-size', '13px')
					.attr('dy', '1.4em');
			});

		// Y Axis
		g.append('g')
			.call(
				d3
					.axisLeft(yScale)
					.ticks(6)
					.tickFormat((d) => d.toLocaleString())
			)
			.call((sel) => {
				sel.select('.domain').attr('stroke', AXIS_COLOR);
				sel.selectAll('.tick line').attr('stroke', AXIS_COLOR);
				sel.selectAll('text').attr('fill', LABEL_COLOR).attr('font-size', '13px');
			});

		// Chart title
		g.append('text')
			.attr('x', innerW / 2)
			.attr('y', -16)
			.attr('text-anchor', 'middle')
			.attr('fill', LABEL_COLOR)
			.attr('font-size', '16px')
			.attr('font-weight', '700')
			.text(`${tempDataTimeSeries.country} — Year-over-Year`);

		// Y-axis label
		g.append('text')
			.attr('transform', 'rotate(-90)')
			.attr('x', -innerH / 2)
			.attr('y', -60)
			.attr('text-anchor', 'middle')
			.attr('fill', LABEL_COLOR)
			.attr('font-size', '13px')
			.text('Value');
	}

	// Toggle country selection
	function toggleCountry(name: string) {
		const newSet = new Set(selectedCountries);
		if (newSet.has(name)) {
			newSet.delete(name);
		} else {
			newSet.add(name);
		}
		selectedCountries = newSet;
	}
</script>

<div class="graphWindow">
	<div class="graphContainer" bind:this={containerEl}>
		<div class="content">
			<!-- Chart -->
			<svg bind:this={svgEl}></svg>

			<!-- Checkbox list (only show in bar view) -->
			{#if view === 'bar'}
				<div class="sidebar">
					<h3>Countries</h3>
					<div class="checkboxList">
						{#each allCountries as country (country.name)}
							<label class="checkboxItem">
								<input
									type="checkbox"
									checked={selectedCountries.has(country.name)}
									onchange={() => toggleCountry(country.name)}
								/>
								<span>{country.name}</span>
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
		/* position: absolute; */
		width: 100%;
		height: 100%;
		/* z-index: 40; */
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.graphContainer {
		width: 100%;
		height: 100%;
		border-radius: 8px;
		background-color: white;
		box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.content {
		display: flex;
		flex: 1;
		overflow: hidden;
	}

	svg {
		flex: 1;
		width: 100%;
	}

	.sidebar {
		width: 180px;
		border-left: 1px solid #e5e7eb;
		padding: 16px;
		overflow-y: auto;
		background: #fafbfc;
	}

	.sidebar h3 {
		margin: 0 0 12px 0;
		font-size: 13px;
		font-weight: 700;
		color: #374151;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.checkboxList {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.checkboxItem {
		display: flex;
		align-items: center;
		gap: 8px;
		cursor: pointer;
		padding: 6px 8px;
		border-radius: 4px;
		transition: background 0.15s ease;
		user-select: none;
	}

	.checkboxItem:hover {
		background: #e5e7eb;
	}

	.checkboxItem input {
		cursor: pointer;
		accent-color: #4f8ef7;
	}

	.checkboxItem span {
		font-size: 13px;
		color: #374151;
		font-weight: 500;
	}

	.checkboxItem input:checked + span {
		color: #4f8ef7;
		font-weight: 600;
	}

	/* Scrollbar styling */
	.sidebar::-webkit-scrollbar {
		width: 6px;
	}

	.sidebar::-webkit-scrollbar-track {
		background: transparent;
	}

	.sidebar::-webkit-scrollbar-thumb {
		background: #d1d5db;
		border-radius: 3px;
	}

	.sidebar::-webkit-scrollbar-thumb:hover {
		background: #9ca3af;
	}
</style>
