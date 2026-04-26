<script>
	import TrendDownIcon from 'phosphor-svelte/lib/TrendDownIcon';
	import TrendUpIcon from 'phosphor-svelte/lib/TrendUpIcon';

	const props = $props();
	const sign = $derived(props.trend === 'increasing' || props.trend === 'growing' ? '+' : '-');
</script>

{#if sign === '+'}
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
