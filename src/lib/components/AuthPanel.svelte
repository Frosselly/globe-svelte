<script lang="ts">
	import { authStore } from '$lib/core/stores/authStore.svelte';

	let { onLogin } = $props<{ onLogin: () => void }>();

	let mode = $state<'login' | 'register'>('login');
	let email = $state('');
	let pass = $state('');
	let name = $state('');
	let error = $state('');
	let busy = $state(false);

	async function handleAuth() {
		error = '';
		busy = true;
		try {
			const body: any = { action: mode, email, password: pass };
			if (mode === 'register') body.displayName = name;
			const r = await fetch('/api/auth', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
			const d = await r.json();
			if (!r.ok) error = d.error ?? 'Failed';
			else {
				authStore.user = d.user;
				email = pass = name = '';
				onLogin();
			}
		} catch (e: any) {
			error = e.message;
		}
		busy = false;
	}
</script>

{#if !authStore.loaded}
	<p class="muted">Loading…</p>
{:else if !authStore.user}
	<div class="flex center">
		<h2 class="section-h">Register to save views and use AI chat</h2>
	</div>
	<form class="auth-card">
		<div class="auth-tabs">
			<button class:atab-active={mode === 'login'} onclick={() => (mode = 'login')}>Sign in</button>
			<button class:atab-active={mode === 'register'} onclick={() => (mode = 'register')}
				>Register</button
			>
		</div>
		{#if mode === 'register'}
			<input class="auth-input" placeholder="Name (optional)" bind:value={name} />
		{/if}
		<input class="auth-input" type="email" placeholder="Email" bind:value={email} />
		<input
			class="auth-input"
			type="password"
			placeholder="Password"
			bind:value={pass}
			onkeydown={(e) => e.key === 'Enter' && handleAuth()}
		/>
		{#if error}<p class="auth-err">{error}</p>{/if}
		<button class="btn-primary" disabled={busy} onclick={handleAuth}>
			{busy ? '…' : mode === 'login' ? 'Sign in' : 'Create account'}
		</button>
	</form>
{:else}
	<div class="user-bar">
		<span class="user-name">{authStore.user.displayName ?? authStore.user.email}</span>
		<button class="btn-ghost btn-sm" onclick={() => authStore.logout()}>Sign out</button>
	</div>
	<!-- User bar -->
	<!-- <div class="user-bar">
						<span class="user-name">{user.displayName ?? user.email}</span>
						<button class="btn-ghost btn-sm" onclick={handleLogout}>Sign out</button>
					</div> -->
{/if}

<style>
	/* User bar */
	.user-bar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		background: #f3f4f6;
		border-radius: 8px;
		padding: 8px 12px;
	}
	.user-name {
		font-weight: 600;
		font-size: 0.88rem;
	}
	/* Auth */
	.auth-card {
		background: #f9fafb;
		border: 1px solid #e5e7eb;
		border-radius: 10px;
		padding: 14px;
		display: flex;
		flex-direction: column;
		gap: 9px;
	}
	.auth-tabs {
		display: flex;
		border-radius: 7px;
		overflow: hidden;
		border: 1px solid #d1d5db;
	}
	.auth-tabs button {
		flex: 1;
		padding: 7px;
		border: none;
		background: #f3f4f6;
		font-size: 0.86rem;
		cursor: pointer;
	}
	.atab-active {
		background: #fff !important;
		font-weight: 600;
	}
	.auth-input {
		padding: 8px 11px;
		border-radius: 7px;
		border: 1px solid #d1d5db;
		font-size: 0.87rem;
		width: 100%;
		box-sizing: border-box;
	}
	.auth-err {
		color: #dc2626;
		font-size: 0.8rem;
		margin: 0;
	}
	.btn-primary {
		background: #0ea5e9;
		color: #fff;
		border: none;
		padding: 9px;
		border-radius: 8px;
		cursor: pointer;
		font-size: 0.9rem;
	}
	.btn-primary:disabled {
		opacity: 0.5;
		cursor: default;
	}
	.btn-primary:hover:not(:disabled) {
		background: #0284c7;
	}
	.btn-ghost {
		background: transparent;
		border: 1px solid #d1d5db;
		color: #374151;
		border-radius: 6px;
		padding: 5px 10px;
		font-size: 0.82rem;
	}
	.btn-ghost:hover {
		background: #f3f4f6;
	}
	.btn-sm {
		padding: 4px 9px !important;
		font-size: 0.78rem !important;
	}
</style>
