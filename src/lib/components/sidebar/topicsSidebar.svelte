<script lang="ts">
	import './style.css';
	import Economy from './economy.svelte';
	import Energy from './energy.svelte';
	import Tourism from './tourism.svelte';
	import Chat from '../chat.svelte';
	import { fly } from 'svelte/transition';
	import { onMount, type Component } from 'svelte';

	import CurrencyDollarIcon from 'phosphor-svelte/lib/CurrencyDollarIcon';
	import MapPinIcon from 'phosphor-svelte/lib/MapPinIcon';
	import UserIcon from 'phosphor-svelte/lib/UserIcon';
	import ClockCounterClockwiseIcon from 'phosphor-svelte/lib/ClockCounterClockwiseIcon';
	import StarIcon from 'phosphor-svelte/lib/StarIcon';

	import { formatLargeNumbers } from '$lib/core/utils/utils';
	import { selectedCountryStore } from '$lib/core/stores/store.svelte';
	import Demographics from './demographics.svelte';
	import Military from './military.svelte';
	import Environment from './environment.svelte';
	import { authStore } from '$lib/core/stores/authStore.svelte';
	import AuthPanel from '../AuthPanel.svelte';
	import { goto } from '$app/navigation';
	import { OPTION_BY_KEY } from '$lib/assets/analysisOptions';
	import { savedStore, type SavedView } from '$lib/core/stores/savedStore.svelte';
	import ChartBarIcon from 'phosphor-svelte/lib/ChartBarIcon';
	import TrendUpIcon from 'phosphor-svelte/lib/TrendUpIcon';
	import MapTrifoldIcon from 'phosphor-svelte/lib/MapTrifoldIcon';
	import TrashIcon from 'phosphor-svelte/lib/TrashIcon';
	import CaretDownIcon from 'phosphor-svelte/lib/CaretDownIcon';

	// -- Props ------------------
	let { visible, selectedSidebar = 'countryInfo', onDragStart = null } = $props();

	const countryData = $derived(selectedCountryStore.country);

	// -- Auth -------------------
	onMount(() =>
		authStore.fetchMe().then(() => {
			if (authStore.user) savedStore.refresh();
		})
	);

	// saved views logic stays here (or moves to savedStore)
	const user = $derived(authStore.user);

	// -- Saved data -------------

	const views = $derived(savedStore.views);
	const chats = $derived(savedStore.chats);
	const savedReady = $derived(savedStore.ready);
	const deletingId = $derived(savedStore.deletingId);
	let savedTab = $state<'views' | 'history'>('views');

	// Clear store whenever user logs out so data never bleeds to the next user
	$effect(() => {
		if (!user) savedStore.refresh();
	});

	function onLogin() {
		savedStore.refresh();
	}

	function onLogout() {
		savedStore.refresh();
	}

	function onSaveView(v: SavedView) {
		savedStore.addView(v);
	}

	// async function deleteView(id: string) {
	// 	deletingId = id;
	// 	try {
	// 		await fetch(`/api/save?id=${id}`, { method: 'DELETE' });
	// 		views = views.filter((v) => v.id !== id);
	// 	} catch {}
	// 	deletingId = null;
	// }

	// -- Chat ref ---------------
	let chatRef: { replayView: (v: any) => void } | null = $state(null);

	function replaySaved(v: SavedView) {
		const indicator = OPTION_BY_KEY[v.indicator];

		//if local indicator does not exists it was a chat query
		if (!indicator) {
			chatRef?.replayView({
				indicator: v.indicator,
				indicatorName: v.indicatorName,
				countries: v.countries,
				startYear: v.startYear,
				endYear: v.endYear,
				mode: v.mode,
				selectedYear: v.selectedYear
			});
		} else {
			goto(`/analysis/${v.id}`);
		}
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
	const MODE_ICON: Record<string, Component> = {
		line: TrendUpIcon,
		bar: ChartBarIcon,
		map: MapTrifoldIcon
	};
</script>

{#if visible}
	<div class="content" in:fly={{ x: 300, duration: 300 }} out:fly={{ x: 300, duration: 300 }}>
		<div
			class="drag-point"
			onpointerdown={onDragStart}
			role="separator"
			aria-label="Drag to resize sidebar"
		>
			<hr />
		</div>
		<br />
		<!-- -- Country Info -------- -->
		{#if selectedSidebar === 'countryInfo'}
			{#if countryData}
				<section class="topicSection">
					<div class="row">
						<div class="row">
							<figure class="country-flag">
								<picture><img src={countryData?.flagSvg} alt="" /></picture>
							</figure>
							<div>
								<h2>{countryData?.name}</h2>
								<h3>{countryData?.capital}</h3>
							</div>
						</div>
					</div>
					<hr />
					<div class="carousel">
						<div class="card flex">
							<div><span><UserIcon size={16} /></span><span><b> Population</b></span></div>
							<div><b>{formatLargeNumbers(Number(countryData?.population))}</b></div>
						</div>
						<div class="card flex">
							<div class="flex-row">
								<span><CurrencyDollarIcon size={16} /></span><span><b> GDP</b></span>
							</div>
							<div><b>{formatLargeNumbers(Number(countryData?.gdpCurrent))}</b></div>
						</div>
						<div class="card flex">
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
				<AuthPanel {onLogin} {onLogout} />
				{#if user}
					<!-- Sub-tabs -->
					<div class="sub-tabs">
						<button class:stab-active={savedTab === 'views'} onclick={() => (savedTab = 'views')}>
							<StarIcon size="12" /> Saved views
						</button>
						<button
							class:stab-active={savedTab === 'history'}
							onclick={() => (savedTab = 'history')}
						>
							<ClockCounterClockwiseIcon size="12" /> Chat history
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
									{@const MODE_ICON_Component = MODE_ICON[v.mode]}
									<div class="item-card">
										<div class="item-top">
											<span class="mode-ico">
												<MODE_ICON_Component size="12" />
											</span>
											<span class="item-label">{v.label}</span>
											<button
												class="btn-del"
												title="Delete"
												disabled={deletingId === v.id}
												onclick={() => savedStore.deleteView(v.id)}><TrashIcon size="12" /></button
											>
										</div>
										<div class="item-meta">
											{v.countries?.join(', ')} · {v.startYear}–{v.endYear}
											{v.selectedYear ? `· yr ${v.selectedYear}` : ''}
										</div>
										<div class="item-foot">
											<span class="muted-sm">{fmtDate(v.createdAt)}</span>
											<button class="btn-show" onclick={() => replaySaved(v)}
												>Show <CaretDownIcon size="12" /></button
											>
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
								<div class="item-card">
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
												<button class="btn-show" onclick={() => replayChat(msg)}
													>Replay <CaretDownIcon size="12" /></button
												>
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
		width: 120px;
		height: 50px;
		/*background: gray;*/
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
	}

	.country-flag img {
		max-width: 100%;
		max-height: 100%;
		object-fit: contain;
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

	@media (max-width: 768px) {
		:global(.topicSection) {
			padding-inline: 0.4rem;
		}
	}

	/* Sub-tabs */
	.sub-tabs {
		display: flex;
		gap: 4px;
		border-bottom: 1px solid #e5e7eb;
		padding-bottom: 4px;
	}
	.sub-tabs button {
		display: flex;
		align-items: center;
		gap: 4px;
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
		display: flex;
		gap: 4px;
		align-items: center;
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
		margin-bottom: 4rem;
		border: 1px solid #e5e7eb;
		border-radius: 12px;
	}
</style>
