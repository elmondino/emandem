'use client';

import Link from 'next/link';
import { useBasket } from '@/context/BasketContext';
import { Region, locales } from '@/lib/locale';

interface Props {
  localeKey: Region;
  onBasketClick: () => void;
}

export default function Navbar({ localeKey, onBasketClick }: Props) {
  const { items } = useBasket();
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href={`/${localeKey}`} className="text-xl font-bold text-gray-900 tracking-tight">
          MeandEm
        </Link>

        <div className="flex items-center gap-3">
          {/* Locale toggle pill */}
          <div className="flex items-center bg-gray-100 rounded-full p-1 gap-1" role="tablist" aria-label="Select region">
            {(['uk', 'us'] as Region[]).map(loc => (
              <Link
                key={loc}
                href={`/${loc}`}
                role="tab"
                aria-selected={localeKey === loc}
                aria-label={
                  localeKey === loc
                    ? `${locales[loc].label} (current)`
                    : `Switch to ${locales[loc].label}`
                }
                className={`text-sm font-medium px-3 py-1 rounded-full transition-colors ${
                  localeKey === loc
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                {loc === 'uk' ? '🇬🇧 UK' : '🇺🇸 US'}
              </Link>
            ))}
          </div>

          <button
            onClick={onBasketClick}
            className="relative flex items-center gap-2 bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-gray-700 transition-colors"
            aria-label={`Open basket, ${totalItems} ${totalItems === 1 ? 'item' : 'items'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.5 6h13M7 13L5.4 5M10 21a1 1 0 100-2 1 1 0 000 2zm7 0a1 1 0 100-2 1 1 0 000 2z" />
            </svg>
            <span>Basket</span>
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-indigo-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
