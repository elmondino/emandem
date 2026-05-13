import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Extracts the locale from the URL path (e.g. /uk/checkout -> "uk")
 * and forwards it as a request header so the root layout can set
 * <html lang="..."> server-side without needing client-side JS.
 */
export function middleware(request: NextRequest) {
  const locale = request.nextUrl.pathname.split('/')[1] ?? '';
  const response = NextResponse.next();
  response.headers.set('x-locale', locale);
  return response;
}

export const config = {
  // Run on all routes except Next.js internals and static assets
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
