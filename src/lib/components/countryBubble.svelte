<script lang="ts">
	import { fly } from 'svelte/transition';
	import { cubicOut, backOut } from 'svelte/easing';
	import { formatLargeNumbers } from '$lib/utils/utils';

	export type Country = {
		flag: string;
		name: string;
		capital: string;
		population: string;
		region: string;
		currency: string;
		// extra: {
		// 	area: string;
		// 	languages: string[];
		// 	callingCode: string;
		// 	independent: string;
		// 	timezone: string;
		// };
	};

	type Props = {
		country: Country;
		open?: boolean;
		onclose?: () => void;
		toggleMore?: () => void;
	};

	let { country, open = $bindable(false), onclose, toggleMore }: Props = $props();

	// function toggleMore() {
	// 	open = !open;
	// }

	function handleBackdropClick() {
		open = false;
		onclose?.();
	}
</script>

{#if open}
	<div
		class="backdrop"
		role="presentation"
		onclick={handleBackdropClick}
		in:fly={{ duration: 200, y: 0, opacity: 0 }}
		out:fly={{ duration: 180, y: 0, opacity: 0 }}
	></div>
{/if}

<div class="bubble-card" class:elevated={open}>
	<!-- Col 1: Flag + Identity -->
	<div class="col-flag">
		<div class="flag-circle"><img src={country.flag} alt="" /></div>
		<div class="country-name">{country.name}</div>
		<div class="country-capital">◉ {country.capital}</div>
	</div>

	<!-- Col 2: Stats -->
	<div class="col-stats">
		<div class="stat-row">
			<span class="stat-label">Population</span>
			<span class="stat-value">{formatLargeNumbers(Number(country.population))}</span>
		</div>
		<div class="stat-row">
			<span class="stat-label">Region</span>
			<span class="stat-pill">{country.region}</span>
		</div>
		<div class="stat-row">
			<span class="stat-label">Currency</span>
			<span class="stat-value">{country.currency}</span>
		</div>
	</div>

	<div class="divider"></div>

	<!-- Col 3: More Info -->
	<div class="col-action">
		<button
			class="more-btn"
			class:open
			onclick={toggleMore}
			aria-expanded={open}
			aria-controls="popout-{country.name}"
		>
			More info
		</button>
		<button class="close-btn" onclick={onclose} aria-controls="close-{country.name}">
			Close
		</button>

		<!-- {#if open}
			<div
				id="popout-{country.name}"
				class="popout"
				role="region"
				aria-label="More about {country.name}"
				in:fly={{ y: -10, duration: 300, easing: backOut }}
				out:fly={{ y: -6, duration: 180, easing: cubicOut }}
			>
				<div class="popout-inner">
					<div class="popout-row">
						<span class="popout-label">Area</span>
						<span class="popout-val">{country.extra.area}</span>
					</div>
					<div class="popout-divider"></div>
					<div class="popout-row">
						<span class="popout-label">Calling code</span>
						<span class="popout-val">{country.extra.callingCode}</span>
					</div>
					<div class="popout-row">
						<span class="popout-label">Timezone</span>
						<span class="popout-val">{country.extra.timezone}</span>
					</div>
					<div class="popout-row">
						<span class="popout-label">Independent</span>
						<span class="popout-val">{country.extra.independent}</span>
					</div>
					<div class="popout-row lang-row">
						<span class="popout-label">Languages</span>
						<div class="badge-row">
							{#each country.extra.languages as lang}
								<span class="badge">{lang}</span>
							{/each}
						</div>
					</div>
				</div>
			</div>
		{/if} -->
	</div>
</div>

<style>
	@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap');

	.backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.18);
		z-index: 10;
	}

	.bubble-card {
		position: relative;
		z-index: 20;
		width: 360px;
		max-width: 360px;
		background: #ffffff;
		border: 0.5px solid rgba(0, 0, 0, 0.12);
		border-radius: 28px;
		font-family: 'Sora', sans-serif;
		transition:
			box-shadow 0.25s ease,
			transform 0.25s ease;
	}

	.bubble-card.elevated {
		box-shadow: 0 16px 48px rgba(0, 0, 0, 0.14);
		transform: translateY(-2px);
	}

	/* Col 1 */
	.col-flag {
		background: #f5f4f0;
		border-radius: 28px 28px 0 0;
		padding: 2rem 1.5rem 1.5rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		border-bottom: 0.5px solid rgba(0, 0, 0, 0.08);
	}

	.flag-circle {
		width: 72px;
		height: 72px;
		border-radius: 50%;
		border: 3px solid #ffffff;
		font-size: 44px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #ebebeb;
		box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.08);
		flex-shrink: 0;
	}
	img {
		max-width: 100%;
		height: 100%;
		border-radius: 50%;
		object-fit: cover;
	}

	.country-name {
		font-size: 18px;
		font-weight: 600;
		color: #1a1a1a;
		letter-spacing: -0.3px;
		text-align: center;
		line-height: 1.2;
	}

	.country-capital {
		font-size: 12px;
		font-family: 'DM Mono', monospace;
		color: #888;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		text-align: center;
	}

	/* Col 2 */
	.col-stats {
		padding: 1.25rem 1.5rem 0;
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.stat-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
	}

	.stat-label {
		font-size: 11px;
		font-family: 'DM Mono', monospace;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: #aaa;
		white-space: nowrap;
	}

	.stat-value {
		font-size: 13px;
		font-weight: 500;
		color: #1a1a1a;
		text-align: right;
	}

	.stat-pill {
		font-size: 12px;
		font-weight: 500;
		color: #185fa5;
		background: #e6f1fb;
		border-radius: 20px;
		padding: 3px 10px;
	}

	.divider {
		height: 0.5px;
		background: rgba(0, 0, 0, 0.08);
		margin: 1rem 1.5rem 0;
	}

	/* Col 3 */
	.col-action {
		padding: 1.25rem 1.5rem 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.more-btn,
	.close-btn {
		width: 100%;
		font-family: 'Sora', sans-serif;
		font-size: 13px;
		font-weight: 500;
		color: #1a1a1a;
		background: #f5f4f0;
		border: 0.5px solid rgba(0, 0, 0, 0.14);
		border-radius: 14px;
		padding: 10px 16px;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		transition:
			background 0.15s,
			transform 0.15s;
	}

	.close-btn {
		background: #f8a793;
	}
	.close-btn:hover {
		background: #da9281;
	}

	.more-btn:hover {
		background: #ebebeb;
	}
	.more-btn:active,
	.close-btn:active {
		transform: scale(0.97);
	}

	.btn-arrow {
		display: inline-block;
		transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	.btn-arrow.open {
		transform: rotate(180deg);
	}

	/* Popout */
	.popout {
		overflow: hidden;
		margin-top: 10px;
	}

	.popout-inner {
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding-top: 4px;
	}

	.popout-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
	}

	.lang-row {
		align-items: flex-start;
	}

	.popout-label {
		font-size: 11px;
		font-family: 'DM Mono', monospace;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: #aaa;
		white-space: nowrap;
	}

	.popout-val {
		font-size: 12px;
		font-weight: 500;
		color: #555;
	}

	.popout-divider {
		height: 0.5px;
		background: rgba(0, 0, 0, 0.08);
		margin: 2px 0;
	}

	.badge-row {
		display: flex;
		gap: 6px;
		flex-wrap: wrap;
		justify-content: flex-end;
	}

	.badge {
		font-size: 11px;
		font-family: 'DM Mono', monospace;
		padding: 3px 9px;
		border-radius: 20px;
		border: 0.5px solid rgba(0, 0, 0, 0.14);
		color: #666;
	}
</style>
