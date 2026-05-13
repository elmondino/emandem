import { locales } from '@/lib/locale';
import type { Region } from '@/lib/locale';
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
  // Locale validation is handled by [locale]/layout.tsx before this page renders
  const locale = locales[params.locale as Region];
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
      localeKey={params.locale as Region}
    />
  );
}
