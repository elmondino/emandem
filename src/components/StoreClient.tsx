'use client';

import { useState, useEffect } from 'react';
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
  const { addToCart } = useBasket();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [loadingMore, setLoadingMore] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [addedId, setAddedId] = useState<number | null>(null);

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

  const getProductName = (product: Product) => product.name[locale.region];

  const getProductPrice = (product: Product) => {
    const amount = locale.currency === 'GBP' ? product.price.gbp : product.price.usd;
    return { raw: amount, formatted: formatPrice(amount, locale) };
  };

  const handleAddToCart = (product: Product) => {
    const { raw } = getProductPrice(product);
    addToCart({ id: product.id, name: getProductName(product), price: raw });
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1200);
  };

  return (
    <>
      <Navbar localeKey={localeKey} onBasketClick={() => setDrawerOpen(true)} />
      <BasketDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} locale={locale} localeKey={localeKey} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {locale.label === 'United Kingdom' ? '🇬🇧' : '🇺🇸'} {locale.label} Store
        </h1>
        <p className="text-gray-500 mb-8 text-sm">Click a product to add it to your basket.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {products.map(product => {
            const { formatted } = getProductPrice(product);
            const added = addedId === product.id;
            return (
              <button
                key={product.id}
                onClick={() => handleAddToCart(product)}
                aria-label={`Add ${getProductName(product)} to basket`}
                className={`group text-left bg-white rounded-2xl border transition-all duration-150 p-5 flex flex-col gap-2 shadow-sm hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${added ? 'border-indigo-400 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'}`}
              >
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 text-base leading-snug group-hover:text-indigo-700 transition-colors">
                    {getProductName(product)}
                  </p>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-lg font-bold text-gray-900">{formatted}</span>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full transition-all duration-150 ${added ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500 group-hover:bg-indigo-100 group-hover:text-indigo-700'}`}>
                    {added ? 'Added!' : '+ Add'}
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

