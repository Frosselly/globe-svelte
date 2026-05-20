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
	import { formatLargeNumbers } from '$lib/core/utils/utils';
	import { selectedCountryStore } from '$lib/core/stores/store.svelte';
	import Demographics from './demographics.svelte';
	import Military from './military.svelte';
	import Environment from './environment.svelte';
	import { authStore } from '$lib/core/stores/authStore.svelte';
	import AuthPanel from '../AuthPanel.svelte';

	// -- Props ------------------
	let { visible, selectedSidebar = 'countryInfo', onDragStart = null } = $props();

	const countryData = $derived(selectedCountryStore.country);

	// -- Auth -------------------
	onMount(() =>
		authStore.fetchMe().then(() => {
			if (authStore.user) fetchSaved();
		})
	);

	// saved views logic stays here (or moves to savedStore)
	const user = $derived(authStore.user);

	// -- Saved data -------------
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

	// -- Chat ref ---------------
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
		<!-- -- Country Info -------- -->
		{#if selectedSidebar === 'countryInfo'}
			<div
				class="drag-point"
				onpointerdown={onDragStart}
				role="separator"
				aria-label="Drag to resize sidebar"
			>
				<hr />
			</div>
			<br />
			{#if countryData}
				<section class="topicSection">
					<div class="row">
						<div class="row">
							<figure class="country-flag"><picture><img src="" alt="" /></picture></figure>
							<div>
								<h2>{countryData?.name}</h2>
								<h3>{countryData?.capital}</h3>
							</div>
						</div>
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

				{#if countryData?.populationCurrent}<Demographics c={countryData} />{/if}
				{#if countryData}<Economy e={countryData} />{/if}
				{#if countryData?.renewableCurrent}
					<Energy e={countryData} />
				{/if}
				{#if countryData?.visitorsCurrent}<Tourism e={countryData} />{/if}
				{#if countryData?.budgetCurrent}<Military c={countryData} />{/if}
				{#if countryData?.envPerformanceIndex}<Environment c={countryData} />{/if}
			{:else}
				<div class="sidebarInfoText">Click on a country</div>
			{/if}
			<!-- -- Saved / Chat tab ---- -->
		{:else}
			<section class="topicSection">
				<!-- Auth -->
				<AuthPanel onLogin={fetchSaved} />
				{#if user}
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
					<!-- Chat always visible in this tab -->
					<h3 class="section-h">AI Data Chat</h3>
					<div class="chatbox">
						<Chat bind:this={chatRef} {user} {onSaveView} />
					</div>
				{/if}
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
		background: #fff;
	}

	.sidebarInfoText {
		width: 100%;
		height: 100%;
		padding-top: 5rem;
		text-align: center;
		font-weight: bold;
		color: #727272;
		font-size: 1.2rem;
	}

	.drag-point {
		display: none;
	}
	@media (max-width: 1200px) {
		.drag-point {
			display: flex;
			align-items: center;
			justify-content: center;
			min-height: 24px;
			cursor: grab;
			touch-action: none;
			background: var(--color-background);
			position: sticky; /* sticks to top of sidebar scroll */
			top: 0;
			z-index: 10;
			width: 100%;
		}
		.drag-point:active {
			cursor: grabbing;
		}
		.drag-point hr {
			width: 40px;
			height: 4px;
			border-radius: 2px;
			border: none;
			background: #d1d5db;
			margin: 0;
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
