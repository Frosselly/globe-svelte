<script>
	import CaretUpIcon from 'phosphor-svelte/lib/CaretUpIcon';
	// import CaretDownIcon from 'phosphor-svelte/lib/CaretDownIcon';

	let { topicName, Icon, bgColor, children } = $props();
	let isOpen = $state(false);

	function toggleOpen() {
		isOpen = !isOpen;
	}
</script>

<div>
	<button class="toggleTopic" onclick={toggleOpen}>
		<div class="between topicTitle">
			<div class="flex-row align-center">
				<div class="topicIcon flex-row align-center" style="background: {bgColor}">
					<Icon size="24" />
				</div>
				<h2>{topicName}</h2>
			</div>
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
	</button>
	<div class="content" class:open={isOpen}>
		{@render children()}
	</div>
</div>

<style>
	.topicIcon {
		padding: 8px;
		border-radius: 8px;
	}
	button {
		all: unset;
	}
	.topicTitle {
		border-radius: 12px;
		padding: 0.8rem;
	}
	.toggleTopic {
		cursor: pointer;
		user-select: none;
		width: 100%;
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
