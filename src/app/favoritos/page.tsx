'use client';
import Link from 'next/link';
import { PRODUCTS } from '@/lib/products';
import { useMounted } from '@/lib/hooks';
import { useShop } from '@/store/shop';
import { PageHead } from '@/components/PageHead';
import { ProductCard } from '@/components/ProductCard';
import { Reveal } from '@/components/Reveal';

export default function FavoritosPage() {
  const mounted = useMounted();
  const wish = useShop((s) => s.wish);
  const list = mounted ? wish.map((id) => PRODUCTS.find((p) => p.id === id)!).filter(Boolean) : [];
  return (
    <>
      <PageHead crumb="Favoritos" title={<>Tus <em>favoritos</em></>}
        sub={list.length ? `Guardaste ${list.length} ${list.length === 1 ? 'fragancia' : 'fragancias'}. Agrégalas a tu bolsa cuando estés listo.` : 'Toca el corazón en cualquier fragancia para guardarla aquí.'} />
      <div className="wrap" style={{ paddingBottom: 110 }}>
        {list.length ? (
          <Reveal className="grid">{list.map((p) => <ProductCard key={p.id} p={p} />)}</Reveal>
        ) : mounted ? (
          <Reveal className="no-results">
            <h3>Aún no tienes favoritos</h3>
            <p>Explora la colección y guarda los perfumes que te enamoren.</p>
            <Link href="/tienda" className="btn btn--sm">Ir a la tienda</Link>
          </Reveal>
        ) : null}
      </div>
    </>
  );
}
