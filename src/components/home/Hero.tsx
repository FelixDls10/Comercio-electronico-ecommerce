'use client';
/**
 * Hero «escaparate de variantes» (referencia: video de Pinterest de Nicolai Palmkvist).
 * Tarjeta a todo el ancho con el color de la fragancia activa. La siguiente fragancia espera en
 * miniatura abajo a la derecha; al avanzar, esa misma miniatura (layoutId compartido) crece hasta
 * el centro mientras el frasco actual sale hacia arriba a la izquierda y el fondo cambia de color.
 */
import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from 'motion/react';
import { useEffect, useState } from 'react';
import { defaultSize, getProduct, type Product } from '@/lib/products';
import { fmt, itbisOf } from '@/lib/pricing';
import { Brand, Icon } from '../Icons';
import { useCartActions } from '../useCartActions';

const EASE = [0.22, 1, 0.36, 1] as const;
const SLIDE_MS = 5500;
const SPRING = { type: 'spring', stiffness: 70, damping: 18, mass: 1 } as const;

// Color base tomado de cada frasco; el degradado se calcula a partir de él.
const SLIDES: { id: string; color: string }[] = [
  { id: 'ysl-libre-edp', color: '#b4582c' },
  { id: 'versace-eros', color: '#a7782c' },
  { id: 'le-male-le-parfum', color: '#56697d' },
  { id: 'good-girl', color: '#8c3b63' },
  { id: 'black-opium', color: '#b05a6e' },
  { id: 'tom-ford-black-orchid', color: '#2f5d50' },
];

const mix = (hex: string, to: string, t: number) => {
  const a = hex.match(/\w\w/g)!.map((h) => parseInt(h, 16));
  const b = to.match(/\w\w/g)!.map((h) => parseInt(h, 16));
  return `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(',')})`;
};
const gradient = (c: string) =>
  `radial-gradient(70% 85% at 50% 42%, ${mix(c, '#ffffff', 0.22)} 0%, ${c} 52%, ${mix(c, '#000000', 0.38)} 100%)`;

const products = SLIDES.map((s) => getProduct(s.id) as Product);
// Fotos recortadas (sin fondo) para que el frasco quede encima del color sin teñirse.
// Recortes en alta resolución (1800 px de alto) preparados solo para el hero.
const cut = (id: string) => `/img/hero/${id}.png`;

export function Hero() {
  const [[cur, dir], setState] = useState<[number, number]>([0, 1]);
  const [hover, setHover] = useState(false);
  const reduce = useReducedMotion();
  const { addToCart } = useCartActions();

  const p = products[cur];
  const nextIdx = (cur + 1) % products.length;
  const next = products[nextIdx];
  const [ml, setMl] = useState(defaultSize(p).ml);
  const size = p.sizes.find((s) => s.ml === ml) ?? defaultSize(p);
  useEffect(() => setMl(defaultSize(p).ml), [p]);

  const go = (d: number) => setState(([c]) => [(c + d + products.length) % products.length, d]);

  useEffect(() => {
    if (reduce || hover) return;
    const t = setTimeout(() => go(1), SLIDE_MS);
    return () => clearTimeout(t);
  }, [cur, hover, reduce]);

  // Frasco principal: entra desde la miniatura (layoutId) al avanzar; al retroceder llega desde arriba a la izquierda.
  const mainVariants = {
    enter: (d: number) => (d < 0 ? { opacity: 0, x: -320, y: -200, scale: 0.6 } : { opacity: 1 }),
    center: { opacity: 1, x: 0, y: 0, scale: 1 },
    exit: (d: number) => (d > 0
      ? { opacity: 0, x: -320, y: -200, scale: 0.6, transition: { ...SPRING, opacity: { duration: 0.75, ease: [0.4, 0, 0.6, 1] } } }
      : { opacity: 0, transition: { duration: 0 } }),
  };
  // Miniatura: aparece desde abajo al avanzar; al retroceder recibe el frasco principal (layoutId).
  const nextVariants = {
    enter: (d: number) => (d > 0 ? { opacity: 0, y: 30, scale: 0.7 } : { opacity: 1 }),
    center: { opacity: 1, y: 0, scale: 1 },
    exit: (d: number) => (d < 0 ? { opacity: 0, y: 30, scale: 0.7, transition: { duration: 0.4, ease: EASE } } : { opacity: 0, transition: { duration: 0 } }),
  };
  // Resorte suave y sin rebote: el recorrido largo se siente continuo, no mecánico.
  const layoutTransition = SPRING;

  return (
    <section className="show" data-hero aria-roledescription="carrusel" aria-label="Fragancias destacadas">
      <motion.div
        className="show__card"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, ease: EASE }}
        onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
        onKeyDown={(e) => { if (e.key === 'ArrowRight') go(1); if (e.key === 'ArrowLeft') go(-1); }}
      >
        {SLIDES.map((s, i) => (
          <motion.span key={s.id} className="show__bg" aria-hidden="true" style={{ background: gradient(s.color) }}
            initial={false} animate={{ opacity: i === cur ? 1 : 0 }} transition={{ duration: 1.1, ease: EASE }} />
        ))}

        <div className="show__left">
          <div className="show__arrows">
            <button onClick={() => go(-1)} aria-label="Fragancia anterior"><Icon.arrowL /></button>
            <button onClick={() => go(1)} aria-label="Fragancia siguiente"><Icon.arrow /></button>
          </div>
          <h1>Deja huella<br />sin decir nada</h1>
          <p>No es solo oler bien. Es esa sensación de salir de casa seguro de ti mismo. Fragancias originales de diseñador, nicho y árabes, entregadas en 24 horas.</p>
          <Link href={`/producto/${p.id}`} className="show__cta">Ver el perfume <Icon.arrow /></Link>
        </div>

        <div className="show__preload" aria-hidden="true">
          {products.map((x) => <Image key={x.id} src={cut(x.id)} alt="" width={600} height={800} quality={90} sizes="(max-width: 767px) 80vw, 520px" loading="eager" />)}
        </div>

        <LayoutGroup>
          <div className="show__stage">
            <AnimatePresence initial={false} custom={dir} mode="popLayout">
              <motion.div
                key={p.id} layoutId={`hero-${p.id}`} className="show__main" custom={dir}
                variants={mainVariants} initial="enter" animate="center" exit="exit"
                transition={{ ...layoutTransition, layout: layoutTransition }}
              >
                <Link href={`/producto/${p.id}`} aria-label={`${p.brand} ${p.name}`} className="show__float">
                  <Image src={cut(p.id)} alt={`${p.brand} ${p.name}`} width={600} height={800} preload quality={90} sizes="(max-width: 767px) 80vw, 520px" />
                </Link>
              </motion.div>
            </AnimatePresence>
            <span className="show__shadow" aria-hidden="true" />
          </div>

          <div className="show__nextwrap">
            <AnimatePresence initial={false} custom={dir} mode="popLayout">
              <motion.button
                key={next.id} layoutId={`hero-${next.id}`} className="show__next" custom={dir}
                variants={nextVariants} initial="enter" animate="center" exit="exit"
                transition={{ ...layoutTransition, layout: layoutTransition }}
                onClick={() => go(1)} aria-label={`Siguiente: ${next.name}`}
              >
                <Image src={cut(next.id)} alt="" width={600} height={800} quality={90} sizes="(max-width: 767px) 80vw, 520px" />
              </motion.button>
            </AnimatePresence>
          </div>
        </LayoutGroup>

        <div className="show__right">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.5, ease: EASE }}>
              <span className="show__brand">{p.brand}</span>
              <strong className="show__name">{p.name}</strong>
              <span className="show__price">{fmt(size.price)}</span>
              <span className="show__tax">Incluye {fmt(itbisOf(size.price))} de ITBIS</span>
            </motion.div>
          </AnimatePresence>
          <span className="show__label">Elige tu tamaño:</span>
          <div className="show__sizes" role="radiogroup" aria-label="Tamaño">
            {p.sizes.map((s) => (
              <button key={s.ml} role="radio" aria-checked={s.ml === size.ml} className={s.ml === size.ml ? 'active' : ''} onClick={() => setMl(s.ml)}>
                {s.ml}
              </button>
            ))}
          </div>
          <span className="show__unit">mililitros</span>
          <button className="show__add" onClick={() => addToCart(p.id, size.ml)}><Icon.bag /> Añadir</button>
        </div>

        <div className="show__social">
          <a href="#" aria-label="Instagram"><Brand name="instagram" /></a>
          <a href="#" aria-label="Facebook"><Brand name="facebook" /></a>
          <a href="#" aria-label="TikTok"><Brand name="tiktok" /></a>
          <a href="https://wa.me/18095550140" aria-label="WhatsApp"><Brand name="whatsapp" /></a>
        </div>

        <p className="show__tagline">Originales y sellados,<br />en tu puerta en 24 horas</p>

        <div className="show__dots" aria-hidden="true">
          {products.map((x, i) => <i key={x.id} className={i === cur ? 'on' : ''} />)}
        </div>
      </motion.div>
    </section>
  );
}
