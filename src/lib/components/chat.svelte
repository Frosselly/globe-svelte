<script lang="ts">
	/**
	 * Message kinds:
	 *   text          – plain user or bot message
	 *   error         – red error card
	 *   chart         – a rendered ChartCard (persists; never replaced)
	 *   disambig      – indicator picker shown when the API returns multiple candidates
	 */

	import { onMount, tick } from 'svelte';
	import ChartCard from './ChartCard.svelte';
	import type { Candidate, DataResult, Message } from '$lib/core/types';
	import WarningIcon from 'phosphor-svelte/lib/WarningIcon';
	import CheckIcon from 'phosphor-svelte/lib/CheckIcon';
	import OptionIcon from 'phosphor-svelte/lib/OptionIcon';

	// -- Props

	let {
		user = null as { id: string; email: string; displayName: string | null } | null,
		onSaveView = (_v: any) => {}
	} = $props();

	// -- State

	let messages: Message[] = $state([]);
	let input = $state('');
	let loading = $state(false);
	let saving = $state<string | null>(null);
	let expanded = $state(false);
	let cardIdx = 0;

	let listEl: HTMLElement | null = null;

	onMount(() => {
		messages = [
			{
				kind: 'text',
				from: 'bot',
				text: 'Ask me anything — e.g. "CO₂ emissions France vs Germany 2000–2020" or "GDP per capita EU 2010–2023".'
			}
		];
	});

	async function scrollBottom() {
		await tick();
		if (listEl) listEl.scrollTop = listEl.scrollHeight;
	}

	function push(...msgs: Message[]) {
		messages = [...messages, ...msgs];
		scrollBottom();
	}

	// -- Send

	async function handleSend() {
		const prompt = input.trim();
		if (!prompt || loading) return;
		push({ kind: 'text', from: 'user', text: prompt });
		input = '';
		loading = true;

		try {
			const res = await fetch('/api/query', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ prompt })
			});
			const data = await res.json().catch(() => null);

			if (!data) {
				push({ kind: 'error', text: 'Empty response from server.' });
				loading = false;
				return;
			}

			// -- Disambiguation response
			if (data.disambiguation) {
				push({
					kind: 'disambig',
					idx: cardIdx++,
					data: {
						concept: data.concept,
						candidates: data.candidates,
						countries: data.countries,
						start: data.start,
						end: data.end,
						chart: data.chart,
						messageId: data.messageId
					}
				});
				loading = false;
				return;
			}

			// -- Error response
			if (!res.ok || data.error) {
				push({ kind: 'error', text: data.error ?? `Server error ${res.status}` });
				loading = false;
				return;
			}

			// -- Success
			pushChartResult(data);
		} catch (err) {
			console.error(err);
			push({ kind: 'error', text: 'Network error — please try again.' });
		}
		loading = false;
	}

	// -- Pick a candidate from the disambig card ----

	async function pickCandidate(msgIdx: number, candidate: Candidate) {
		// Find the disambig message and mark it as loading
		messages = messages.map((m, i) =>
			i === msgIdx && m.kind === 'disambig'
				? { ...m, data: { ...m.data, pickedId: candidate.id, loading: true } }
				: m
		);

		const d = (messages[msgIdx] as Extract<Message, { kind: 'disambig' }>).data;

		try {
			const res = await fetch('/api/query/fetch', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					indicator: candidate.id,
					indicatorName: candidate.name,
					countriesIso3: d.countries,
					start: d.start,
					end: d.end,
					chart: d.chart,
					messageId: d.messageId
				})
			});
			const data = await res.json().catch(() => null);

			// Unmark loading on the disambig card
			messages = messages.map((m, i) =>
				i === msgIdx && m.kind === 'disambig' ? { ...m, data: { ...m.data, loading: false } } : m
			);

			if (!res.ok || data?.error) {
				push({ kind: 'error', text: data?.error ?? 'Failed to load indicator.' });
				return;
			}
			pushChartResult(data);
		} catch {
			push({ kind: 'error', text: 'Network error fetching indicator.' });
		}
	}

	function pushChartResult(data: any) {
		const result: DataResult = {
			indicatorCode: data.indicatorCode,
			indicator: data.indicator,
			chart: data.chart === 'bar' ? 'bar' : 'line',
			countries: data.countries ?? [],
			start: data.start,
			end: data.end,
			series: data.series ?? [],
			messageId: data.messageId
		};
		push(
			{
				kind: 'text',
				from: 'bot',
				text: `Showing ${result.indicator} — ${result.series.map((s) => s.country).join(', ')}`
			},
			{ kind: 'chart', result, idx: cardIdx++ }
		);
	}

	// -- Replay saved view (called from topicsSidebar)

	export async function replayView(view: {
		indicator: string;
		indicatorName?: string | null;
		countries: string[];
		startYear: number;
		endYear: number;
		mode: string;
		selectedYear?: number | null;
	}) {
		loading = true;
		push({ kind: 'text', from: 'bot', text: `Loading ${view.indicatorName ?? view.indicator}…` });

		try {
			const res = await fetch('/api/query/replay', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					indicator: view.indicator,
					countriesIso3: view.countries,
					start: view.startYear,
					end: view.endYear
				})
			});
			const data = await res.json().catch(() => null);

			messages = messages.slice(0, -1);

			if (!res.ok || !data?.series) {
				push({ kind: 'error', text: data?.error ?? 'Could not load saved view.' });
				loading = false;
				return;
			}

			pushChartResult({
				...data,
				indicatorCode: view.indicator,
				indicator: view.indicatorName ?? view.indicator,
				chart: view.mode,
				countries: view.countries,
				start: view.startYear,
				end: view.endYear
			});
		} catch {
			push({ kind: 'error', text: 'Network error replaying saved view.' });
		}
		loading = false;
	}

	// -- Save a chart result

	async function saveResult(result: DataResult, idx: number) {
		if (!user || saving) return;
		saving = result.messageId ?? `local-${idx}`;

		const res = await fetch('/api/save', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				label: `${result.indicator} (${result.chart}) ${result.start}–${result.end}`,
				mode: result.chart,
				indicator: result.indicatorCode,
				indicatorName: result.indicator,
				countries: result.countries,
				startYear: result.start,
				endYear: result.end,
				selectedYear: null,
				messageId: result.messageId
			})
		});
		const data = await res.json().catch(() => null);

		if (res.ok && data?.view) {
			messages = messages.map((m) =>
				m.kind === 'chart' && m.idx === idx
					? { ...m, result: { ...m.result, savedViewId: data.view.id } }
					: m
			);
			onSaveView(data.view);
		}
		saving = null;
	}
</script>

<!-- -- Template -->

<div class="chat-root" class:expanded>
	<!-- Header -->
	<header class="chat-header">
		<div>
			<span class="chat-title">Data Chat</span>
			<span class="chat-sub"> · World Bank · AI</span>
		</div>
		<!-- <button class="btn-icon" aria-label="toggle expand" onclick={() => (expanded = !expanded)}>
			{expanded ? '⤫' : '⤢'}
		</button> -->
	</header>

	<!-- Message list -->
	<div class="chat-list" bind:this={listEl}>
		{#each messages as m, i}
			{#if m.kind === 'text'}
				<div class="msg {m.from}">
					<span class="msg-text">{m.text}</span>
				</div>
			{:else if m.kind === 'error'}
				<div class="msg-error">
					<WarningIcon size="14" />
					{m.text}
				</div>
			{:else if m.kind === 'chart'}
				<div class="chart-card">
					<ChartCard result={m.result} />
					<div class="chart-footer">
						{#if user && !m.result.savedViewId}
							<button
								class="btn-save"
								disabled={!!saving}
								onclick={() => saveResult(m.result, m.idx)}
							>
								{saving ? '…' : '⭐ Save view'}
							</button>
						{:else if m.result.savedViewId}
							<span class="saved-badge"><CheckIcon size="12" /> Saved</span>
						{/if}
						<span class="chart-src">World Bank · {m.result.start}–{m.result.end}</span>
					</div>
				</div>
			{:else if m.kind === 'disambig'}
				<!-- Indicator picker card -->
				<div class="disambig-card">
					<div class="disambig-header">
						<span class="disambig-icon"><OptionIcon size="12" /></span>
						<div>
							<div class="disambig-title">Multiple indicators found for "{m.data.concept}"</div>
							<div class="disambig-sub">Pick the one you want:</div>
						</div>
					</div>

					<div class="candidate-list">
						{#each m.data.candidates as c}
							<button
								class="candidate"
								class:candidate-picked={m.data.pickedId === c.id}
								class:candidate-dimmed={m.data.pickedId && m.data.pickedId !== c.id}
								disabled={!!m.data.pickedId}
								onclick={() => pickCandidate(i, c)}
							>
								<div class="candidate-name">{c.name}</div>
								{#if c.source}
									<div class="candidate-src">{c.source}</div>
								{/if}
								{#if m.data.pickedId === c.id && m.data.loading}
									<div class="candidate-loading">Loading…</div>
								{/if}
							</button>
						{/each}
					</div>
				</div>
			{/if}
		{/each}

		{#if loading}
			<div class="msg bot"><span class="msg-text typing">Thinking</span></div>
		{/if}
	</div>

	<!-- Input -->
	<div class="input-row">
		<input
			class="chat-input"
			placeholder={'e.g. "CO₂ emissions France vs Germany 2000–2020"'}
			bind:value={input}
			disabled={loading}
			onkeydown={(e) => e.key === 'Enter' && handleSend()}
		/>
		<button class="btn-send" disabled={loading} onclick={handleSend}>
			{loading ? '…' : '→'}
		</button>
	</div>
</div>

<style>
	.chat-root {
		display: flex;
		flex-direction: column;
		background: #ffffff;
		color: #111827;
		overflow: hidden;
		height: 100%;
		min-height: 420px;
	}

	.chat-root.expanded {
		position: fixed;
		inset: 4vh 4vw;
		z-index: 1000;
		box-shadow: 0 24px 64px rgba(0, 0, 0, 0.18);
	}

	/* Header */
	.chat-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 12px 14px;
		border-bottom: 1px solid #e5e7eb;
		background: #ffffff;
		flex-shrink: 0;
	}

	.chat-title {
		font-weight: 700;
		font-size: 0.98rem;
		color: #111827;
	}

	.chat-sub {
		font-size: 0.8rem;
		color: #6b7280;
	}

	.btn-icon {
		background: transparent;
		border: none;
		font-size: 1rem;
		cursor: pointer;
		color: #374151;
	}

	/* Message list */
	.chat-list {
		flex: 1 1 0;
		overflow-y: auto;
		padding: 10px 12px;
		display: flex;
		flex-direction: column;
		gap: 10px;
		background: #ffffff;
	}

	/* Messages */
	.msg {
		display: flex;
		max-width: 92%;
	}

	.msg.user {
		align-self: flex-end;
		flex-direction: row-reverse;
	}

	.msg.bot {
		align-self: flex-start;
	}

	.msg-text {
		padding: 8px 11px;
		border: 1px solid #e5e7eb;
		border-radius: 10px;
		font-size: 0.87rem;
		line-height: 1.45;
		word-break: break-word;
		white-space: pre-wrap;
		background: #ffffff;
		color: #111827;
	}

	.msg.user .msg-text {
		background: #eff6ff;
		border-color: #bfdbfe;
	}

	.msg.bot .msg-text {
		background: #f9fafb;
	}

	/* Error */
	.msg-error {
		display: flex;
		gap: 8px;
		align-items: center;
		background: #fef2f2;
		border: 1px solid #fecaca;
		border-radius: 10px;
		padding: 10px 12px;
		color: #dc2626;
		font-size: 0.87rem;
		line-height: 1.45;
		align-self: flex-start;
		max-width: 92%;
	}

	/* Chart card */
	.chart-card {
		background: #ffffff;
		border: 1px solid #e5e7eb;
		border-radius: 10px;
		overflow: hidden;
		flex-shrink: 0;
	}

	.chart-footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 6px 12px 8px;
		border-top: 1px solid #e5e7eb;
		gap: 8px;
	}

	.btn-save {
		display: flex;
		gap: 4px;
		align-items: center;
		background: #eff6ff;
		border: 1px solid #bfdbfe;
		color: #0ea5e9;
		padding: 4px 10px;
		border-radius: 6px;
		font-size: 0.75rem;
		cursor: pointer;
		white-space: nowrap;
	}

	.btn-save:hover:not(:disabled) {
		background: #dbeafe;
	}

	.btn-save:disabled {
		opacity: 0.45;
		cursor: default;
	}

	.saved-badge {
		font-size: 0.75rem;
		color: #10b981;
	}

	.auth-hint {
		font-size: 0.74rem;
		color: #6b7280;
	}

	.auth-hint a {
		color: #0ea5e9;
	}

	.chart-src {
		font-size: 0.72rem;
		color: #9ca3af;
		margin-left: auto;
	}

	/* Disambiguation card */
	.disambig-card {
		background: #f0f9ff;
		border: 1px solid #bae6fd;
		border-radius: 10px;
		padding: 12px;
		display: flex;
		flex-direction: column;
		gap: 10px;
		align-self: flex-start;
		max-width: 100%;
	}

	.disambig-header {
		display: flex;
		gap: 10px;
		align-items: flex-start;
	}

	.disambig-icon {
		font-size: 1.2rem;
		flex-shrink: 0;
		margin-top: 2px;
		color: #0ea5e9;
	}

	.disambig-title {
		font-size: 0.9rem;
		font-weight: 600;
		color: #0ea5e9;
	}

	.disambig-sub {
		font-size: 0.78rem;
		color: #6b7280;
	}

	/* Candidates */
	/* Container list */
	.candidate-list {
		display: flex;
		flex-direction: column;
		gap: 6px;
		padding: 4px 0;
	}

	/* Base option */
	.candidate {
		background: #ffffff;
		border: 1px solid #e5e7eb;
		border-radius: 10px;
		padding: 10px 12px;
		cursor: pointer;
		text-align: left;

		display: flex;
		flex-direction: column;
		gap: 2px;

		transition:
			background 0.15s ease,
			transform 0.12s ease,
			box-shadow 0.15s ease;
	}

	/* Hover = lift, not color chaos */
	.candidate:hover:not(:disabled):not(.candidate-dimmed) {
		background: #f8fafc;
		border-color: #bae6fd;
		/*box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);*/
		transform: translateY(-1px);
	}

	/* Active / selected */
	.candidate-picked {
		background: #eff6ff !important;
		border-color: #0ea5e9 !important;
		/*box-shadow: 0 0 0 2px rgba(14, 165, 233, 0.15);*/
	}

	/* Disabled / dimmed state (more explicit than opacity only) */
	.candidate-dimmed {
		opacity: 0.55;
		pointer-events: none;
		filter: grayscale(0.2);
	}

	/* Title row */
	.candidate-name {
		font-size: 0.9rem;
		font-weight: 600;
		color: #0f172a;
	}

	/* Secondary info */
	.candidate-src {
		font-size: 0.75rem;
		color: #64748b;
	}

	/* Loading state */
	.candidate-loading {
		font-size: 0.75rem;
		color: #0ea5e9;
		font-style: italic;
		margin-top: 2px;
	}

	/* Optional: add a subtle left accent for selected item */
	.candidate-picked::before {
		content: '';
		width: 3px;
		height: 100%;
		background: #0ea5e9;
		position: absolute;
		left: 0;
		top: 0;
		border-radius: 10px 0 0 10px;
	}
	.candidate {
		position: relative;
	}
	/* Typing dots */
	.typing::after {
		content: '';
		animation: dots 1.2s steps(3, end) infinite;
	}

	@keyframes dots {
		0% {
			content: '';
		}
		33% {
			content: '.';
		}
		66% {
			content: '..';
		}
		100% {
			content: '...';
		}
	}

	/* Input */
	.input-row {
		display: flex;
		gap: 8px;
		padding: 10px 12px;
		border-top: 1px solid #e5e7eb;
		background: #ffffff;
		flex-shrink: 0;
	}

	.chat-input {
		flex: 1;
		padding: 9px 12px;
		border: 1px solid #e5e7eb;
		border-radius: 6px;
		background: #ffffff;
		color: #111827;
		font-size: 0.88rem;
	}

	.chat-input:focus {
		outline: none;
		border-color: #0ea5e9;
		box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.15);
	}

	.btn-send {
		color: #0ea5e9;
		border: 1px solid #bfdbfe;
		background: #eff6ff;
		padding: 9px 16px;
		border-radius: 8px;
		font-size: 1.1rem;
		cursor: pointer;
	}

	.btn-send:hover:not(:disabled) {
		background: #dbeafe;
	}

	.btn-send:disabled {
		opacity: 0.5;
		cursor: default;
	}
</style>
