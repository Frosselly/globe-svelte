<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import * as d3 from 'd3';
	import { formatLargeNumbers } from '$lib/utils/utils';

	let { data }: { data: { year: number; value: number }[] } = $props();

	let container: HTMLDivElement;
	let resizeObserver: ResizeObserver;

	function draw() {
		if (!container || !data.length) return;

		const { width, height } = container.getBoundingClientRect();
		const margin = { top: 10, right: 10, bottom: 24, left: 40 };
		const innerWidth = width - margin.left - margin.right;
		const innerHeight = height - margin.top - margin.bottom;

		d3.select(container).select('svg').remove();

		const svg = d3.select(container).append('svg').attr('width', width).attr('height', height);

		const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

		const x = d3
			.scaleLinear()
			.domain(d3.extent(data, (d) => d.year) as [number, number])
			.range([0, innerWidth]);

		const y = d3
			.scaleLinear()
			.domain([d3.min(data, (d) => d.value)! * 0.95, d3.max(data, (d) => d.value)! * 1.05])
			.range([innerHeight, 0]);

		// Trend based on first two values
		const firstTwo = data.slice(0, 2);
		const trending =
			firstTwo.length === 2
				? firstTwo[firstTwo.length - 2].value >= firstTwo[firstTwo.length - 1].value
				: true;
		const color = trending ? '#22c55e' : '#dc2626';
		const colorLight = trending ? '#86efac' : '#fca5a5';

		// Axes
		g.append('g')
			.attr('transform', `translate(0,${innerHeight})`)
			.call(
				d3
					.axisBottom(x)
					.ticks(5)
					.tickFormat((d) => String(d))
			)
			.call((g) => g.select('.domain').remove())
			.call((g) => g.selectAll('.tick line').attr('stroke', '#e5e7eb'));

		g.append('g')
			.call(
				d3
					.axisLeft(y)
					.ticks(4)
					.tickFormat((d) => `${formatLargeNumbers(d)}`)
			)
			.call((g) => g.select('.domain').remove())
			.call((g) => g.selectAll('.tick line').attr('stroke', '#e5e7eb'));

		// Grid lines
		g.append('g')
			.selectAll('line')
			.data(y.ticks(4))
			.join('line')
			.attr('x1', 0)
			.attr('x2', innerWidth)
			.attr('y1', (d) => y(d))
			.attr('y2', (d) => y(d))
			.attr('stroke', '#f3f4f6')
			.attr('stroke-dasharray', '3,3');

		// Gradient fill
		const gradientId = `grad-${Math.random().toString(36).slice(2)}`;
		const defs = svg.append('defs');
		const gradient = defs
			.append('linearGradient')
			.attr('id', gradientId)
			.attr('x1', '0')
			.attr('y1', '0')
			.attr('x2', '0')
			.attr('y2', '1');
		gradient
			.append('stop')
			.attr('offset', '0%')
			.attr('stop-color', color)
			.attr('stop-opacity', 0.3);
		gradient
			.append('stop')
			.attr('offset', '100%')
			.attr('stop-color', colorLight)
			.attr('stop-opacity', 0);

		const area = d3
			.area<{ year: number; value: number }>()
			.x((d) => x(d.year))
			.y0(innerHeight)
			.y1((d) => y(d.value))
			.curve(d3.curveCatmullRom);

		g.append('path').datum(data).attr('fill', `url(#${gradientId})`).attr('d', area);

		// Line
		const line = d3
			.line<{ year: number; value: number }>()
			.x((d) => x(d.year))
			.y((d) => y(d.value))
			.curve(d3.curveCatmullRom);

		g.append('path')
			.datum(data)
			.attr('fill', 'none')
			.attr('stroke', color)
			.attr('stroke-width', 2)
			.attr('d', line);
	}

	onMount(() => {
		resizeObserver = new ResizeObserver(() => draw());
		resizeObserver.observe(container);
		draw();
	});

	onDestroy(() => resizeObserver?.disconnect());
</script>

<div bind:this={container} style="width: 100%; height: 100%;"></div>
