<script lang="ts">
	import { ChartBarHorizontalIcon, MapTrifoldIcon, TrendUpIcon } from 'phosphor-svelte';
	import Graph from '../graph/graph.svelte';

	let selectedTopic = $state('Annual Visitors');
	let selectedOption = $state(0);
	// type ViewMode = 'bar' | 'line' | 'map';

	const options = [
		{
			icon: TrendUpIcon,
			text: 'Trend',
			value: 'line'
		},
		{
			icon: ChartBarHorizontalIcon,
			text: 'Compare',
			value: 'bar'
		},
		{
			icon: MapTrifoldIcon,
			text: 'Map',
			value: 'bar'
		}
	];
	let selectedView = $derived(options[selectedOption].value);

	const availableRange = [2019, 2020, 2024, 2025, 2026];
</script>

<div class="container">
	<div class="header">
		<div>
			<div class="badge">Analysis Mode</div>
			<div class="topic">{selectedTopic}</div>
			<div class="search"></div>
		</div>
		<div>
			<button>Close</button>
		</div>
	</div>
	<hr />
	<div class="options">
		{#each options as option, index}
			<button
				class="option"
				class:selected={selectedOption === index}
				onclick={() => (selectedOption = index)}
			>
				<option.icon size={18} />
				<span>{option.text}</span>
			</button>
		{/each}
	</div>
	<hr />

	<div class="display">
		<Graph {selectedView} />
	</div>
	<hr />

	<div class="time-slider">
		<button>{'<'}</button>
		<button>Play</button>
		<div>{availableRange[0]}</div>
		<input
			type="range"
			name="year"
			id="year"
			min={availableRange[0]}
			max={availableRange[availableRange.length - 1]}
		/>
		<div>{availableRange[availableRange.length - 1]}</div>
		<button>{'>'}</button>
	</div>
</div>

<style>
	.display {
		height: 100%;
	}
	.header {
		padding: 16px 12px;
		justify-content: space-between;
		font-size: 24px;
	}
	.header,
	.header > div {
		display: inline-flex;
		align-items: center;
		gap: 16px;
	}
	.container {
		display: flex;
		flex-direction: column;
		min-width: 0;
		height: 100%;
		flex: 1;
	}

	hr {
		margin: 0;
		padding: 0;
		border: 1px gainsboro solid;
		width: 100%;
	}
	button {
		background: none;
		color: inherit;
		border: none;
		padding: 0;
		font: inherit;
		cursor: pointer;
		outline: inherit;
		appearance: none;
	}

	.selected {
		background-color: #eeeeee;
	}
	.options {
		display: flex;

		padding: 16px 12px;
		gap: 8px;
	}

	.option {
		/* all: unset; */
		cursor: pointer;
		display: inline-flex;
		align-items: center;
		gap: 8px;
		padding: 8px 12px;
		border-radius: 12px;
	}

	.option:hover {
		background-color: #f0f0f0;
	}

	.time-slider {
		display: flex;
		gap: 24px;
		justify-content: space-between;
		padding-inline: 4rem;
		padding-block: 1rem;
	}

	.time-slider input {
		flex: 1;
	}
</style>
