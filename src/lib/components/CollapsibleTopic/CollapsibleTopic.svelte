<script>
	import CaretUpIcon from 'phosphor-svelte/lib/CaretUpIcon';
	import CaretDownIcon from 'phosphor-svelte/lib/CaretDownIcon';

	let { topicName, bgColor, children } = $props();
	let isOpen = $state(false);

	function toggleOpen() {
		isOpen = !isOpen;
	}
</script>

<div>
	<div class="toggleTopic" onclick={toggleOpen}>
		<div class="between topicTitle" style="background: {bgColor}">
			<h2>{topicName}</h2>
			<div class="icon" class:rotated={isOpen}>
				<CaretUpIcon size={20} />
				<!-- {#if isOpen}
				{:else}
					<CaretDownIcon size={20} />
				{/if} -->
			</div>
		</div>
		{#if isOpen}
			<hr />
		{/if}
	</div>
	<div class="content" class:open={isOpen}>
		{@render children()}
	</div>
</div>

<style>
	.topicTitle {
		border-radius: 12px;
		padding: 0.8rem;
	}
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
