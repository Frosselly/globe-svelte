import fs from 'fs/promises';
import path from 'path';

const CACHE_PATH = path.resolve('data/indicators.json');
const CACHE_TTL = 1000 * 60 * 60 * 24 * 7; // 7 days

const WB_INDICATOR_URL = 'https://api.worldbank.org/v2/indicator?format=json&per_page=20000';

export interface Indicator {
	id: string;
	name: string;
	source?: string;
	topic?: string;
}

/* Main Entry */

export async function getIndicators(): Promise<Indicator[]> {
	try {
		const cached = await readCache();
		if (cached) return cached;

		const fresh = await fetchIndicators();
		await writeCache(fresh);
		return fresh;
	} catch (err) {
		console.error('Indicator registry error:', err);
		return [];
	}
}

/* Cache Layer */

async function readCache(): Promise<Indicator[] | null> {
	try {
		const stat = await fs.stat(CACHE_PATH);
		const age = Date.now() - stat.mtimeMs;

		if (age < CACHE_TTL) {
			const raw = await fs.readFile(CACHE_PATH, 'utf-8');
			return JSON.parse(raw);
		}

		return null;
	} catch {
		return null;
	}
}

async function writeCache(data: Indicator[]) {
	await fs.mkdir(path.dirname(CACHE_PATH), { recursive: true });
	await fs.writeFile(CACHE_PATH, JSON.stringify(data, null, 2));
}

/* World Bank Fetch */

async function fetchIndicators(): Promise<Indicator[]> {
	// console.log('Fetching World Bank indicator registry...');

	const res = await fetch(WB_INDICATOR_URL);
	const json = await res.json();

	if (!Array.isArray(json) || !json[1]) {
		throw new Error('Invalid World Bank indicator response');
	}

	return json[1].map((i: any) => ({
		id: i.id,
		name: i.name,
		topic: i.topics?.[0]?.value,
		source: i.source?.value
	}));
}

/* Availability Check */

export async function indicatorExists(countries: string[], indicator: string): Promise<boolean> {
	const clist = countries.join(';');

	const url = `https://api.worldbank.org/v2/country/${clist}/indicator/${indicator}?format=json&per_page=5`;
	// console.log('Checking indicator availability with URL:', url);
	const res = await fetch(url);
	const json = await res.json();

	return Array.isArray(json) && json[1] && json[1].length > 0;
}
