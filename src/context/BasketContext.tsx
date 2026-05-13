'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface BasketItem {
  id: number;
  /** Display names keyed by region (e.g. 'uk', 'us', 'de'). Resolved at render from current locale. */
  names: Record<string, string>;
  /** Prices keyed by ISO currency code (e.g. 'GBP', 'USD', 'EUR'). Resolved at render from current locale. */
  prices: Record<string, number>;
  quantity: number;
}

interface BasketContextValue {
  items: BasketItem[];
  addToCart: (product: { id: number; names: Record<string, string>; prices: Record<string, number> }) => void;
  updateQuantity: (id: number, quantity: number) => void;
  removeFromCart: (id: number) => void;
  clearBasket: () => void;
}

const BasketContext = createContext<BasketContextValue | null>(null);

export function BasketProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<BasketItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Restore persisted basket from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('basket');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Validate shape to discard data from old schema versions
        const valid = Array.isArray(parsed)
          ? parsed.filter(
              (item): item is BasketItem =>
                typeof item?.id === 'number' &&
                item?.names !== null && typeof item?.names === 'object' &&
                item?.prices !== null && typeof item?.prices === 'object' &&
                typeof item?.quantity === 'number'
            )
          : [];
        if (valid.length > 0) setItems(valid);
      }
    } catch {}
    setHydrated(true);
  }, []);

  // Persist basket to localStorage after hydration
  useEffect(() => {
    if (hydrated) localStorage.setItem('basket', JSON.stringify(items));
  }, [items, hydrated]);

  const addToCart = (product: { id: number; names: Record<string, string>; prices: Record<string, number> }) => {
    setItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity < 1) {
      // decrement below 1 removes the item
      setItems(prev => prev.filter(item => item.id !== id));
      return;
    }
    setItems(prev => prev.map(item => item.id === id ? { ...item, quantity } : item));
  };

  const removeFromCart = (id: number) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const clearBasket = () => setItems([]);

  return (
    <BasketContext.Provider value={{ items, addToCart, updateQuantity, removeFromCart, clearBasket }}>
      {children}
    </BasketContext.Provider>
  );
}

export function useBasket() {
  const ctx = useContext(BasketContext);
  if (!ctx) throw new Error('useBasket must be used within BasketProvider');
  return ctx;
}
