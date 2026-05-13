import { notFound } from 'next/navigation';
import { isValidLocale, locales } from '@/lib/locale';
import { getProducts } from '@/lib/products';
import StoreClient from '@/components/StoreClient';

export function generateStaticParams() {
  return Object.keys(locales).map(locale => ({ locale }));
}

export default async function LocalePage({
  params,
}: {
  params: { locale: string };
}) {
  if (!isValidLocale(params.locale)) notFound();

  const locale = locales[params.locale];
  let products: Awaited<ReturnType<typeof getProducts>> = [];
  try {
    products = await getProducts();
  } catch {
    // API unavailable - render with empty list rather than crashing
  }

  return (
    <StoreClient
      initialProducts={products}
      locale={locale}
      localeKey={params.locale}
    />
  );
}
