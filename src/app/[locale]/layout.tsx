import { isValidLocale, locales } from '@/lib/locale';
import { notFound } from 'next/navigation';
import { ReactNode } from 'react';
import { LocaleHtmlLang } from '@/components/LocaleHtmlLang';

export default function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { locale: string };
}) {
  if (!isValidLocale(params.locale)) {
    notFound();
  }

  return (
    <>
      <LocaleHtmlLang lang={locales[params.locale].currencyLocale} />
      {children}
    </>
  );
}
