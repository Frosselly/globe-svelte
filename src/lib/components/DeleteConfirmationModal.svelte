<script lang="ts">
	import { fly, fade } from 'svelte/transition';
	import { backOut } from 'svelte/easing';
	import TrashIcon from 'phosphor-svelte/lib/TrashIcon';

	type Props = {
		open?: boolean;
		onconfirm?: () => void;
		oncancel?: () => void;
		label?: string;
		deleting?: boolean;
	};

	let {
		open = $bindable(false),
		onconfirm,
		oncancel,
		label = 'this analysis',
		deleting = false
	}: Props = $props();

	function handleCancel() {
		open = false;
		oncancel?.();
	}
</script>

{#if open}
	<div
		class="backdrop"
		role="presentation"
		onclick={handleCancel}
		in:fade={{ duration: 200 }}
		out:fade={{ duration: 180 }}
	></div>

	<div
		class="modal-positioner"
		role="dialog"
		aria-modal="true"
		aria-labelledby="delete-title"
		in:fly={{ duration: 260, y: 14, opacity: 0, easing: backOut }}
		out:fly={{ duration: 180, y: 6, opacity: 0 }}
	>
		<div class="bubble-card">
			<!-- Icon header -->
			<div class="col-icon">
				<div class="icon-circle">
					<TrashIcon size="28" />
				</div>
				<div class="modal-title" id="delete-title">Delete {label}?</div>
				<div class="modal-sub">This action cannot be undone.</div>
			</div>

			<div class="divider"></div>

			<!-- Actions -->
			<div class="col-action">
				<button class="delete-btn" onclick={onconfirm} disabled={deleting} aria-busy={deleting}>
					{#if deleting}
						<span class="spinner" aria-hidden="true"></span>
						Deleting…
					{:else}
						Delete
					{/if}
				</button>
				<button class="cancel-btn" onclick={handleCancel} disabled={deleting}> Cancel </button>
			</div>
		</div>
	</div>
{/if}

<style>
	.backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.22);
		backdrop-filter: blur(2px);
		-webkit-backdrop-filter: blur(2px);
		z-index: 40;
	}

	.modal-positioner {
		position: fixed;
		inset: 0;
		z-index: 50;
		display: flex;
		align-items: center;
		justify-content: center;
		pointer-events: none;
	}

	.bubble-card {
		pointer-events: all;
		width: 320px;
		background: var(--color-background, #fff);
		border: 0.5px solid rgba(0, 0, 0, 0.12);
		border-radius: 28px;
		font-family: 'Sora', sans-serif;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.18);
	}

	/* Icon header */
	.col-icon {
		background: #f5f4f0;
		border-radius: 28px 28px 0 0;
		padding: 2rem 1.5rem 1.5rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		border-bottom: 0.5px solid rgba(0, 0, 0, 0.08);
	}

	.icon-circle {
		width: 68px;
		height: 68px;
		border-radius: 50%;
		background: #fde8e3;
		border: 3px solid #fff;
		box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.08);
		display: flex;
		align-items: center;
		justify-content: center;
		color: #b03a2e;
		flex-shrink: 0;
	}

	.modal-title {
		font-size: 17px;
		font-weight: 600;
		color: #1a1a1a;
		letter-spacing: -0.3px;
		text-align: center;
		line-height: 1.25;
	}

	.modal-sub {
		font-size: 12px;
		font-family: 'DM Mono', monospace;
		color: #aaa;
		letter-spacing: 0.04em;
		text-align: center;
	}

	.divider {
		height: 0.5px;
		background: rgba(0, 0, 0, 0.08);
		margin: 0 1.5rem;
	}

	/* Actions */
	.col-action {
		padding: 1.25rem 1.5rem 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.delete-btn,
	.cancel-btn {
		width: 100%;
		font-family: 'Sora', sans-serif;
		font-size: 13px;
		font-weight: 500;
		border-radius: 14px;
		padding: 10px 16px;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		border: 0.5px solid rgba(0, 0, 0, 0.14);
		transition:
			background 0.15s,
			transform 0.15s;
	}

	.delete-btn {
		color: #7a1c0e;
		background: #f8a793;
	}
	.delete-btn:hover:not(:disabled) {
		background: #da9281;
	}
	.delete-btn:disabled {
		opacity: 0.65;
		cursor: not-allowed;
	}
	.delete-btn:active:not(:disabled) {
		transform: scale(0.97);
	}

	.cancel-btn {
		color: #1a1a1a;
		background: #f5f4f0;
	}
	.cancel-btn:hover:not(:disabled) {
		background: #ebebeb;
	}
	.cancel-btn:active:not(:disabled) {
		transform: scale(0.97);
	}

	.spinner {
		width: 13px;
		height: 13px;
		border: 2px solid rgba(122, 28, 14, 0.25);
		border-top-color: #7a1c0e;
		border-radius: 50%;
		animation: spin 0.7s linear infinite;
		display: inline-block;
		flex-shrink: 0;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
