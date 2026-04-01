import { parseUserQuery } from '$lib/ai/parser';
import { fetchWorldBankData } from '$lib/worldbank/api';
import { resolveIndicator } from '$lib/worldbank/resolver';
import { json } from '@sveltejs/kit';

// Simple mock dataset used for UI/testing. Real backend would query World Bank.
const EXAMPLE = {
    indicator: 'Population, total',
    indicatorCode: 'SP.POP.TOTL',
    series: [
        {
            country: 'Germany',
            code: 'DE',
            series: [
                { date: '2000', value: 82211508 },
                { date: '2005', value: 82422299 },
                { date: '2010', value: 81776930 },
                { date: '2015', value: 81686611 },
                { date: '2018', value: 82905782 },
                { date: '2020', value: 83149300 }
            ]
        },
        {
            country: 'France',
            code: 'FR',
            series: [
                { date: '2000', value: 60876136 },
                { date: '2005', value: 61318536 },
                { date: '2010', value: 62766373 },
                { date: '2015', value: 64395345 },
                { date: '2018', value: 67059887 },
                { date: '2020', value: 65273511 }
            ]
        }
    ]
};

export async function POST({ request }) {
    try {
        const body = await request.json().catch(() => ({}));
        // accept either `message` or `prompt` keys from client
        const message = body.message ?? body.prompt ?? body.text;
        console.log('Received query message:', message);
        if (!message) {
            return json({ error: 'Missing prompt in request body' }, { status: 400 });
        }

        const parsed = await parseUserQuery(message);
        // const parsed = {
        //     countriesiso3codes: ['DEU', 'FRA'],
        //     concept: 'population',
        //     indicator: 'SP.POP.TOTL',
        //     start: 2000,
        //     end: 2023,
        //     chart: 'line'
        // }
        if (!parsed) {
            return json({ error: 'Failed to parse query' }, { status: 400 });
        }

        const indicator = await resolveIndicator(parsed);

        const data = await fetchWorldBankData(
            parsed.countriesiso3codes,
            indicator,
            parsed.start,
            parsed.end
        );

        console.log('Fetched World Bank data:', data[0]?.country, data[0]?.series);

        return json({
            indicator,
            chart: parsed.chart,
            series: data
        });
    } catch (err) {
        console.error('/api/query error:', err);
        return json('Internal server error', { status: 500 });
    }
}
