'use client';

import { useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useBasket } from '@/context/BasketContext';
import { LocaleConfig, formatPrice, Region } from '@/lib/locale';

interface Props {
  open: boolean;
  onClose: () => void;
  locale: LocaleConfig;
  localeKey: Region;
}

export default function BasketDrawer({ open, onClose, locale, localeKey }: Props) {
  const router = useRouter();
  const { items, updateQuantity, removeFromCart } = useBasket();
  const drawerRef = useRef<HTMLDivElement>(null);

  // Prevent keyboard focus reaching hidden drawer
  useEffect(() => {
    const el = drawerRef.current;
    if (!el) return;
    if (open) {
      el.removeAttribute('inert');
    } else {
      el.setAttribute('inert', '');
    }
  }, [open]);

  // Both prices are stored on every item - always display in the current locale's currency
  const getPrice = (item: { priceGBP: number; priceUSD: number }) =>
    locale.currency === 'GBP' ? item.priceGBP : item.priceUSD;
  const fmt = (amount: number) => formatPrice(amount, locale);
  const getItemName = (item: { nameUK: string; nameUS: string }) =>
    localeKey === 'uk' ? item.nameUK : item.nameUS;
  const grandTotal = items.reduce((sum, item) => sum + getPrice(item) * item.quantity, 0);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Drawer panel */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-label="Shopping basket"
        aria-modal="true"
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Your basket {totalItems > 0 && <span className="text-gray-400 font-normal text-sm">({totalItems} {totalItems === 1 ? 'item' : 'items'})</span>}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500"
            aria-label="Close basket"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.5 6h13M7 13L5.4 5M10 21a1 1 0 100-2 1 1 0 000 2zm7 0a1 1 0 100-2 1 1 0 000 2z" />
              </svg>
              <p className="text-sm">Your basket is empty</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {items.map(item => (
                <li key={item.id} className="py-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{getItemName(item)}</p>
                    <p className="text-sm text-gray-500">{fmt(getPrice(item))} each</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors text-sm font-bold"
                      aria-label={`Decrease quantity of ${getItemName(item)}`}
                    >
                      -
                    </button>
                    <span className="w-6 text-center text-sm font-medium tabular-nums">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors text-sm font-bold"
                      aria-label={`Increase quantity of ${getItemName(item)}`}
                    >
                      +
                    </button>
                  </div>
                  <div className="text-right min-w-16">
                    <p className="text-sm font-semibold text-gray-900">{fmt(getPrice(item) * item.quantity)}</p>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-1.5 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                    aria-label={`Remove ${getItemName(item)} from basket`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center mb-4">
              <span className="text-base font-medium text-gray-700">Total</span>
              <span className="text-xl font-bold text-gray-900">{fmt(grandTotal)}</span>
            </div>
            <button
              onClick={() => { onClose(); router.push(`/${localeKey}/checkout`); }}
              className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-xl hover:bg-indigo-700 transition-colors"
            >
              Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
}
