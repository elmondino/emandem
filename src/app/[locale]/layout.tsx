import { BasketProvider } from '@/context/BasketContext';
import { isValidLocale } from '@/lib/locale';
import { notFound } from 'next/navigation';
import { ReactNode } from 'react';

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

  return <BasketProvider>{children}</BasketProvider>;
}
