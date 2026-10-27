import type { MetadataRoute } from 'next';
import { FAMILIES, PRODUCTS } from '@/lib/products';

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const page = (path: string, priority: number, changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] = 'monthly') =>
    ({ url: `${SITE}${path}`, lastModified: now, changeFrequency, priority });

  return [
    page('/', 1, 'weekly'),
    page('/tienda', 0.9, 'weekly'),
    ...['hombre', 'mujer', 'unisex'].map((g) => page(`/tienda?g=${g}`, 0.8, 'weekly')),
    ...FAMILIES.map((f) => page(`/tienda?f=${f.key}`, 0.6, 'weekly')),
    ...PRODUCTS.map((p) => ({ ...page(`/producto/${p.id}`, 0.8, 'weekly'), images: [`${SITE}${p.img}`] })),
    page('/nosotros', 0.5),
    page('/contacto', 0.5),
    page('/ayuda', 0.5),
    page('/legal/terminos', 0.3, 'yearly'),
    page('/legal/privacidad', 0.3, 'yearly'),
    page('/legal/devoluciones', 0.3, 'yearly'),
  ];
}
