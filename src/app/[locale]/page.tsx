import { notFound } from 'next/navigation';
import { isValidLocale, locales } from '@/lib/locale';
import { getProducts } from '@/lib/products';
import StoreClient from '@/components/StoreClient';

export default async function LocalePage({
  params,
}: {
  params: { locale: string };
}) {
  if (!isValidLocale(params.locale)) notFound();

  const locale = locales[params.locale];
  const products = await getProducts();

  return (
    <StoreClient
      initialProducts={products}
      locale={locale}
      localeKey={params.locale}
    />
  );
}
