import { NextResponse } from 'next/server';
import { getMoreProducts } from '@/lib/products';

export async function GET() {
  try {
    const products = await getMoreProducts();
    return NextResponse.json({ success: true, products });
  } catch {
    return NextResponse.json({ success: false, products: [] }, { status: 500 });
  }
}
