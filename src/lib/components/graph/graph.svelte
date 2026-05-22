<script lang="ts">
	/**
	 * Props:
	 *   view              'bar' | 'line'
	 *   option            AnalysisOption
	 *   rows              { iso2, name, value }[]  — all countries, server-fetched
	 *   history           { year, value }[] | null — selected country time series
	 *   selectedIso2      currently selected country (from URL ?country=)
	 *   onSelectCountry   called when user clicks a country name → parent sets ?country=&view=line
	 *   onSelectionChange called whenever the checkbox set changes → parent tracks for save
	 */

	import * as d3 from 'd3';
	import { formatLargeNumbers } from '$lib/core/utils/utils';
	import type { AnalysisOption } from '$lib/assets/analysisOptions';

	type Row = { iso2: string; name: string; value: number | null };
	type HistPt = { year: number; value: number };

	const {
		view,
		option,
		rows,
		history,
		selectedIso2 = null as string | null,
		onSelectCountry,
		onSelectionChange
	} = $props<{
		view: 'bar' | 'line';
		option: AnalysisOption;
		rows: Row[];
		history: HistPt[] | null;
		selectedIso2?: string | null;
		onSelectCountry?: (iso2: string) => void;
		onSelectionChange?: (iso2s: string[]) => void;
	}>();

	// -- Data prep -------------

	const validRows = $derived(
		(rows ?? [])
			.filter((r): r is Row & { value: number } => r.value !== null)
			.sort((a, b) => b.value - a.value)
	);

	const selectedCountryName = $derived(
		validRows.find((r) => r.iso2 === selectedIso2)?.name ?? null
	);

	const defaultNames = $derived(
		new Set([
			...validRows.slice(0, 5).map((r) => r.name),
			...(selectedCountryName ? [selectedCountryName] : [])
		])
	);

	let userNames = $state<Set<string> | null>(null);

	let prevValidKey = $state('');
	$effect(() => {
		const key = validRows.map((r) => r.iso2).join(',');
		if (key !== prevValidKey) {
			prevValidKey = key;
			userNames = null;
		}
	});

	const selectedNames = $derived(userNames ?? defaultNames);
	const filteredRows = $derived(validRows.filter((r) => selectedNames.has(r.name)));

	$effect(() => {
		const iso2s = validRows.filter((r) => selectedNames.has(r.name)).map((r) => r.iso2);
		onSelectionChange(iso2s);
	});

	function toggleCountry(row: Row & { value: number }) {
		const s = new Set(selectedNames);
		s.has(row.name) ? s.delete(row.name) : s.add(row.name);
		userNames = s;
	}

	function selectAll() {
		userNames = new Set(validRows.map((r) => r.name));
	}

	// -- SVG dimensions --------

	let containerEl = $state<HTMLDivElement | null>(null);
	let svgEl = $state<SVGSVGElement | null>(null);
	let W = $state(600);
	let H = $state(400);
	const margin = { top: 40, right: 220, bottom: 60, left: 110 };
	const iW = $derived(Math.max(W - margin.left - margin.right, 1));
	const iH = $derived(Math.max(H - margin.top - margin.bottom, 1));

	$effect(() => {
		if (!containerEl) return;
		const ro = new ResizeObserver((entries) => {
			W = Math.max(entries[0].contentRect.width, 1);
			H = Math.max(entries[0].contentRect.height, 1);
		});
		ro.observe(containerEl);
		return () => ro.disconnect();
	});

	// -- Colours ---------------

	const BAR_COLOR = '#4f8ef7';
	const SELECTED_BAR_COLOR = '#f7694f';
	const LINE_COLOR = '#f7694f';
	const AXIS_COLOR = '#555';
	const GRID_COLOR = '#e5e7eb';
	const LABEL_COLOR = '#374151';
	const DOT_HOVER_COLOR = '#c0392b';

	// -- Draw ------------------

	$effect(() => {
		if (!svgEl) return;
		view;
		option;
		filteredRows;
		history;
		W;
		H;
		view === 'bar' ? drawBar() : drawLine();
	});

	function clear() {
		if (svgEl) d3.select(svgEl).selectAll('*').remove();
	}

	function makeG() {
		return d3
			.select(svgEl)
			.attr('width', W)
			.attr('height', H)
			.append('g')
			.attr('transform', `translate(${margin.left},${margin.top})`);
	}

	function fmtVal(v: number) {
		if (option.format === 'percent') return `${v.toFixed(1)}%`;
		if (option.format === 'rank') return `#${Math.round(v)}`;
		return formatLargeNumbers(v);
	}

	// -- Bar chart -------------

	function drawBar() {
		clear();
		const g = makeG();
		const data = filteredRows;

		if (!data.length) {
			g.append('text')
				.attr('x', iW / 2)
				.attr('y', iH / 2)
				.attr('text-anchor', 'middle')
				.attr('fill', '#9ca3af')
				.attr('font-size', 14)
				.text('Select countries in the list →');
			return;
		}

		const x = d3
			.scaleLinear()
			.domain([0, d3.max(data, (d) => d.value)! * 1.15])
			.range([0, iW]);
		const y = d3
			.scaleBand()
			.domain(data.map((d) => d.name))
			.range([0, iH])
			.padding(0.35);

		// Grid
		g.append('g')
			.call(
				d3
					.axisBottom(x)
					.tickSize(iH)
					.tickFormat(() => '')
			)
			.call((s) => s.select('.domain').remove())
			.selectAll('line')
			.attr('stroke', GRID_COLOR)
			.attr('stroke-dasharray', '4,3');

		// Bars
		g.selectAll<SVGRectElement, (typeof data)[0]>('rect.bar')
			.data(data, (d) => d.name)
			.join(
				(e) =>
					e
						.append('rect')
						.attr('class', 'bar')
						.attr('y', (d) => y(d.name)!)
						.attr('height', y.bandwidth())
						.attr('x', 0)
						.attr('width', 0)
						.attr('rx', 4)
						.attr('fill', (d) => (d.name === selectedCountryName ? SELECTED_BAR_COLOR : BAR_COLOR))
						.attr('opacity', (d) => (d.name === selectedCountryName ? 1 : 0.88)),
				(u) =>
					u
						.attr('fill', (d) => (d.name === selectedCountryName ? SELECTED_BAR_COLOR : BAR_COLOR))
						.attr('opacity', (d) => (d.name === selectedCountryName ? 1 : 0.88)),
				(x) => x.remove()
			)
			.transition()
			.duration(600)
			.ease(d3.easeCubicOut)
			.attr('width', (d) => x(d.value));

		// Value labels
		g.selectAll<SVGTextElement, (typeof data)[0]>('text.val')
			.data(data, (d) => d.name)
			.join(
				(e) =>
					e
						.append('text')
						.attr('class', 'val')
						.attr('y', (d) => y(d.name)! + y.bandwidth() / 2)
						.attr('dy', '0.35em')
						.attr('opacity', 0),
				(u) => u,
				(x) => x.remove()
			)
			.transition()
			.delay(400)
			.duration(300)
			.attr('opacity', 1)
			.attr('x', (d) => (x(d.value) > 80 ? 8 : x(d.value) + 8))
			.attr('fill', (d) => (x(d.value) > 80 ? '#fff' : LABEL_COLOR))
			.attr('text-anchor', 'start')
			.attr('font-size', 12)
			.attr('font-weight', 600)
			.text((d) => fmtVal(d.value));

		// Axes
		g.append('g')
			.call(d3.axisLeft(y).tickSize(0))
			.call((s) => {
				s.select('.domain').attr('stroke', AXIS_COLOR);
				s.selectAll('text')
					.attr('fill', LABEL_COLOR)
					.attr('font-size', 12)
					.attr('text-anchor', 'end')
					.attr('dx', '-8px');
			});
		g.append('g')
			.attr('transform', `translate(0,${iH})`)
			.call(
				d3
					.axisBottom(x)
					.ticks(5)
					.tickFormat((d) => formatLargeNumbers(+d))
			)
			.call((s) => {
				s.select('.domain').attr('stroke', AXIS_COLOR);
				s.selectAll('text').attr('fill', LABEL_COLOR).attr('font-size', 12).attr('dy', '1.4em');
			});

		g.append('text')
			.attr('x', iW / 2)
			.attr('y', -16)
			.attr('text-anchor', 'middle')
			.attr('fill', LABEL_COLOR)
			.attr('font-size', 14)
			.attr('font-weight', 700)
			.text(`${option.label} by Country`);
	}

	// -- Line chart ------------

	function drawLine() {
		clear();
		const g = makeG();

		if (!history?.length) {
			g.append('text')
				.attr('x', iW / 2)
				.attr('y', iH / 2)
				.attr('text-anchor', 'middle')
				.attr('fill', '#9ca3af')
				.attr('font-size', 14)
				.text(
					selectedCountryName
						? `No time-series data for ${selectedCountryName}`
						: 'Click a country name in the list to view its trend'
				);
			return;
		}

		const data = [...history].sort((a, b) => a.year - b.year);
		const x = d3
			.scaleLinear()
			.domain(d3.extent(data, (d) => d.year) as [number, number])
			.range([0, iW]);
		const y = d3
			.scaleLinear()
			.domain([0, d3.max(data, (d) => d.value)! * 1.15])
			.nice()
			.range([iH, 0]);

		// Grid
		g.append('g')
			.call(
				d3
					.axisLeft(y)
					.tickSize(-iW)
					.tickFormat(() => '')
			)
			.call((s) => s.select('.domain').remove())
			.selectAll('line')
			.attr('stroke', GRID_COLOR)
			.attr('stroke-dasharray', '4,3');

		// Area
		const area = d3
			.area<HistPt>()
			.x((d) => x(d.year))
			.y0(iH)
			.y1((d) => y(d.value))
			.curve(d3.curveMonotoneX);
		g.append('path').datum(data).attr('fill', LINE_COLOR).attr('opacity', 0.1).attr('d', area);

		// Line
		const line = d3
			.line<HistPt>()
			.x((d) => x(d.year))
			.y((d) => y(d.value))
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

		// Dots
		g.selectAll<SVGCircleElement, HistPt>('circle.dot')
			.data(data)
			.join('circle')
			.attr('class', 'dot')
			.attr('cx', (d) => x(d.year))
			.attr('cy', (d) => y(d.value))
			.attr('r', 0)
			.attr('fill', LINE_COLOR)
			.attr('stroke', '#fff')
			.attr('stroke-width', 2)
			.transition()
			.delay(700)
			.duration(300)
			.attr('r', 5);

		// Hover label
		const lbl = g
			.append('text')
			.attr('class', 'hover-label')
			.attr('text-anchor', 'middle')
			.attr('font-size', 12)
			.attr('font-weight', 700)
			.attr('fill', LABEL_COLOR)
			.attr('opacity', 0)
			.attr('pointer-events', 'none');

		// Hit targets
		g.selectAll<SVGCircleElement, HistPt>('circle.hit')
			.data(data)
			.join('circle')
			.attr('class', 'hit')
			.attr('cx', (d) => x(d.year))
			.attr('cy', (d) => y(d.value))
			.attr('r', 14)
			.attr('fill', 'transparent')
			.on('mouseenter', function (_, d) {
				d3.select(this.parentNode as any)
					.selectAll<SVGCircleElement, HistPt>('circle.dot')
					.filter((c) => c.year === d.year)
					.attr('fill', DOT_HOVER_COLOR)
					.attr('r', 7);
				lbl
					.attr('x', x(d.year))
					.attr('y', y(d.value) - 14)
					.text(fmtVal(d.value))
					.attr('opacity', 1);
			})
			.on('mouseleave', function (_, d) {
				d3.select(this.parentNode as any)
					.selectAll<SVGCircleElement, HistPt>('circle.dot')
					.filter((c) => c.year === d.year)
					.attr('fill', LINE_COLOR)
					.attr('r', 5);
				lbl.attr('opacity', 0);
			});

		// X axis
		const step = data.length > 10 ? 3 : 2;
		const ticks = data.map((d) => d.year).filter((_, i) => i % step === 0 || i === data.length - 1);
		g.append('g')
			.attr('transform', `translate(0,${iH})`)
			.call(
				d3
					.axisBottom(x)
					.tickValues(ticks)
					.tickFormat((d) => String(d))
					.tickSize(0)
			)
			.call((s) => {
				s.select('.domain').attr('stroke', AXIS_COLOR);
				s.selectAll('text').attr('fill', LABEL_COLOR).attr('font-size', 12).attr('dy', '1.4em');
			});

		// Y axis
		g.append('g')
			.call(
				d3
					.axisLeft(y)
					.ticks(5)
					.tickFormat((d) => formatLargeNumbers(+d))
			)
			.call((s) => {
				s.select('.domain').attr('stroke', AXIS_COLOR);
				s.selectAll('text').attr('fill', LABEL_COLOR).attr('font-size', 12);
			});

		g.append('text')
			.attr('x', iW / 2)
			.attr('y', -16)
			.attr('text-anchor', 'middle')
			.attr('fill', LABEL_COLOR)
			.attr('font-size', 14)
			.attr('font-weight', 700)
			.text(`${selectedCountryName ?? '—'} — ${option.label}`);
	}
</script>

<div class="graphWindow">
	<div class="graphContainer" bind:this={containerEl}>
		<div class="content">
			<svg bind:this={svgEl}></svg>

			<!-- Country list (bar mode)  -->
			<div class="sidebar">
				<div class="sidebar-header">
					<h3>Countries</h3>
					<div class="sidebar-actions">
						<button onclick={selectAll}>All</button>
						<button onclick={() => onSelectionChange('')}>None</button>
					</div>
				</div>
				<div class="checkboxList">
					{#each validRows as row (row.iso2)}
						<label class="checkboxItem" class:is-line-selected={row.iso2 === selectedIso2}>
							<input
								type="checkbox"
								checked={selectedNames.has(row.name)}
								onchange={() => toggleCountry(row)}
							/>
							<!-- Clicking the name navigates to line view for that country -->
							<button
								class="country-name-btn"
								onclick={() => onSelectCountry(row.iso2)}
								title="View trend for {row.name}">{row.name}</button
							>
							<span class="country-val">{fmtVal(row.value!)}</span>
						</label>
					{/each}
				</div>
			</div>
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
		background: var(--color-background);
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
		flex-shrink: 0;
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
		background: var(--color-background);
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
		gap: 6px;
		padding: 5px 6px;
		border-radius: 5px;
		user-select: none;
	}
	.checkboxItem:hover {
		background: #efefef;
	}
	.checkboxItem.is-line-selected {
		background: #fff7ed;
	}
	.checkboxItem input {
		cursor: pointer;
		accent-color: #4f8ef7;
		flex-shrink: 0;
	}

	.country-name-btn {
		flex: 1;
		font-size: 12px;
		color: #374151;
		font-weight: 500;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		background: none;
		border: none;
		cursor: pointer;
		text-align: left;
		padding: 0;
	}
	.country-name-btn:hover {
		color: #f7694f;
		text-decoration: underline;
	}
	.is-line-selected .country-name-btn {
		color: #f7694f;
		font-weight: 700;
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
	.checkboxList::-webkit-scrollbar-thumb {
		background: #d1d5db;
		border-radius: 2px;
	}
</style>
