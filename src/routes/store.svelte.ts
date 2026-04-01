// import { getCountryGeneralInfo } from "$lib/components/countryData/country-general";
import { getCountryHealthInfo } from "$lib/components/countryData/country-health";
import { getCountryMetadataClean } from "$lib/components/countryData/country-metadata";
import type { FullCountryData } from "$lib/components/countryData/types/c_full";

let countryData: FullCountryData | undefined = $state(undefined);
export async function load(iso3: string) {
  const meta = await getCountryMetadataClean(iso3);
  if (!meta) return;
  // const general = await getCountryGeneralInfo(meta.region, meta.cca2);
  const health = await getCountryHealthInfo(meta.name);

  countryData = {
    metadata: meta,
    // generalInfo: general,
    healthInfo: health
  };
  return countryData;
}

export function getCountryData() {
  return countryData;
}