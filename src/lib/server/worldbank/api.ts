export async function fetchWorldBankData(
    countries: string[],
    indicator: string,
    start: number,
    end: number
) {
    const clist = countries.join(';');

    const url = `https://api.worldbank.org/v2/country/${clist}/indicator/${indicator}?format=json&per_page=1000&date=${start}:${end}`;

    const res = await fetch(url);
    const data = await res.json();

    const obs = data && data[1] ? data[1] : [];

    // Group observations by country (use ISO3 if available, fallback to country.id)
    const byCountry: Record<string, any[]> = {};
    for (const o of obs) {
        const key = o.countryiso3code || (o.country && o.country.id) || 'UNKNOWN';
        if (!byCountry[key]) byCountry[key] = [];
        byCountry[key].push(o);
    }

    // Build a contiguous series per country for each year in the requested range
    const years: string[] = [];
    for (let y = start; y <= end; y++) years.push(String(y));

    const result = Object.keys(byCountry).map((iso3) => {
        const list = byCountry[iso3];
        const sample = list && list.length ? list[0] : null;
        const countryName = sample && sample.country ? sample.country.value : iso3;
        const code = sample && sample.country ? sample.country.id : undefined;

        const series = years.map((yr) => {
            const found = list.find((x: any) => x.date === yr);
            return { date: yr, value: found ? (found.value === null ? null : found.value) : null };
        });

        return { country: countryName, code, series };
    });

    return result;
}
