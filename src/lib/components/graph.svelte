<script>
	import { TrendDownIcon, TrendUpIcon } from 'phosphor-svelte';

	const props = $props();
</script>

{#if props.sign === '+'}
	<span class="text-green">
		<TrendUpIcon size={16} />
		{props.trend}
	</span>
{:else}
	<span class="text-red">
		<TrendDownIcon size={16} />
		{props.trend}
	</span>
{/if}

<style>
	.text-green {
		color: #4caf50;
	}
	.text-red {
		color: #f44336;
	}
</style>
