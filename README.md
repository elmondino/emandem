# MeandEm Store

A multi-locale e-commerce storefront built with Next.js 13 App Router. Products are server-side rendered for instant first paint, with a second batch loaded client-side. Supports UK (GBP) and US (USD) locales with a scalable region system.

Live: **[https://emandem.vercel.app](https://emandem.vercel.app)**

---

## Tech Stack

| | |
|---|---|
| **Framework** | Next.js 13.4.19 (App Router) |
| **Language** | TypeScript 5.2.2 |
| **Styling** | Tailwind CSS v4.3.0 (CSS-first config, no `tailwind.config.js`) |
| **State** | React Context + localStorage (basket persistence) |
| **Unit tests** | Jest 29 + React Testing Library |
| **E2E tests** | Playwright (Chromium, against live Vercel deployment in CI) |
| **CI/CD** | GitHub Actions - type check, lint, Jest, Playwright, Vercel deploy |

---

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The root URL redirects to `/uk`.

---

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Production build |
| `npm run start` | Start the production server (after build) |
| `npm run lint` | Run ESLint with `next/core-web-vitals` rules |
| `npm test` | Run Jest unit and component tests |
| `npm run test:e2e` | Run Playwright e2e tests (against localhost by default) |

---

## Project Structure

```
src/
  app/
    layout.tsx              # Root layout - sets <html lang>, wraps BasketProvider
    page.tsx                # Root page - redirects / to /uk
    globals.css             # Global styles, Tailwind v4 import
    [locale]/
      layout.tsx            # Locale validation gate (notFound() for invalid locales)
      page.tsx              # Store page - async server component, SSR product fetch
      checkout/
        page.tsx            # Checkout page - quantity controls, place order
    api/
      more-products/
        route.ts            # CORS proxy for the slow more-products external API
  components/
    Navbar.tsx              # Sticky header with locale switcher and basket button
    BasketDrawer.tsx        # Slide-out basket drawer
    StoreClient.tsx         # Main store UI - product grid, handles all interactivity
  context/
    BasketContext.tsx        # Shared basket state with localStorage persistence
  lib/
    locale.ts               # Single source of truth for all locale/region config
    products.ts             # Product type and API fetch helpers (server-only)
  middleware.ts             # Extracts locale from URL, forwards as x-locale header
  __tests__/
    store.test.tsx          # 8 Jest component tests
e2e/
  store.spec.ts             # 10 Playwright e2e tests
```

---

## Architecture Notes

**SSR + deferred loading:** The store page is an async server component that fetches the initial product list before sending HTML to the browser - no loading spinner. A second batch of products is fetched client-side after mount via a Next.js API route (CORS proxy).

**Locale system:** All locale config lives in `src/lib/locale.ts`. Adding a new region requires one entry there - routing, formatting, and navigation update automatically. The `satisfies` operator ensures the config is type-safe while keeping `Region` derived from the object keys.

**Basket:** Stored in React Context and persisted to `localStorage`. All locale price variants are stored on each basket item so the checkout page works correctly without an API call, regardless of which locale the user is on.

**Security headers:** Defined in `next.config.js` - CSP, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, and `Referrer-Policy` on every response.

---

## CI/CD Pipeline

Three GitHub Actions jobs run in sequence on every push to `main`:

1. **test** - TypeScript type check, ESLint, Jest
2. **e2e** - Playwright tests against the live Vercel deployment (`BASE_URL=https://emandem.vercel.app`)
3. **deploy** - Vercel production deploy (only if both previous jobs pass, only on `main` push)

Pull requests run jobs 1 and 2 only (no deploy).

---

## Adding a New Locale

1. Add an entry to the `_locales` object in `src/lib/locale.ts`
2. That's it - routing, the locale switcher, `generateStaticParams`, and price formatting all pick it up automatically
