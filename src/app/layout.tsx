import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { headers } from 'next/headers'
import { BasketProvider } from '@/context/BasketContext'
import { locales } from '@/lib/locale'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: "Michael's Amazing Web Store - MeandEm Test",
  description: 'Shop the latest products with fast delivery.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Read the locale forwarded by middleware so <html lang> is correct on first SSR render
  const locale = headers().get('x-locale') ?? 'uk';
  const lang = locale in locales ? locales[locale as keyof typeof locales].currencyLocale : 'en-GB';

  return (
    <html lang={lang}>
      <body className={inter.variable}>
        <BasketProvider>{children}</BasketProvider>
      </body>
    </html>
  )
}
