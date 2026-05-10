export interface DataSource {
	link: string;
	key: string;
	value: string;
}

export type DataResult = {
	indicatorCode: string;
	indicator: string;
	chart: ChartMode;
	countries: string[];
	start: number;
	end: number;
	series: SeriesRow[];
	messageId?: string;
	savedViewId?: string;
};

export type TV = { date: string; value: number | null };
export type SeriesRow = { country: string; code?: string; series: TV[] };
export type ChartMode = 'line' | 'bar';

export type Candidate = { id: string; name: string; source: string };

export type DisambigData = {
	concept: string;
	candidates: Candidate[];
	countries: string[];
	start: number;
	end: number;
	chart: string;
	messageId?: string;
	pickedId?: string;
	loading?: boolean;
};

export type Message =
	| { kind: 'text'; from: 'user' | 'bot'; text: string }
	| { kind: 'error'; text: string }
	| { kind: 'chart'; result: DataResult; idx: number }
	| { kind: 'disambig'; data: DisambigData; idx: number };
