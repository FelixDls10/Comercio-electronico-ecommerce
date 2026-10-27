import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Icon } from '@/components/Icons';
import { ProductCard } from '@/components/ProductCard';
import { Reveal } from '@/components/Reveal';
import { PRODUCTS } from '@/lib/products';

export const metadata: Metadata = { title: 'Página no encontrada' };

export default function NotFound() {
  const picks = [...PRODUCTS].sort((a, b) => b.rating * b.reviews - a.rating * a.reviews).slice(0, 4);
  return (
    <>
      <section className="wrap notfound">
        <Reveal hero media className="notfound__mark">
          <span aria-hidden="true">4</span>
          <Image src="/img/brand/monogram-teal.png" alt="" width={190} height={234} priority />
          <span aria-hidden="true">4</span>
        </Reveal>
        <Reveal hero>
          <h1>Esta esencia se <em>evaporó</em></h1>
          <p>La página que buscas no existe o cambió de lugar. Pero hay muchas fragancias esperándote.</p>
          <div className="notfound__actions">
            <Link href="/" className="btn">Volver al inicio <Icon.arrow /></Link>
            <Link href="/tienda" className="btn btn--ghost">Explorar la tienda</Link>
            <Link href="/ayuda" className="btn btn--ghost">Centro de ayuda</Link>
          </div>
        </Reveal>
      </section>
      <section className="wrap" style={{ paddingBottom: 110 }}>
        <Reveal className="section-head"><div><span className="eyebrow">Quizás buscabas</span><h2>Los más <em>deseados</em></h2></div></Reveal>
        <Reveal className="grid">{picks.map((p) => <ProductCard key={p.id} p={p} />)}</Reveal>
      </section>
    </>
  );
}
