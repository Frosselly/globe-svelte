// $lib/core/stores/savedStore.svelte.ts

export type SavedView = {
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

export type ChatMsg = {
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

function createSavedStore() {
	let views = $state<SavedView[]>([]);
	let chats = $state<ChatMsg[]>([]);
	let ready = $state(false);
	let deletingId = $state<string | null>(null);

	async function refresh() {
		try {
			const r = await fetch('/api/save');
			if (r.ok) {
				const d = await r.json();
				views = d.views ?? [];
				chats = d.messages ?? [];
			}
		} catch {}
		ready = true;
	}

	function addView(v: SavedView) {
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

	return {
		get views() {
			return views;
		},
		get chats() {
			return chats;
		},
		get ready() {
			return ready;
		},
		get deletingId() {
			return deletingId;
		},
		refresh,
		addView,
		deleteView
	};
}

export const savedStore = createSavedStore();
