'use client';

import { useBasket } from '@/context/BasketContext';
import styles from '@/app/page.module.css';
import Link from 'next/link';
import { isValidLocale, locales, formatPrice } from '@/lib/locale';

export default function CheckoutPage({ params }: { params: { locale: string } }) {
  const { items } = useBasket();
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const locale = isValidLocale(params.locale) ? locales[params.locale] : locales.uk;
  const fmt = (amount: number) => formatPrice(amount, locale);
  const grandTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <main className={styles.main}>
      <div className={styles.description}>
        <p>Checkout</p>
      </div>
      <div>
        {items.length === 0 ? (
          <p>Your basket is empty.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Price each</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.quantity}</td>
                  <td>{fmt(item.price)}</td>
                  <td>{fmt(item.price * item.quantity)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td><strong>Total items</strong></td>
                <td><strong>{totalItems}</strong></td>
                <td></td>
                <td><strong>{fmt(grandTotal)}</strong></td>
              </tr>
            </tfoot>
          </table>
        )}
        <Link href={`/${params.locale}`}>Continue shopping</Link>
      </div>
    </main>
  );
}
