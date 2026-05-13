import { NextResponse } from 'next/server';

export async function GET() {
  const res = await fetch('https://v0-api-endpoint-request.vercel.app/api/more-products', {
    cache: 'no-store',
  });

  if (!res.ok) {
    return NextResponse.json({ success: false, products: [] }, { status: res.status });
  }

  const data = await res.json();
  return NextResponse.json(data);
}
