'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from '@/app/page.module.css';
import { useBasket } from '@/context/BasketContext';
import { Product } from '@/lib/products';
import { LocaleConfig, formatPrice } from '@/lib/locale';

interface Props {
  initialProducts: Product[];
  locale: LocaleConfig;
  localeKey: string;
}

export default function StoreClient({ initialProducts, locale, localeKey }: Props) {
  const router = useRouter();
  const { items, addToCart } = useBasket();
  const [products, setProducts] = useState<Product[]>(initialProducts);

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
      .catch(() => {});
  }, []);

  const getProductName = (product: Product) => product.name[locale.region];

  const getProductPrice = (product: Product) => {
    const amount = locale.currency === 'GBP' ? product.price.gbp : product.price.usd;
    return formatPrice(amount, locale);
  };

  const getRawPrice = (product: Product) =>
    locale.currency === 'GBP' ? product.price.gbp : product.price.usd;

  return (
    <main className={styles.main}>
      <div className={styles.description}>
        <p>Michael&apos;s Amazing Web Store</p>
        <div>
          <button
            className={styles.basket}
            onClick={() => router.push(`/${localeKey}/checkout`)}
          >
            {(() => {
              const total = items.reduce((sum, item) => sum + item.quantity, 0);
              return `Basket: ${total} ${total === 1 ? 'item' : 'items'}`;
            })()}
          </button>
          {items.map(item => (
            <div key={item.id}>{item.name} count: {item.quantity}</div>
          ))}
        </div>
      </div>

      <div className={styles.grid}>
        {products.map(product => (
          <button
            key={product.id}
            className={styles.card}
            onClick={() =>
              addToCart({
                id: product.id,
                name: getProductName(product),
                price: getRawPrice(product),
              })
            }
            aria-label="Add to basket"
          >
            <h2>{getProductName(product)} <span>-&gt;</span></h2>
            <p>{getProductPrice(product)}</p>
          </button>
        ))}
      </div>
    </main>
  );
}
