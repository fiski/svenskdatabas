/**
 * Country helpers for the Data page charts.
 *
 * Two directions are needed:
 *   - ISO code  -> Swedish name  (owner countries: koncern.agareLand is an ISO code)
 *   - Swedish name -> ISO code   (manufacturing: tillverkningslander are Swedish names,
 *                                 the Flag component needs an ISO code)
 *
 * Manufacturing data also carries some noise we normalize away:
 *   "SE" (ISO instead of name), "Poland" (English), "Sverige (begränsat)" (qualifier).
 */

// ISO 3166-1 alpha-2 -> Swedish country name.
export const ISO_TO_SV: Record<string, string> = {
  SE: 'Sverige',
  US: 'USA',
  CN: 'Kina',
  FI: 'Finland',
  DE: 'Tyskland',
  DK: 'Danmark',
  NO: 'Norge',
  NL: 'Nederländerna',
  CH: 'Schweiz',
  JP: 'Japan',
  FR: 'Frankrike',
  IT: 'Italien',
  HK: 'Hongkong',
  BH: 'Bahrain',
  GB: 'Storbritannien',
  ES: 'Spanien',
  BE: 'Belgien',
  AT: 'Österrike',
  CA: 'Kanada',
  PL: 'Polen',
  PT: 'Portugal',
};

// Swedish country name -> ISO 3166-1 alpha-2 (for flags on the manufacturing chart).
export const SV_TO_ISO: Record<string, string> = {
  Sverige: 'SE',
  USA: 'US',
  Kina: 'CN',
  Finland: 'FI',
  Tyskland: 'DE',
  Danmark: 'DK',
  Norge: 'NO',
  Nederländerna: 'NL',
  Schweiz: 'CH',
  Japan: 'JP',
  Frankrike: 'FR',
  Italien: 'IT',
  Hongkong: 'HK',
  Bahrain: 'BH',
  Storbritannien: 'GB',
  Spanien: 'ES',
  Belgien: 'BE',
  Österrike: 'AT',
  Kanada: 'CA',
  Polen: 'PL',
  Portugal: 'PT',
  Vietnam: 'VN',
  Turkiet: 'TR',
  Bangladesh: 'BD',
  Indien: 'IN',
  Estland: 'EE',
  Brasilien: 'BR',
  Taiwan: 'TW',
  Rumänien: 'RO',
  Tunisien: 'TN',
  Thailand: 'TH',
  Indonesien: 'ID',
  Lettland: 'LV',
  Litauen: 'LT',
  Sydkorea: 'KR',
  Slovakien: 'SK',
  Slovenien: 'SI',
  Irland: 'IE',
  Ungern: 'HU',
  Tjeckien: 'CZ',
  Mexiko: 'MX',
  'Sri Lanka': 'LK',
  Myanmar: 'MM',
  Kambodja: 'KH',
  Nordmakedonien: 'MK',
};

// Vague/region labels that are not a single country. Collapsed into one bar.
export const REGION_LABELS = new Set<string>([
  'Europa',
  'Asien',
  'Afrika',
  'Nordamerika',
  'Sydamerika',
  'Oceanien',
  'Mellanöstern',
  'Globalt',
  'Världen',
  'Internationellt',
  'Utomlands',
]);

// Fix up known data-entry variants before matching against the maps above.
const SYNONYMS: Record<string, string> = {
  SE: 'Sverige',
  Poland: 'Polen',
  England: 'Storbritannien',
  UK: 'Storbritannien',
};

/**
 * Normalize a raw manufacturing-country string: trim, drop parenthetical
 * qualifiers ("Sverige (begränsat)" -> "Sverige"), and map known variants.
 */
export function normalizeCountryName(raw: string): string {
  const stripped = raw.replace(/\s*\([^)]*\)/g, '').trim();
  return SYNONYMS[stripped] ?? stripped;
}
