<script lang="ts">
	import { authStore } from '$lib/core/stores/authStore.svelte';

	let { onLogin, onLogout } = $props<{ onLogin: () => void; onLogout?: () => void }>();

	let mode = $state<'login' | 'register'>('login');
	let email = $state('');
	let pass = $state('');
	let name = $state('');
	let error = $state('');
	let busy = $state(false);

	// Per-field validation errors
	let fieldErrors = $state<{ email?: string; password?: string }>({});

	// --- Validation rules ---

	const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

	const PASSWORD_RULES = [
		{ test: (p: string) => p.length >= 8, msg: 'At least 8 characters' },
		{ test: (p: string) => /[A-Z]/.test(p), msg: 'At least one uppercase letter' },
		{ test: (p: string) => /[0-9]/.test(p), msg: 'At least one number' },
		{ test: (p: string) => /[^A-Za-z0-9]/.test(p), msg: 'At least one special character' }
	];

	function validateEmail(value: string): string | undefined {
		if (!value.trim()) return 'Email is required';
		if (!EMAIL_RE.test(value.trim())) return 'Enter a valid email address';
	}

	function validatePassword(value: string): string | undefined {
		if (!value) return 'Password is required';
		if (mode === 'register') {
			const failed = PASSWORD_RULES.find((r) => !r.test(value));
			if (failed) return failed.msg;
		} else {
			if (value.length < 1) return 'Password is required';
		}
	}

	function validate(): boolean {
		const emailErr = validateEmail(email);
		const passErr = validatePassword(pass);
		fieldErrors = { email: emailErr, password: passErr };
		return !emailErr && !passErr;
	}

	// Live validation after first blur
	let emailTouched = $state(false);
	let passTouched = $state(false);

	$effect(() => {
		if (emailTouched) fieldErrors.email = validateEmail(email);
	});
	$effect(() => {
		if (passTouched) fieldErrors.password = validatePassword(pass);
	});

	// Password strength (register only)
	let strength = $derived(
		mode === 'register' ? PASSWORD_RULES.filter((r) => r.test(pass)).length : 0
	);

	const strengthLabel = $derived(
		strength === 0
			? ''
			: strength === 1
				? 'Weak'
				: strength === 2
					? 'Fair'
					: strength === 3
						? 'Good'
						: 'Strong'
	);

	const strengthColor = $derived(
		strength <= 1 ? '#ef4444' : strength === 2 ? '#f59e0b' : strength === 3 ? '#84cc16' : '#22c55e'
	);

	// Reset touch state when switching modes
	function switchMode(m: 'login' | 'register') {
		mode = m;
		error = '';
		fieldErrors = {};
		emailTouched = false;
		passTouched = false;
	}

	async function handleAuth() {
		error = '';
		emailTouched = true;
		passTouched = true;
		if (!validate()) return;
		busy = true;
		try {
			const body: any = { action: mode, email: email.trim().toLowerCase(), password: pass };
			if (mode === 'register') body.displayName = name.trim() || undefined;

			const r = await fetch('/api/auth', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
			const d = await r.json();
			if (!r.ok) {
				error = d.error ?? 'Something went wrong';
			} else {
				authStore.user = d.user;
				email = pass = name = '';
				emailTouched = false;
				passTouched = false;
				onLogin();
			}
		} catch (e: any) {
			error = e.message ?? 'Network error';
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
	<form
		class="auth-card"
		onsubmit={(e) => {
			e.preventDefault();
			handleAuth();
		}}
	>
		<div class="auth-tabs">
			<button type="button" class:atab-active={mode === 'login'} onclick={() => switchMode('login')}
				>Sign in</button
			>
			<button
				type="button"
				class:atab-active={mode === 'register'}
				onclick={() => switchMode('register')}>Register</button
			>
		</div>

		{#if mode === 'register'}
			<input
				class="auth-input"
				placeholder="Name (optional)"
				autocomplete="name"
				bind:value={name}
			/>
		{/if}

		<div class="field-wrap">
			<input
				class="auth-input"
				class:input-error={!!fieldErrors.email}
				type="email"
				placeholder="Email"
				autocomplete="email"
				bind:value={email}
				onblur={() => (emailTouched = true)}
			/>
			{#if fieldErrors.email}
				<p class="field-err">{fieldErrors.email}</p>
			{/if}
		</div>

		<div class="field-wrap">
			<input
				class="auth-input"
				class:input-error={!!fieldErrors.password}
				type="password"
				placeholder="Password"
				autocomplete={mode === 'register' ? 'new-password' : 'current-password'}
				bind:value={pass}
				onblur={() => (passTouched = true)}
				onkeydown={(e) => e.key === 'Enter' && handleAuth()}
			/>
			{#if fieldErrors.password}
				<p class="field-err">{fieldErrors.password}</p>
			{/if}

			{#if mode === 'register' && pass.length > 0}
				<div class="strength-bar">
					{#each PASSWORD_RULES as _, i}
						<div
							class="strength-seg"
							style:background={i < strength ? strengthColor : '#e5e7eb'}
						></div>
					{/each}
					<span class="strength-label" style:color={strengthColor}>{strengthLabel}</span>
				</div>
				{#if mode === 'register'}
					<ul class="pw-hints">
						{#each PASSWORD_RULES as rule}
							<li class:met={rule.test(pass)}>
								<span class="hint-dot">{rule.test(pass) ? '✓' : '·'}</span>
								{rule.msg}
							</li>
						{/each}
					</ul>
				{/if}
			{/if}
		</div>

		{#if error}<p class="auth-err">{error}</p>{/if}

		<button class="btn-primary" type="submit" disabled={busy}>
			{busy ? '…' : mode === 'login' ? 'Sign in' : 'Create account'}
		</button>
	</form>
{:else}
	<div class="user-bar">
		<span class="user-name">{authStore.user.displayName ?? authStore.user.email}</span>
		<button
			class="btn-ghost btn-sm"
			onclick={() => {
				authStore.logout();
				onLogout?.();
			}}>Sign out</button
		>
	</div>
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

	/* Auth card */
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

	/* Fields */
	.field-wrap {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}
	.auth-input {
		padding: 8px 11px;
		border-radius: 7px;
		border: 1px solid #d1d5db;
		font-size: 0.87rem;
		width: 100%;
		box-sizing: border-box;
		transition: border-color 0.15s;
	}
	.auth-input:focus {
		outline: none;
		border-color: #0ea5e9;
		box-shadow: 0 0 0 3px rgb(14 165 233 / 0.15);
	}
	.input-error {
		border-color: #ef4444 !important;
	}
	.input-error:focus {
		box-shadow: 0 0 0 3px rgb(239 68 68 / 0.15) !important;
	}
	.field-err {
		color: #dc2626;
		font-size: 0.78rem;
		margin: 0;
	}
	.auth-err {
		color: #dc2626;
		font-size: 0.8rem;
		margin: 0;
	}

	/* Password strength */
	.strength-bar {
		display: flex;
		align-items: center;
		gap: 4px;
		margin-top: 2px;
	}
	.strength-seg {
		flex: 1;
		height: 3px;
		border-radius: 2px;
		transition: background 0.2s;
	}
	.strength-label {
		font-size: 0.72rem;
		font-weight: 600;
		min-width: 36px;
		text-align: right;
		transition: color 0.2s;
	}

	/* Password hints */
	.pw-hints {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	.pw-hints li {
		font-size: 0.75rem;
		color: #9ca3af;
		display: flex;
		align-items: center;
		gap: 5px;
		transition: color 0.15s;
	}
	.pw-hints li.met {
		color: #22c55e;
	}
	.hint-dot {
		font-size: 0.8rem;
		width: 12px;
		text-align: center;
	}

	/* Buttons */
	.btn-primary {
		background: #0ea5e9;
		color: #fff;
		border: none;
		padding: 9px;
		border-radius: 8px;
		cursor: pointer;
		font-size: 0.9rem;
		transition: background 0.15s;
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
		cursor: pointer;
	}
	.btn-ghost:hover {
		background: #f3f4f6;
	}
	.btn-sm {
		padding: 4px 9px !important;
		font-size: 0.78rem !important;
	}
</style>
