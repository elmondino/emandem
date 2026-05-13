export type Region = 'uk' | 'us';

export interface LocaleConfig {
  currency: 'GBP' | 'USD';
  currencyLocale: string;
  region: Region;
  label: string;
}

export const locales: Record<string, LocaleConfig> = {
  uk: { currency: 'GBP', currencyLocale: 'en-GB', region: 'uk', label: 'United Kingdom' },
  us: { currency: 'USD', currencyLocale: 'en-US', region: 'us', label: 'United States' },
};

export function isValidLocale(locale: string): locale is keyof typeof locales {
  return Object.prototype.hasOwnProperty.call(locales, locale);
}

export function formatPrice(amount: number, config: LocaleConfig): string {
  return new Intl.NumberFormat(config.currencyLocale, {
    style: 'currency',
    currency: config.currency,
  }).format(amount);
}
