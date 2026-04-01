<script lang="ts">
	import { onMount } from 'svelte';
	import * as d3 from 'd3';
	import * as Plot from '@observablehq/plot';

	type Message = { from: 'user' | 'bot'; text: string };
	type TV = { date: string; value: number | null };
	type SeriesRow = { country: string; code?: string; series: TV[] };

	let messages: Message[] = $state([]);
	let input = $state('');
	let indicatorName = $state('');
	let seriesData: SeriesRow[] = [];
	let loading = $state(false);
	let expanded = $state(true);

	function toggleExpand() {
		expanded = !expanded;
		// after expanding, redraw chart to fit new size
		console.log('Toggling expand, now expanded:', expanded);
		setTimeout(() => drawChart(), 120);
	}

	onMount(() => {
		messages = [
			{
				from: 'bot',
				text: 'Hi — ask something like "Germany population" or "compare Germany and France population".'
			}
		];
	});

	function addMessage(from: Message['from'], text: string) {
		messages = [...messages, { from, text }];
		// keep scroll at bottom after DOM updates
		setTimeout(() => {
			const el = document.querySelector('.messages');
			if (el) el.scrollTop = el.scrollHeight;
		}, 50);
	}

	function testChart() {
		seriesData = [
			{
				country: 'Germany',
				series: [
					{ date: '2000', value: 82211508 },
					{ date: '2001', value: 82349925 },
					{ date: '2002', value: 82488495 },
					{ date: '2003', value: 82534176 },
					{ date: '2004', value: 82516260 },
					{ date: '2005', value: 82469422 },
					{ date: '2006', value: 82376451 },
					{ date: '2007', value: 82266372 },
					{ date: '2008', value: 82110097 },
					{ date: '2009', value: 81902307 },
					{ date: '2010', value: 81776930 },
					{ date: '2011', value: 80274983 },
					{ date: '2012', value: 80425823 },
					{ date: '2013', value: 80645605 },
					{ date: '2014', value: 80982500 },
					{ date: '2015', value: 81686611 },
					{ date: '2016', value: 82348669 },
					{ date: '2017', value: 82657002 },
					{ date: '2018', value: 82905782 },
					{ date: '2019', value: 83092962 },
					{ date: '2020', value: 83160871 },
					{ date: '2021', value: 83196078 },
					{ date: '2022', value: 83177813 },
					{ date: '2023', value: 83287273 }
				]
			},
			{
				country: 'France',
				series: [
					{ date: '2000', value: 59225709 },
					{ date: '2001', value: 59375709 },
					{ date: '2002', value: 59525709 },
					{ date: '2003', value: 59675709 },

					{ date: '2004', value: 59825709 },
					{ date: '2005', value: 59975709 },
					{ date: '2006', value: 60125709 },
					{ date: '2007', value: 60275709 },
					{ date: '2008', value: 60425709 },
					{ date: '2009', value: 60575709 },
					{ date: '2010', value: 60725709 },
					{ date: '2011', value: 60875709 },
					{ date: '2012', value: 61025709 },
					{ date: '2013', value: 61175709 },
					{ date: '2014', value: 61325709 },
					{ date: '2015', value: 61475709 },
					{ date: '2016', value: 61625709 },
					{ date: '2017', value: 61775709 },
					{ date: '2018', value: 61925709 },
					{ date: '2019', value: 62075709 },
					{ date: '2020', value: 62225709 },
					{ date: '2021', value: 62375709 },
					{ date: '2022', value: 62525709 },
					{ date: '2023', value: 62675709 }
				]
			}
		];
		// drawChart();
		drawChartOld();
	}
	$effect(() => {
		expanded;
		testChart();
	});

	// removed autoGrow: using single-line input now

	async function handleSend() {
		const prompt = input.trim();
		if (!prompt) return;
		addMessage('user', prompt);
		input = '';
		loading = true;
		try {
			const res = await fetch('/api/query', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ prompt })
			});
			let data: any = null;
			try {
				data = await res.json();
			} catch (e) {
				addMessage(
					'bot',
					`Server returned an unexpected response (${res.status} ${res.statusText})`
				);
				loading = false;
				return;
			}

			if (!res.ok) {
				addMessage('bot', 'Server error: ' + (data?.error || res.statusText));
				loading = false;
				return;
			}

			if (data.error) {
				addMessage('bot', 'Server error: ' + data.error);
				loading = false;
				return;
			}

			indicatorName = data.indicator || '';
			seriesData = data.series || [];
			addMessage(
				'bot',
				`Showing ${indicatorName} — ${seriesData.map((s) => s.country).join(', ')}`
			);
			drawChart();
		} catch (err) {
			console.error(err);
			addMessage('bot', 'Failed to fetch data from the server.');
		}
		loading = false;
	}
	function drawChart() {
		drawChartOld();
		// drawChartNew();
	}

	function drawChartOld() {
		const container = document.getElementById('chart');
		if (!container) return;
		container.innerHTML = '';

		const margin = { top: 18, right: 80, bottom: 40, left: 60 };
		const width = Math.max(320, container.clientWidth) - margin.left - margin.right;
		const height = 320 - margin.top - margin.bottom;

		const svg = d3
			.select(container)
			.append('svg')
			.attr('width', width + margin.left + margin.right)
			.attr('height', height + margin.top + margin.bottom)
			.style('font-family', 'system-ui, Roboto, Arial')
			.style('background', 'transparent');

		const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

		const all = seriesData.flatMap((d) =>
			d.series
				.filter((s) => s.value !== null)
				.map((s) => ({ date: +s.date, value: s.value as number }))
		);
		if (all.length === 0) {
			g.append('text').attr('x', 10).attr('y', 20).text('No data available for selection');
			return;
		}

		const xDomain = d3.extent(all, (d) => d.date) as [number, number];
		const x = d3.scaleLinear().domain([xDomain[0], xDomain[1]]).range([0, width]);

		const yMin = d3.min(all, (d) => d.value) as number;
		const yMax = d3.max(all, (d) => d.value) as number;
		const y = d3
			.scaleLinear()
			.domain([yMin * 0.9, yMax * 1.1])
			.nice()
			.range([height, 0]);

		const xAxis = d3
			.axisBottom(x)
			.tickFormat(d3.format('d'))
			.ticks(Math.min(8, Math.max(3, xDomain[1] - xDomain[0])));
		const yAxis = d3.axisLeft(y).ticks(6);

		g.append('g').attr('transform', `translate(0,${height})`).call(xAxis);
		g.append('g').call(yAxis);

		const color = d3.scaleOrdinal(d3.schemeTableau10).domain(seriesData.map((s) => s.country));

		const line = d3
			.line<any>()
			.defined((d: any) => d.value !== null)
			.x((d: any) => x(+d.date))
			.y((d: any) => y(d.value));

		seriesData.forEach((s, i) => {
			const clean = s.series.map((d) => ({ date: +d.date, value: d.value }));
			g.append('path')
				.datum(clean)
				.attr('fill', 'none')
				.attr('stroke', color(s.country) as string)
				.attr('stroke-width', 2.5)
				.attr('d', line as any);

			g.selectAll(`.pt-${i}`)
				.data(clean.filter((d) => d.value !== null))
				.join('circle')
				.attr('class', `pt-${i}`)
				.attr('cx', (d: any) => x(d.date))
				.attr('cy', (d: any) => y(d.value))
				.attr('r', 3)
				.attr('fill', color(s.country) as string);

			// label at end
			const last = clean
				.slice()
				.reverse()
				.find((d) => d.value !== null);
			if (last) {
				g.append('text')
					.attr('x', x(last.date) + 6)
					.attr('y', y(last.value))
					.attr('fill', color(s.country) as string)
					.attr('font-size', 12)
					.text(s.country);
			}
		});
	}

	function drawChartNew() {
		const container = document.getElementById('chart');
		if (!container) return;
		container.innerHTML = '';

		const plot = Plot.plot({
			marginRight: 100, // make room for longer country names
			marginBottom: 44,
			marginLeft: 80,
			grid: true,
			x: { ticks: 5 },
			y: { ticks: 7, nice: true, label: null },
			color: { scheme: 'tableau10' },
			marks: [
				// Flatten once → tidy form on the fly
				Plot.line(
					seriesData.flatMap((s) =>
						s.series.map((pt) => ({
							country: s.country,
							date: new Date(pt.date), // or +pt.date if numeric year
							value: pt.value
						}))
					),
					{
						x: 'date',
						y: 'value',
						z: 'country',
						stroke: 'country',
						curve: 'natural',
						marker: true
					}
				),

				// End labels
				Plot.text(
					seriesData.flatMap((s) => {
						const last = s.series[s.series.length - 1];
						if (!last || last.value == null) return [];
						return [
							{
								country: s.country,
								date: new Date(last.date),
								value: last.value
							}
						];
					}),
					{
						x: 'date',
						y: 'value',
						text: 'country',
						textAnchor: 'start',
						dx: 9,
						dy: 0,
						fontSize: 11.5
					}
				)
			]
		});
		container.appendChild(plot);
	}
</script>

<div class="chat-overlay">
	<div class="chat-card" class:expanded>
		<header class="chat-header">
			<div class="title">Data Chat</div>
			<div class="subtitle">Example UI — posts prompt to /api/query and renders a chart</div>
			<button class="expand" aria-pressed={expanded} onclick={toggleExpand}
				>{expanded ? '⤫' : '⤢'}</button
			>
		</header>

		<main class="chat-body">
			<div class="messages" aria-live="polite">
				{#each messages as m, i}
					<div class="msg {m.from}">{m.text}</div>
				{/each}
			</div>

			<div class="controls">
				<input
					id="chat-input"
					placeholder="Type a request (e.g. Germany population)"
					bind:value={input}
					onkeydown={(e) => e.key === 'Enter' && handleSend()}
				/>
				<div class="actions">
					<button onclick={handleSend} disabled={loading}>{loading ? 'Loading…' : 'Send'}</button>
				</div>
				<div class="row indicator-row">
					<label>Indicator</label>
					<input id="ind-display" readonly value={indicatorName || 'None selected'} />
				</div>
			</div>

			<div id="chart" class="chart" />
			<div class="source">Source: mock data (dev)</div>
		</main>
	</div>
</div>

<style>
	.chat-overlay {
		position: absolute;
		inset: 0;
		pointer-events: none;
	}
	.chat-card {
		pointer-events: auto;
		position: fixed;
		right: 1.5rem;
		bottom: 1.5rem;
		width: min(640px, 96%);
		max-width: 640px;
		max-height: calc(100vh - 3rem);
		display: flex;
		flex-direction: column;
		background: #0f1724;
		color: #e6eef8;
		border-radius: 12px;
		box-shadow: 0 12px 30px rgba(2, 6, 23, 0.6);
		overflow: hidden;
	}
	/* prevent children from growing past container bounds */
	.chat-card *,
	.chat-card *::before,
	.chat-card *::after {
		box-sizing: border-box;
	}

	/* allow flex children to shrink inside narrow containers */
	.chat-body,
	.controls,
	.messages,
	.indicator-row {
		min-width: 0;
	}
	.chat-card.expanded {
		width: 90vw;
		max-width: 1200px;
		left: 5vw;
		right: 5vw;
		top: 5vh;
		bottom: 5vh;
		max-height: 90vh;
		border-radius: 10px;
		transform: none;
	}
	.chat-header {
		padding: 14px 16px;
		border-bottom: 1px solid rgba(255, 255, 255, 0.04);
	}
	.title {
		font-weight: 700;
		font-size: 1.05rem;
	}
	.subtitle {
		font-size: 0.85rem;
		margin-top: 6px;
		color: #bcd3ee;
	}
	.chat-body {
		padding: 12px;
		display: flex;
		flex-direction: column;
		gap: 12px;
		flex: 1 1 auto;
		overflow: hidden;
	}
	.messages {
		max-height: 180px;
		overflow: auto;
		background: rgba(255, 255, 255, 0.02);
		padding: 12px;
		border-radius: 8px;
		flex: 0 0 auto;
	}
	.chat-card.expanded .messages {
		max-height: 38vh;
	}
	.msg {
		padding: 8px 10px;
		margin-bottom: 6px;
		border-radius: 8px;
		max-width: 80%;
		word-break: break-word;
		white-space: pre-wrap;
	}
	.msg.user {
		background: linear-gradient(90deg, #0369a1, #0ea5e9);
		color: white;
		margin-left: auto;
	}
	.msg.bot {
		background: rgba(255, 255, 255, 0.03);
		color: #e6eef8;
	}
	.controls {
		display: flex;
		flex-direction: column;
		gap: 8px;
		align-items: stretch;
		flex: 0 0 auto;
	}
	input#chat-input {
		flex: 1;
		padding: 10px 12px;
		border-radius: 8px;
		border: 1px solid rgba(255, 255, 255, 0.06);
		background: rgba(255, 255, 255, 0.02);
		color: inherit;
		width: 100%;
	}
	.row {
		display: flex;
		gap: 8px;
		align-items: center;
	}
	input#ind-display {
		padding: 8px;
		border-radius: 6px;
		border: 1px solid rgba(255, 255, 255, 0.04);
		background: rgba(255, 255, 255, 0.02);
		color: inherit;
		width: 220px;
	}

	.indicator-row {
		display: flex;
		gap: 8px;
		align-items: center;
	}
	.indicator-row input#ind-display {
		width: 100%;
		max-width: 420px;
	}

	.chat-header {
		position: relative;
	}
	.chat-header .expand {
		position: absolute;
		right: 10px;
		top: 12px;
		background: transparent;
		border: none;
		color: #bcd3ee;
		cursor: pointer;
		font-size: 14px;
	}
	.actions {
		display: flex;
		gap: 8px;
	}
	button {
		background: #0ea5e9;
		border: none;
		color: white;
		padding: 8px 12px;
		border-radius: 8px;
		cursor: pointer;
	}
	.chart {
		margin-top: 4px;
		padding: 8px;
		background: rgba(255, 255, 255, 0.01);
		border-radius: 8px;
		flex: 1 1 auto;
		min-height: 180px;
		overflow: auto;
	}
	.source {
		margin-top: 6px;
		font-size: 0.8rem;
		color: rgba(255, 255, 255, 0.6);
	}
</style>
