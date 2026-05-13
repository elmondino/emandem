export interface LocaleConfig {
  currency: string;
  currencyLocale: string;
  region: string;
  flag: string;
  label: string;
}

// To add a new region, add one entry here - Region type and all routing update automatically.
const _locales = {
  uk: { currency: 'GBP', currencyLocale: 'en-GB', region: 'uk', flag: '\uD83C\uDDEC\uD83C\uDDE7', label: 'United Kingdom' },
  us: { currency: 'USD', currencyLocale: 'en-US', region: 'us', flag: '\uD83C\uDDFA\uD83C\uDDF8', label: 'United States' },
} satisfies Record<string, LocaleConfig>;

export const locales = _locales;
export type Region = keyof typeof locales;

export function isValidLocale(locale: string): locale is Region {
  return Object.prototype.hasOwnProperty.call(locales, locale);
}

export function formatPrice(amount: number, config: LocaleConfig): string {
  return new Intl.NumberFormat(config.currencyLocale, {
    style: 'currency',
    currency: config.currency,
  }).format(amount);
}
