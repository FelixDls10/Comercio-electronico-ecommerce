'use client';
import { useRef } from 'react';
import type { Product } from '@/lib/products';
import { Icon } from '../Icons';
import { ProductCard } from '../ProductCard';
import { Reveal } from '../Reveal';

export function ProductCarousel({ products, title = 'También te podría gustar' }: { products: Product[]; title?: React.ReactNode }) {
  const track = useRef<HTMLDivElement>(null);
  const step = (dir: number) => {
    const el = track.current; if (!el?.firstElementChild) return;
    el.scrollBy({ left: dir * (el.firstElementChild.getBoundingClientRect().width + 20), behavior: 'smooth' });
  };
  if (!products.length) return null;
  return (
    <section className="wrap section--tight" style={{ paddingTop: 40 }}>
      <Reveal className="section-head">
        <h2>{title}</h2>
        <div className="carousel__nav">
          <button className="round" onClick={() => step(-1)} aria-label="Anterior"><Icon.arrowL /></button>
          <button className="round" onClick={() => step(1)} aria-label="Siguiente"><Icon.arrow /></button>
        </div>
      </Reveal>
      <Reveal className="carousel">
        <div className="carousel__track" ref={track}>
          {products.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      </Reveal>
    </section>
  );
}
