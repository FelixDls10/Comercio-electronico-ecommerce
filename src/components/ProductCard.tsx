'use client';
import Image from 'next/image';
import Link from 'next/link';
import { defaultSize, type Product } from '@/lib/products';
import { fmt } from '@/lib/pricing';
import { useMounted } from '@/lib/hooks';
import { Icon, Stars } from './Icons';
import { useCartActions } from './useCartActions';

export function ProductTag({ p }: { p: Product }) {
  if (p.tags.includes('nuevo')) return <span className="tag tag--gold">Nuevo</span>;
  if (p.tags.includes('nicho')) return <span className="tag tag--dark">Nicho</span>;
  if (p.tags.includes('bestseller')) return <span className="tag">Más vendido</span>;
  return null;
}

export function WishButton({ id, className = 'wish' }: { id: string; className?: string }) {
  const mounted = useMounted();
  const { isWished, toggleWish } = useCartActions();
  const on = mounted && isWished(id);
  return (
    <button className={`${className} ${on ? 'on' : ''}`} onClick={(e) => { e.preventDefault(); toggleWish(id); }} aria-pressed={on} aria-label={on ? 'Quitar de favoritos' : 'Añadir a favoritos'}>
      <Icon.heart />
    </button>
  );
}

export function ProductCard({ p, priority }: { p: Product; priority?: boolean }) {
  const { addToCart } = useCartActions();
  const s = defaultSize(p);
  return (
    <article className="card">
      <div className="card__mediawrap">
        <Link href={`/producto/${p.id}`} className="card__media" aria-label={`${p.brand} ${p.name}`}>
          <Image src={p.img} alt={`${p.brand} ${p.name} ${p.concentration}`} width={375} height={500} priority={priority} sizes="(max-width: 767px) 50vw, 25vw" />
        </Link>
        <div className="card__hover" aria-hidden="true">
          <span className="card__notes">{[...p.notes.top.slice(0, 1), ...p.notes.heart.slice(0, 1), ...p.notes.base.slice(0, 1)].join(' · ')}</span>
          <div className="card__sizes">
            {p.sizes.map((sz) => (
              <button key={sz.ml} tabIndex={-1} className={sz.ml === s.ml ? 'is-pick' : ''} onClick={() => addToCart(p.id, sz.ml)}>
                <strong>{sz.ml} ml</strong><span>{fmt(sz.price)}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="card__tags"><ProductTag p={p} /></div>
      <WishButton id={p.id} />
      <button className="quick" onClick={() => addToCart(p.id, s.ml)} aria-label={`Añadir ${p.name} ${s.ml} ml a la bolsa`}>
        <Icon.bag /> Añadir · {s.ml} ml
      </button>
      <Link href={`/producto/${p.id}`} className="card__body">
        <span className="card__brand">{p.brand}</span>
        <span className="card__name">{p.name}</span>
        <span className="card__conc">{p.concentration} · <span className="card__family">{p.family}</span></span>
        <span className="card__foot">
          <span className="price"><small>desde</small>{fmt(p.price)}</span>
          <Stars value={p.rating} />
        </span>
      </Link>
    </article>
  );
}
