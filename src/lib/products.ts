export interface Product {
  id: number;
  name: { us: string; uk: string };
  price: { usd: number; gbp: number };
  stock: number;
}

interface ProductsResponse {
  success: boolean;
  products: Product[];
}

export async function getProducts(): Promise<Product[]> {
  const res = await fetch('https://v0-api-endpoint-request.vercel.app/api/products', {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to fetch products');
  const data: ProductsResponse = await res.json();
  return data.products;
}

export async function getMoreProducts(): Promise<Product[]> {
  const res = await fetch('https://v0-api-endpoint-request.vercel.app/api/more-products', {
    cache: 'no-store',
  });
  if (!res.ok) return [];
  const data: ProductsResponse = await res.json();
  return data.products;
}
