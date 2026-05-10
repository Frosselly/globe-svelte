<script lang="ts">
	import './style.css';
	import Economy from './economy.svelte';
	import Energy from './energy.svelte';
	import Tourism from './tourism.svelte';
	import Chat from '../chat.svelte';
	import { fly } from 'svelte/transition';
	import { onMount } from 'svelte';

	import CurrencyDollarIcon from 'phosphor-svelte/lib/CurrencyDollarIcon';
	import MapPinIcon from 'phosphor-svelte/lib/MapPinIcon';
	import UserIcon from 'phosphor-svelte/lib/UserIcon';

	import { mapState, setCurrentDataset } from '$lib/components/map/mapStore.svelte';
	import {
		selectedCountryStore,
		type CountrySnapshot,
		type FullCountry
	} from '../../core/stores/store.svelte';
	import { formatLargeNumbers } from '$lib/core/utils/utils';

	// ── Props ──────────────────────────────────────────────────────────────────
	let {
		visible,
		selectedSidebar = 'countryInfo',
		countryData
	}: { visible: boolean; selectedSidebar?: string; countryData: FullCountry | null } = $props();

	// ── Auth ───────────────────────────────────────────────────────────────────
	type AuthUser = { id: string; email: string; displayName: string | null; isAdmin: boolean };
	let user = $state<AuthUser | null>(null);
	let authLoaded = $state(false);
	let authMode = $state<'login' | 'register'>('login');
	let authEmail = $state('');
	let authPass = $state('');
	let authName = $state('');
	let authError = $state('');
	let authBusy = $state(false);

	async function fetchMe() {
		try {
			const r = await fetch('/api/auth', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ action: 'me' })
			});
			const d = await r.json();
			user = d.user ?? null;
		} catch {
			user = null;
		}
		authLoaded = true;
	}

	async function handleAuth() {
		authError = '';
		authBusy = true;
		try {
			const body: any = { action: authMode, email: authEmail, password: authPass };
			if (authMode === 'register') body.displayName = authName;
			const r = await fetch('/api/auth', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
			const d = await r.json();
			if (!r.ok) authError = d.error ?? 'Failed';
			else {
				user = d.user;
				authEmail = authPass = authName = '';
				fetchSaved();
			}
		} catch (e: any) {
			authError = e.message;
		}
		authBusy = false;
	}

	async function handleLogout() {
		await fetch('/api/auth', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ action: 'logout' })
		});
		user = null;
		views = [];
		chats = [];
	}

	// ── Saved data ─────────────────────────────────────────────────────────────
	type SavedView = {
		id: string;
		label: string;
		mode: 'line' | 'bar' | 'map';
		indicator: string;
		indicatorName: string | null;
		countries: string[];
		startYear: number;
		endYear: number;
		selectedYear: number | null;
		mapDisplayMode: string | null;
		createdAt: string;
	};
	type ChatMsg = {
		id: string;
		userMessage: string;
		botReply: string | null;
		parsedQuery: {
			indicator: string;
			indicatorName?: string;
			countriesIso3: string[];
			start: number;
			end: number;
			chart: string;
		} | null;
		savedViewId: string | null;
		createdAt: string;
	};

	let views = $state<SavedView[]>([]);
	let chats = $state<ChatMsg[]>([]);
	let savedReady = $state(false);
	let savedTab = $state<'views' | 'history'>('views');
	let deletingId = $state<string | null>(null);

	async function fetchSaved() {
		if (!user) return;
		try {
			const r = await fetch('/api/save');
			if (r.ok) {
				const d = await r.json();
				views = d.views ?? [];
				chats = d.messages ?? [];
			}
		} catch {}
		savedReady = true;
	}

	function onSaveView(v: SavedView) {
		views = [v, ...views];
	}

	async function deleteView(id: string) {
		deletingId = id;
		try {
			await fetch(`/api/save?id=${id}`, { method: 'DELETE' });
			views = views.filter((v) => v.id !== id);
		} catch {}
		deletingId = null;
	}

	// ── Chat ref ───────────────────────────────────────────────────────────────
	let chatRef: { replayView: (v: any) => void } | null = $state(null);

	function replaySaved(v: SavedView) {
		chatRef?.replayView({
			indicator: v.indicator,
			indicatorName: v.indicatorName,
			countries: v.countries,
			startYear: v.startYear,
			endYear: v.endYear,
			mode: v.mode,
			selectedYear: v.selectedYear
		});
		// switch to saved tab so the chart (inside Chat) is visible
		selectedSidebar = 'saved';
	}

	function replayChat(msg: ChatMsg) {
		if (!msg.parsedQuery) return;
		const q = msg.parsedQuery;
		chatRef?.replayView({
			indicator: q.indicator,
			indicatorName: q.indicatorName,
			countries: q.countriesIso3,
			startYear: q.start,
			endYear: q.end,
			mode: q.chart
		});
	}

	// ── Init ───────────────────────────────────────────────────────────────────
	onMount(() =>
		fetchMe().then(() => {
			if (user) fetchSaved();
		})
	);

	function fmtDate(iso: string) {
		return new Date(iso).toLocaleDateString(undefined, {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}
	const MODE_ICON: Record<string, string> = { line: '📈', bar: '📊', map: '🗺️' };
</script>

{#if visible}
	<div class="content" in:fly={{ x: 300, duration: 300 }} out:fly={{ x: 300, duration: 300 }}>
		<!-- ── Country Info ──────────────────────────────────────────────────────── -->
		{#if selectedSidebar === 'countryInfo'}
			<div class="drag-point"><hr /></div>
			<br />
			<section class="topicSection">
				<div class="row">
					{#if countryData}
						<div class="row">
							<figure class="country-flag">
								<picture><img src={countryData.flagSvg} alt="" /></picture>
							</figure>
							<div>
								<h2>{countryData?.name}</h2>
								<h3>{countryData?.capital}</h3>
							</div>
						</div>
					{/if}
				</div>
				<hr />
				<div class="carousel">
					<div
						class="card card-selectable flex"
						onclick={() => {
							mapState.currentDataset
								? setCurrentDataset('')
								: setCurrentDataset('economyInfo.gdp.current');
						}}
					>
						<div><span><UserIcon size={16} /></span><span><b> Population</b></span></div>
						<div><b>{formatLargeNumbers(Number(countryData?.population))}</b></div>
					</div>
					<div class="card card-selectable flex">
						<div class="flex-row">
							<span><CurrencyDollarIcon size={16} /></span><span><b> GDP</b></span>
						</div>
						<div><b>{formatLargeNumbers(Number(countryData?.gdpCurrent))}</b></div>
					</div>
					<div class="card card-selectable flex">
						<div class="flex-row">
							<span><MapPinIcon size={16} /></span><span><b> Area</b></span>
						</div>
						<div><b>{formatLargeNumbers(Number(countryData?.area))}</b></div>
					</div>
				</div>
			</section>
			{#if countryData}<Economy e={countryData} />{/if}
			<!-- {#if countryData?.renewableCurrent}
				<Energy {...countryData} />{/if}
			{#if countryData?.visitorsCurrent}<Tourism {...countryData} />{/if} -->

			<!-- ── Saved / Chat tab ──────────────────────────────────────────────────── -->
		{:else}
			<section class="topicSection">
				<!-- Auth -->
				{#if !authLoaded}
					<p class="muted">Loading…</p>
				{:else if !user}
					<div class="auth-card">
						<div class="auth-tabs">
							<button class:atab-active={authMode === 'login'} onclick={() => (authMode = 'login')}
								>Sign in</button
							>
							<button
								class:atab-active={authMode === 'register'}
								onclick={() => (authMode = 'register')}>Register</button
							>
						</div>
						{#if authMode === 'register'}
							<input class="auth-input" placeholder="Name (optional)" bind:value={authName} />
						{/if}
						<input class="auth-input" type="email" placeholder="Email" bind:value={authEmail} />
						<input
							class="auth-input"
							type="password"
							placeholder="Password"
							bind:value={authPass}
							onkeydown={(e) => e.key === 'Enter' && handleAuth()}
						/>
						{#if authError}<p class="auth-err">{authError}</p>{/if}
						<button class="btn-primary" disabled={authBusy} onclick={handleAuth}>
							{authBusy ? '…' : authMode === 'login' ? 'Sign in' : 'Create account'}
						</button>
					</div>
				{:else}
					<!-- User bar -->
					<div class="user-bar">
						<span class="user-name">{user.displayName ?? user.email}</span>
						<button class="btn-ghost btn-sm" onclick={handleLogout}>Sign out</button>
					</div>

					<!-- Sub-tabs -->
					<div class="sub-tabs">
						<button class:stab-active={savedTab === 'views'} onclick={() => (savedTab = 'views')}>
							⭐ Saved views
						</button>
						<button
							class:stab-active={savedTab === 'history'}
							onclick={() => (savedTab = 'history')}
						>
							🕐 Chat history
						</button>
					</div>

					<!-- Saved views -->
					{#if savedTab === 'views'}
						{#if !savedReady}
							<p class="muted">Loading…</p>
						{:else if views.length === 0}
							<p class="muted">No saved views yet. Use the chat and click ⭐ Save on a result.</p>
						{:else}
							<div class="item-list">
								{#each views as v (v.id)}
									<div class="item-card">
										<div class="item-top">
											<span class="mode-ico">{MODE_ICON[v.mode] ?? '📊'}</span>
											<span class="item-label">{v.label}</span>
											<button
												class="btn-del"
												title="Delete"
												disabled={deletingId === v.id}
												onclick={() => deleteView(v.id)}>🗑</button
											>
										</div>
										<div class="item-meta">
											{v.countries?.join(', ')} · {v.startYear}–{v.endYear}
											{v.selectedYear ? `· yr ${v.selectedYear}` : ''}
										</div>
										<div class="item-foot">
											<span class="muted-sm">{fmtDate(v.createdAt)}</span>
											<button class="btn-show" onclick={() => replaySaved(v)}>Show ↓</button>
										</div>
									</div>
								{/each}
							</div>
						{/if}

						<!-- Chat history -->
					{:else if chats.length === 0}
						<p class="muted">No chat history yet.</p>
					{:else}
						<div class="item-list">
							{#each chats as msg (msg.id)}
								<div class="item-card" class:item-has-q={!!msg.parsedQuery}>
									<div class="item-label">{msg.userMessage}</div>
									{#if msg.parsedQuery}
										<div class="item-meta">
											{msg.parsedQuery.indicatorName ?? msg.parsedQuery.indicator}
											· {msg.parsedQuery.start}–{msg.parsedQuery.end}
										</div>
									{/if}
									<div class="item-foot">
										<span class="muted-sm">{fmtDate(msg.createdAt)}</span>
										<div class="item-foot-actions">
											{#if msg.savedViewId}<span class="badge-saved">⭐ saved</span>{/if}
											{#if msg.parsedQuery}
												<button class="btn-show" onclick={() => replayChat(msg)}>Replay ↓</button>
											{/if}
										</div>
									</div>
								</div>
							{/each}
						</div>
					{/if}
				{/if}

				<!-- Chat always visible in this tab -->
				<h3 class="section-h">AI Data Chat</h3>
				<div class="chatbox">
					<Chat bind:this={chatRef} {user} {onSaveView} />
				</div>
			</section>
		{/if}
	</div>
{:else}
	<div>Click on a country</div>
{/if}

<style>
	.content {
		display: flex;
		flex-direction: column;
		height: 100%;
		overflow-y: auto;
	}

	.drag-point {
		display: none;
	}
	@media (max-width: 1200px) {
		.drag-point {
			display: block;
			position: fixed;
			width: 100%;
			background: hsl(0, 0%, 97%);
			border: 1px solid hsl(0, 0%, 95%);
			height: 20px;
		}
	}

	.carousel {
		display: flex;
		gap: 16px;
		width: 100%;
	}
	.row {
		display: flex;
		gap: 16px;
	}
	.country-flag picture {
		width: 80px;
		height: 50px;
		background: gray;
		display: block;
	}

	:global(.topicSection) {
		display: flex;
		flex-direction: column;
		gap: 16px;
		padding-inline: 2rem;
		padding-block: 1rem;
	}
	:global(.strong-hr) {
		border: none;
		border-top: 2px solid #000;
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

	/* Sub-tabs */
	.sub-tabs {
		display: flex;
		gap: 4px;
		border-bottom: 1px solid #e5e7eb;
		padding-bottom: 4px;
	}
	.sub-tabs button {
		padding: 6px 12px;
		border: none;
		background: transparent;
		border-radius: 6px 6px 0 0;
		font-size: 0.83rem;
		cursor: pointer;
		color: #6b7280;
	}
	.stab-active {
		background: #eff6ff !important;
		color: #0369a1 !important;
		font-weight: 600;
		border-bottom: 2px solid #0ea5e9;
	}
	.sub-tabs button:hover:not(.stab-active) {
		background: #f9fafb;
	}

	/* Item list */
	.item-list {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.item-card {
		background: #fff;
		border: 1px solid #e5e7eb;
		border-radius: 9px;
		padding: 10px 12px;
		display: flex;
		flex-direction: column;
		gap: 5px;
	}
	.item-has-q {
		border-left: 3px solid #0ea5e9;
	}
	.item-top {
		display: flex;
		align-items: center;
		gap: 6px;
	}
	.mode-ico {
		font-size: 0.95rem;
		flex-shrink: 0;
	}
	.item-label {
		font-size: 0.86rem;
		font-weight: 500;
		flex: 1;
		line-height: 1.35;
	}
	.item-meta {
		font-size: 0.77rem;
		color: #6b7280;
	}
	.item-foot {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.item-foot-actions {
		display: flex;
		gap: 8px;
		align-items: center;
	}
	.muted-sm {
		font-size: 0.73rem;
		color: #9ca3af;
	}
	.badge-saved {
		font-size: 0.73rem;
		color: #059669;
	}

	/* Buttons */
	button {
		cursor: pointer;
	}
	.btn-show {
		background: #eff6ff;
		border: 1px solid #bfdbfe;
		color: #1d4ed8;
		padding: 4px 10px;
		border-radius: 6px;
		font-size: 0.77rem;
	}
	.btn-show:hover {
		background: #dbeafe;
	}
	.btn-del {
		background: transparent;
		border: none;
		font-size: 0.85rem;
		color: #9ca3af;
		padding: 2px 4px;
		border-radius: 4px;
	}
	.btn-del:hover:not(:disabled) {
		color: #dc2626;
		background: #fee2e2;
	}
	.btn-del:disabled {
		opacity: 0.4;
		cursor: default;
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

	/* Misc */
	.muted {
		color: #9ca3af;
		font-size: 0.84rem;
	}
	.section-h {
		font-size: 0.9rem;
		font-weight: 600;
		color: #374151;
		margin: 4px 0 0;
	}
	.chatbox {
		min-height: 480px;
		border-radius: 10px;
		overflow: hidden;
	}
</style>
