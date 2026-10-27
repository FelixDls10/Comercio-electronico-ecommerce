'use client';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useInView } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { defaultSize, type Product } from '@/lib/products';
import { fmt, itbisOf } from '@/lib/pricing';
import { Icon, Stars } from '../Icons';
import { QtyStepper } from '../Overlays';
import { ProductTag, WishButton } from '../ProductCard';
import { EASE, Reveal } from '../Reveal';
import { useCartActions } from '../useCartActions';

export function Gallery({ p }: { p: Product }) {
  const [view, setView] = useState<'img' | 'notes'>('img');
  const [zoom, setZoom] = useState(false);
  const [origin, setOrigin] = useState('50% 50%');
  const point = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setOrigin(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`);
  };
  return (
    <Reveal hero media className="pdp__gallery">
      <div className="pdp__thumbs">
        <button className={view === 'img' ? 'active' : ''} onClick={() => setView('img')} aria-label="Ver frasco"><Image src={p.img} alt="" width={75} height={100} /></button>
        <button className={view === 'notes' ? 'active' : ''} onClick={() => { setView('notes'); setZoom(false); }} aria-label="Ver notas olfativas"><span className="t-notes">Notas<br />olfativas</span></button>
      </div>
      <div
        className={`pdp__main ${zoom ? 'zoom' : ''}`}
        style={{ ['--zx' as string]: origin.split(' ')[0], ['--zy' as string]: origin.split(' ')[1] }}
        onClick={(e) => { if (view === 'notes' || (e.target as HTMLElement).closest('.wish')) return; point(e); setZoom(!zoom); }}
        onMouseMove={(e) => zoom && point(e)}
        onMouseLeave={() => setZoom(false)}
      >
        <Image src={p.img} alt={`${p.brand} ${p.name} ${p.concentration}`} width={375} height={500} priority sizes="(max-width: 900px) 100vw, 50vw" />
        <WishButton id={p.id} />
        <div className={`pdp__main-notes ${view === 'notes' ? 'on' : ''}`}>
          <div><h4>Notas de salida</h4><p>{p.notes.top.join(', ')}</p></div>
          <div><h4>Notas de corazón</h4><p>{p.notes.heart.join(', ')}</p></div>
          <div><h4>Notas de fondo</h4><p>{p.notes.base.join(', ')}</p></div>
        </div>
      </div>
    </Reveal>
  );
}

export function BuyBox({ p }: { p: Product }) {
  const [size, setSize] = useState(defaultSize(p));
  const [qty, setQty] = useState(1);
  const { addToCart } = useCartActions();
  const buyRef = useRef<HTMLDivElement>(null);
  const [sticky, setSticky] = useState(false);

  useEffect(() => {
    const el = buyRef.current; if (!el) return;
    const io = new IntersectionObserver(([en]) => setSticky(!en.isIntersecting && en.boundingClientRect.top < 0));
    io.observe(el); return () => io.disconnect();
  }, []);

  return (
    <>
    <Reveal hero className="pdp__info">
      <div className="panel">
        <div className="pdp__brand"><Link href={`/tienda?b=${encodeURIComponent(p.brand)}`}>{p.brand}</Link><ProductTag p={p} /></div>
        <h1>{p.name}</h1>
        <div className="pdp__sub">
          <span>{p.concentration}</span><span>·</span><span>{p.family}</span><span>·</span>
          <Stars value={p.rating} />
          <a href="#reviews" style={{ textDecoration: 'underline', textUnderlineOffset: 3 }}>{p.reviews} reseñas</a>
        </div>
        <div className="pdp__price"><span>{fmt(size.price * qty)}</span><small>Incluye {fmt(itbisOf(size.price * qty))} de ITBIS (18%)</small></div>
        <p className="pdp__desc">{p.description}</p>
        <div className="label">Tamaño <span>{fmt(size.price / size.ml)} / ml</span></div>
        <div className="sizes" role="radiogroup" aria-label="Tamaño">
          {p.sizes.map((s) => (
            <button key={s.ml} role="radio" aria-checked={s.ml === size.ml} className={`size ${s.ml === size.ml ? 'active' : ''}`} onClick={() => setSize(s)}>
              <strong>{s.ml} ml</strong><span>{fmt(s.price)}</span>
            </button>
          ))}
        </div>
        <div className="buy" ref={buyRef}>
          <QtyStepper lg value={qty} onChange={(n) => setQty(Math.max(1, Math.min(10, n)))} />
          <button className="btn" onClick={() => addToCart(p.id, size.ml, qty)}><Icon.bag /> Añadir a la bolsa</button>
        </div>
        <div className="assure">
          <div><Icon.truck /><span>Entrega 24–48 h<br />en todo el país</span></div>
          <div><Icon.shield /><span>Original sellado<br />con factura</span></div>
          <div><Icon.gift /><span>Muestra de<br />cortesía gratis</span></div>
        </div>
      </div>
      <details className="acc"><summary>¿Cómo aplicarlo? <Icon.chevron /></summary><div className="acc__body"><ul>
        <li>Aplica sobre la piel hidratada, en puntos de pulso: cuello, muñecas y detrás de las orejas.</li>
        <li>No frotes las muñecas: rompe las notas de salida.</li>
        <li>{p.longevity >= 5 ? 'Es muy intenso: 2–3 atomizaciones bastan.' : '3–4 atomizaciones para una estela equilibrada.'}</li>
        <li>Guárdalo lejos del sol y de la humedad del baño.</li>
      </ul></div></details>
      <details className="acc"><summary>Envíos y devoluciones <Icon.chevron /></summary><div className="acc__body">Envío gratis desde RD$ 5,000. Santo Domingo y Santiago: 24 h. Resto del país: 48 h. Express el mismo día en el Gran Santo Domingo (RD$ 450). Cambios en 7 días si el producto está sellado. <Link href="/legal/devoluciones" style={{ textDecoration: 'underline' }}>Ver política</Link>.</div></details>
      <details className="acc"><summary>Garantía de autenticidad <Icon.chevron /></summary><div className="acc__body">Producto adquirido a distribuidores autorizados. Puedes verificar el número de lote impreso en la caja y en la base del frasco. Si no es original, te devolvemos el doble.</div></details>
    </Reveal>

      <div className={`sticky-buy ${sticky ? 'on' : ''}`} aria-hidden={!sticky}>
        <div className="wrap sticky-buy__inner">
          <Image src={p.img} alt="" width={44} height={54} />
          <div><strong>{p.name}</strong><span>{size.ml} ml · {fmt(size.price)}</span></div>
          <button className="btn btn--sm" tabIndex={sticky ? 0 : -1} onClick={() => addToCart(p.id, size.ml, 1)}><Icon.bag /> Añadir</button>
        </div>
      </div>
    </>
  );
}

export function Accords({ accords }: { accords: [string, number][] }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  return (
    <div className="accords" ref={ref}>
      {accords.map(([n, v], i) => (
        <div key={n} className={`accord ${v < 45 ? 'light' : ''}`}>
          <motion.i initial={{ width: 0 }} animate={{ width: inView ? `${v}%` : 0 }} transition={{ duration: 1.2, ease: EASE, delay: 0.2 + i * 0.05 }} />
          <span>{n}</span>
        </div>
      ))}
    </div>
  );
}

export function Meters({ longevity, sillage }: { longevity: number; sillage: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const meter = (label: string, v: number, words: string[]) => (
    <div>
      <div className="meter__top">{label}<span>{words[v - 1]}</span></div>
      <div className="meter__dots">{[1, 2, 3, 4, 5].map((k) => <i key={k} className={k <= v ? 'on' : ''} style={{ ['--i' as string]: k }} />)}</div>
    </div>
  );
  return (
    <div className={`meters ${inView ? 'is-in' : ''}`} ref={ref}>
      {meter('Duración', longevity, ['Muy débil', 'Débil', 'Moderada', 'Duradera (7–10 h)', 'Muy duradera (+12 h)'])}
      {meter('Estela', sillage, ['Íntima', 'Suave', 'Moderada', 'Intensa', 'Enorme'])}
    </div>
  );
}
