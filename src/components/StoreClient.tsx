'use client';

import { useState, useEffect, useRef } from 'react';
import { useBasket } from '@/context/BasketContext';
import { Product } from '@/lib/products';
import { LocaleConfig, formatPrice, Region } from '@/lib/locale';
import Navbar from '@/components/Navbar';
import BasketDrawer from '@/components/BasketDrawer';

interface Props {
  initialProducts: Product[];
  locale: LocaleConfig;
  localeKey: Region;
}

export default function StoreClient({ initialProducts, locale, localeKey }: Props) {
  const { addToCart, items: basketItems } = useBasket();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [loadingMore, setLoadingMore] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [addedId, setAddedId] = useState<number | null>(null);
  const addedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clean up the flash timer on unmount to prevent setState on unmounted component
  useEffect(() => {
    return () => { if (addedTimerRef.current) clearTimeout(addedTimerRef.current); };
  }, []);

  useEffect(() => {
    fetch('/api/more-products')
      .then(r => r.json())
      .then(data => {
        if (data.success && Array.isArray(data.products)) {
          setProducts(prev => {
            const existingIds = new Set(prev.map((p: Product) => p.id));
            const newOnes = data.products.filter((p: Product) => !existingIds.has(p.id));
            return newOnes.length > 0 ? [...prev, ...newOnes] : prev;
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoadingMore(false));
  }, []);

  const getProductName = (product: Product) =>
    product.name[locale.region as keyof typeof product.name] ?? product.name.uk;

  const getProductPrice = (product: Product) => {
    // Map ISO currency code to API price field; extend here when new currencies are added to the API
    const byCode: Record<string, number> = { GBP: product.price.gbp, USD: product.price.usd };
    const amount = byCode[locale.currency] ?? 0;
    return { raw: amount, formatted: formatPrice(amount, locale) };
  };

  const getBasketQuantity = (productId: number) =>
    basketItems.find(i => i.id === productId)?.quantity ?? 0;

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      names: Object.fromEntries(Object.entries(product.name) as [string, string][]),
      prices: { GBP: product.price.gbp, USD: product.price.usd },
    });
    if (addedTimerRef.current) clearTimeout(addedTimerRef.current);
    setAddedId(product.id);
    addedTimerRef.current = setTimeout(() => setAddedId(null), 1200);
  };

  return (
    <>
      <Navbar localeKey={localeKey} onBasketClick={() => setDrawerOpen(true)} />
      <BasketDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} locale={locale} localeKey={localeKey} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {locale.flag} {locale.label} Store
        </h1>
        <p className="text-gray-500 mb-8 text-sm">Click a product to add it to your basket.</p>

        {products.length === 0 && !loadingMore && (
          <div className="text-center py-20 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            <p className="text-base text-gray-500">Unable to load products right now.</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 text-sm text-indigo-600 hover:underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Skeleton grid while the initial fetch is in-flight */}
        {products.length === 0 && loadingMore && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 animate-pulse">
                <div className="h-5 bg-gray-200 rounded mb-3 w-3/4" />
                <div className="h-4 bg-gray-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        )}

        {/* Visually hidden live region announces basket additions to screen readers */}
        <div aria-live="polite" className="sr-only">
          {addedId !== null
            ? `${products.find(p => p.id === addedId)?.name[locale.region as keyof typeof products[0]['name']] ?? 'Item'} added to basket`
            : ''}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {products.map(product => {
            const { formatted } = getProductPrice(product);
            const added = addedId === product.id;
            const inStock = product.stock > 0;
            const atLimit = getBasketQuantity(product.id) >= product.stock;
            const canAdd = inStock && !atLimit;
            const badgeLabel = !inStock ? 'Out of stock' : atLimit ? 'Max qty' : added ? 'Added!' : '+ Add';
            return (
              <button
                key={product.id}
                onClick={() => { if (canAdd) handleAddToCart(product); }}
                disabled={!canAdd}
                aria-label={canAdd ? `Add ${getProductName(product)} to basket` : `${getProductName(product)} - ${badgeLabel}`}
                className={`group text-left bg-white rounded-2xl border transition-all duration-150 p-5 flex flex-col gap-2 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                  !canAdd
                    ? 'opacity-60 cursor-not-allowed border-gray-200'
                    : added
                    ? 'border-indigo-400 bg-indigo-50 hover:shadow-md'
                    : 'border-gray-200 hover:border-indigo-300 hover:shadow-md'
                }`}
              >
                <div className="flex-1">
                  <p className={`font-semibold text-base leading-snug transition-colors ${
                    !canAdd ? 'text-gray-400' : 'text-gray-900 group-hover:text-indigo-700'
                  }`}>
                    {getProductName(product)}
                  </p>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-lg font-bold text-gray-900">{formatted}</span>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full transition-all duration-150 ${
                    !canAdd
                      ? 'bg-gray-100 text-gray-400'
                      : added
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-500 group-hover:bg-indigo-100 group-hover:text-indigo-700'
                  }`}>
                    {badgeLabel}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {loadingMore && (
          <div className="flex items-center justify-center gap-2 mt-10 text-gray-400 text-sm">
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Loading more products...
          </div>
        )}
      </main>
    </>
  );
}

