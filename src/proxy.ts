import { NextResponse, type NextRequest } from 'next/server';
import { PRODUCTS } from '@/lib/products';

const IDS = new Set(PRODUCTS.map((p) => p.id));

// Un producto que no está en el catálogo responde con 404 real (no solo la vista de "no encontrado").
export function proxy(request: NextRequest) {
  const id = request.nextUrl.pathname.split('/')[2];
  if (id && !IDS.has(id)) return NextResponse.rewrite(new URL('/producto-no-encontrado', request.url));
  return NextResponse.next();
}

export const config = { matcher: '/producto/:id' };
