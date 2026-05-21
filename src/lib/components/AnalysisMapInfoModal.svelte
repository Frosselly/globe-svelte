<script lang="ts">
	import { fly } from 'svelte/transition';
	import { formatLargeNumbers } from '$lib/core/utils/utils';

	type Props = {
		countryName: string;
		labelName: string;
		value: string | number;
	};

	let { labelName, value, countryName }: Props = $props();
</script>

<div class="bubble-card" in:fly={{ y: 14, opacity: 0, duration: 280, easing: (t) => t * (2 - t) }}>
	<div class="col-flag">
		<div class="country-name">{countryName}</div>
		<!-- <div class="country-subtitle">◉ {countryName}</div> -->
	</div>

	<div class="col-stats">
		<div class="stat-row">
			<span class="stat-label">{labelName}</span>
			<span class="stat-value">
				{formatLargeNumbers(Number(value))}
			</span>
		</div>
	</div>
</div>

<style>
	:global(body) {
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
	}

	.bubble-card {
		position: relative;
		width: 100%;
		max-width: 360px;
		overflow: hidden;

		background: var(--color-background, #ffffff);
		border: 1px solid rgba(0, 0, 0, 0.08);
		border-radius: 26px;

		font-family: 'Sora', sans-serif;

		box-shadow:
			0 2px 10px rgba(0, 0, 0, 0.04),
			0 10px 30px rgba(0, 0, 0, 0.05);

		transition:
			transform 0.2s ease,
			box-shadow 0.2s ease,
			border-color 0.2s ease;
	}

	.bubble-card:hover {
		transform: translateY(-2px);
		border-color: rgba(0, 0, 0, 0.12);

		box-shadow:
			0 6px 18px rgba(0, 0, 0, 0.06),
			0 18px 40px rgba(0, 0, 0, 0.08);
	}

	/* Top section */

	.col-flag {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.45rem;

		padding: 1.75rem 1.5rem 1.4rem;

		background: linear-gradient(to bottom, rgba(245, 244, 240, 0.95), rgba(245, 244, 240, 0.72));

		border-bottom: 1px solid rgba(0, 0, 0, 0.06);
	}

	.country-name {
		font-size: 1.1rem;
		font-weight: 600;
		line-height: 1.2;
		letter-spacing: -0.03em;
		color: #161616;
		text-align: center;
	}

	.country-subtitle {
		display: flex;
		align-items: center;
		gap: 0.35rem;

		font-size: 0.72rem;
		font-family: 'DM Mono', monospace;
		font-weight: 500;
		letter-spacing: 0.08em;
		text-transform: uppercase;

		color: #7f7f7f;
	}

	/* Bottom section */

	.col-stats {
		padding: 1.15rem 1.4rem 1.3rem;
	}

	.stat-row {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 1rem;
	}

	.stat-label {
		font-size: 0.72rem;
		font-family: 'DM Mono', monospace;
		font-weight: 500;
		letter-spacing: 0.08em;
		text-transform: uppercase;

		color: #999;
	}

	.stat-value {
		font-size: 1rem;
		font-weight: 600;
		letter-spacing: -0.02em;
		line-height: 1;

		color: #111;
		text-align: right;
	}

	@media (max-width: 480px) {
		.bubble-card {
			max-width: 100%;
			border-radius: 22px;
		}

		.col-flag {
			padding: 1.5rem 1.2rem 1.2rem;
		}

		.col-stats {
			padding: 1rem 1.2rem 1.15rem;
		}
	}
</style>
