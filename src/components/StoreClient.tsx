'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from '@/app/page.module.css';
import { useBasket } from '@/context/BasketContext';
import { Product } from '@/lib/products';
import { LocaleConfig, formatPrice, Region } from '@/lib/locale';

interface Props {
  initialProducts: Product[];
  locale: LocaleConfig;
  localeKey: Region;
}

export default function StoreClient({ initialProducts, locale, localeKey }: Props) {
  const router = useRouter();
  const { items, addToCart } = useBasket();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [loadingMore, setLoadingMore] = useState(true);

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

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <main className={styles.main}>
      <div className={styles.description}>
        <p>Michael&apos;s Amazing Web Store</p>
        <div>
          <button
            className={styles.basket}
            onClick={() => router.push(`/${localeKey}/checkout`)}
          >
            Basket: {totalItems} {totalItems === 1 ? 'item' : 'items'}
          </button>
        </div>
      </div>

      <div className={styles.grid}>
        {products.map(product => {
          const { raw, formatted } = getProductPrice(product);
          return (
            <button
              key={product.id}
              className={styles.card}
              onClick={() =>
                addToCart({
                  id: product.id,
                  name: getProductName(product),
                  price: raw,
                })
              }
              aria-label={`Add ${getProductName(product)} to basket`}
            >
              <span className={styles.cardTitle}>{getProductName(product)} <span>-&gt;</span></span>
              <p>{formatted}</p>
            </button>
          );
        })}
      </div>
      {loadingMore && <p className={styles.loadingMore}>Loading more products...</p>}
    </main>
  );
}
