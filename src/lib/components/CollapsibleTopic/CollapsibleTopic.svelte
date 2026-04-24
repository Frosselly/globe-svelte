<script>
	import { CaretDownIcon, CaretUpIcon } from 'phosphor-svelte';

	let { topicName, children } = $props();
	let isOpen = $state(true);

	function toggleOpen() {
		isOpen = !isOpen;
	}
</script>

<div>
	<div class="toggleTopic" onclick={toggleOpen}>
		<div class="between">
			<h2>{topicName}</h2>
			<div class="icon" class:rotated={isOpen}>
				{#if isOpen}
					<CaretUpIcon size={20} />
				{:else}
					<CaretDownIcon size={20} />
				{/if}
			</div>
		</div>
		<hr />
	</div>
	<div class="content" class:open={isOpen}>
		{@render children()}
	</div>
</div>

<style>
	.toggleTopic {
		cursor: pointer;
		user-select: none;
	}

	.toggleTopic h2 {
		margin: 0;
	}

	.between {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.icon {
		transition: transform 0.1s ease-in-out;
	}

	.icon.rotated {
		transform: rotate(180deg);
	}

	.content {
		max-height: 0;
		opacity: 0;
		overflow: hidden;
		transition:
			max-height 0.1s ease-in-out,
			opacity 0.1s ease-in-out;
	}

	.content.open {
		max-height: 100%;
		opacity: 1;
	}
</style>
