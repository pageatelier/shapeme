export type LanguageCode = "ko" | "en";
export type CountryCode = "KR" | "JP" | "US" | "GB" | "MY" | "ES" | "FR" | "ID" | "TH" | "OTHER";

/** Single source of truth for the language/country pickers — shared by the
 * onboarding Language & Region step and /my/settings' LanguageRegionSettings,
 * so both write and read the same option set. */
export const LANGUAGE_OPTIONS: { value: LanguageCode; label: string }[] = [
  { value: "ko", label: "한국어" },
  { value: "en", label: "English" },
];

export const COUNTRY_OPTIONS: { value: CountryCode; label: string }[] = [
  { value: "KR", label: "대한민국" },
  { value: "JP", label: "일본" },
  { value: "US", label: "미국" },
  { value: "GB", label: "영국" },
  { value: "MY", label: "말레이시아" },
  { value: "ES", label: "스페인" },
  { value: "FR", label: "프랑스" },
  { value: "ID", label: "인도네시아" },
  { value: "TH", label: "태국" },
  { value: "OTHER", label: "기타" },
];

export type WeightUnit = "kg" | "lb";
export type HeightUnit = "cm" | "ft";

export type RegionLocaleConfig = {
  weightUnit: WeightUnit;
  heightUnit: HeightUnit;
  /** Display-only format tokens (YYYY/MM/DD), not a parser format string. */
  dateFormat: string;
  weekStartDay: "sun" | "mon";
  /** ISO 4217 currency code. */
  currency: string;
};

const REGION_LOCALE_CONFIG: Record<CountryCode, RegionLocaleConfig> = {
  KR: { weightUnit: "kg", heightUnit: "cm", dateFormat: "YYYY.MM.DD", weekStartDay: "sun", currency: "KRW" },
  JP: { weightUnit: "kg", heightUnit: "cm", dateFormat: "YYYY/MM/DD", weekStartDay: "sun", currency: "JPY" },
  US: { weightUnit: "lb", heightUnit: "ft", dateFormat: "MM/DD/YYYY", weekStartDay: "sun", currency: "USD" },
  GB: { weightUnit: "kg", heightUnit: "cm", dateFormat: "DD/MM/YYYY", weekStartDay: "mon", currency: "GBP" },
  MY: { weightUnit: "kg", heightUnit: "cm", dateFormat: "DD/MM/YYYY", weekStartDay: "mon", currency: "MYR" },
  ES: { weightUnit: "kg", heightUnit: "cm", dateFormat: "DD/MM/YYYY", weekStartDay: "mon", currency: "EUR" },
  FR: { weightUnit: "kg", heightUnit: "cm", dateFormat: "DD/MM/YYYY", weekStartDay: "mon", currency: "EUR" },
  ID: { weightUnit: "kg", heightUnit: "cm", dateFormat: "DD/MM/YYYY", weekStartDay: "mon", currency: "IDR" },
  TH: { weightUnit: "kg", heightUnit: "cm", dateFormat: "DD/MM/YYYY", weekStartDay: "mon", currency: "THB" },
  OTHER: { weightUnit: "kg", heightUnit: "cm", dateFormat: "YYYY-MM-DD", weekStartDay: "mon", currency: "USD" },
};

/**
 * Region → unit/format/currency defaults, for later localization work
 * (kg/lb, cm/ft, date display, week-start default, payment currency) — not
 * wired into any of those features yet, this just gives them one shared
 * place to read from once they're built.
 */
export function getRegionLocaleConfig(country: string): RegionLocaleConfig {
  return REGION_LOCALE_CONFIG[country as CountryCode] ?? REGION_LOCALE_CONFIG.OTHER;
}

/**
 * Best-guess language/country from the browser, for prefilling the
 * onboarding Language & Region step so a user whose locale we recognize can
 * just tap Continue. Falls back to ko/KR — this app's primary market — for
 * anything unrecognized. Client-only (reads navigator.language).
 */
export function detectBrowserLocaleDefaults(): { language: LanguageCode; country: CountryCode } {
  if (typeof navigator === "undefined") return { language: "ko", country: "KR" };
  const locale = navigator.language || "ko-KR";
  const [langPart, regionPart] = locale.split("-");
  const language = LANGUAGE_OPTIONS.some((o) => o.value === langPart) ? (langPart as LanguageCode) : "ko";
  const regionUpper = regionPart?.toUpperCase();
  const country = COUNTRY_OPTIONS.some((o) => o.value === regionUpper) ? (regionUpper as CountryCode) : "KR";
  return { language, country };
}
