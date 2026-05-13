'use client';

import Link from 'next/link';
import { useBasket } from '@/context/BasketContext';
import { isValidLocale, locales, formatPrice } from '@/lib/locale';

export default function CheckoutPage({ params }: { params: { locale: string } }) {
  const { items, updateQuantity, removeFromCart } = useBasket();
  const locale = isValidLocale(params.locale) ? locales[params.locale] : locales.uk;
  // Per-item: use the currency the item was added in; grand total uses current locale
  const fmtItem = (amount: number, currency: 'GBP' | 'USD') => {
    const cfg = Object.values(locales).find(l => l.currency === currency) ?? locale;
    return formatPrice(amount, cfg);
  };
  const fmt = (amount: number) => formatPrice(amount, locale);
  const grandTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Checkout</h1>
          <Link
            href={`/${params.locale}`}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Continue shopping
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        {items.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.5 6h13M7 13L5.4 5M10 21a1 1 0 100-2 1 1 0 000 2zm7 0a1 1 0 100-2 1 1 0 000 2z" />
            </svg>
            <p className="text-gray-500 mb-4">Your basket is empty.</p>
            <Link
              href={`/${params.locale}`}
              className="inline-block bg-indigo-600 text-white font-semibold px-6 py-2.5 rounded-full hover:bg-indigo-700 transition-colors"
            >
              Start shopping
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Item list */}
            <ul className="divide-y divide-gray-100">
              {items.map(item => (
                <li key={item.id} className="px-6 py-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{item.name}</p>
                    <p className="text-sm text-gray-500">{fmtItem(item.price, item.currency)} each</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors font-bold"
                      aria-label={`Decrease quantity of ${item.name}`}
                    >
                      -
                    </button>
                    <span className="w-6 text-center font-medium tabular-nums">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors font-bold"
                      aria-label={`Increase quantity of ${item.name}`}
                    >
                      +
                    </button>
                  </div>
                  <div className="text-right min-w-20">
                    <p className="font-semibold text-gray-900">{fmtItem(item.price * item.quantity, item.currency)}</p>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-2 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                    aria-label={`Remove ${item.name}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>

            {/* Summary */}
            <div className="px-6 py-5 bg-gray-50 border-t border-gray-200">
              <div className="flex justify-between items-center text-sm text-gray-500 mb-2">
                <span>Subtotal ({totalItems} {totalItems === 1 ? 'item' : 'items'})</span>
                <span>{fmt(grandTotal)}</span>
              </div>
              <div className="flex justify-between items-center text-base font-bold text-gray-900 mb-6">
                <span>Total</span>
                <span>{fmt(grandTotal)}</span>
              </div>
              <button
                className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-xl hover:bg-indigo-700 transition-colors"
              >
                Place order
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

