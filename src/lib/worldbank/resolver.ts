import { indicatorExists } from './indicators';

export async function resolveIndicator(parsed: any) {
    if (parsed.indicator) {
        const ok = await indicatorExists(parsed.countriesiso3codes, parsed.indicator);
        if (ok) return parsed.indicator;
    }

    const fallbackMap: Record<string, string[]> = {
        poverty: [
            'SI.POV.SOCI',
            'SI.POV.NAHC',
            'SI.POV.UMIC',
            'SI.POV.LMIC',
            'SI.POV.DDAY'
        ],
        population: ['SP.POP.TOTL'],
        gdp: ['NY.GDP.MKTP.CD']
    };

    for (const ind of fallbackMap[parsed.concept] || []) {
        if (await indicatorExists(parsed.countriesiso3codes, ind)) {
            return ind;
        }
    }

    throw new Error('No suitable indicator found');
}
