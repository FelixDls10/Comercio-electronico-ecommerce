'use client';
/**
 * Capa de movimiento global (Framer Motion + Lenis):
 * - Scroll suave con Lenis; se detiene con la bolsa, el menú o el buscador abiertos.
 * - «Vuelo a la bolsa»: al añadir un producto, su imagen viaja hasta el botón de la bolsa.
 * Sin «reducir movimiento» activado.
 */
import Lenis from 'lenis';
import { animate } from 'motion/react';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { useUI } from '@/store/shop';

const EASE = [0.22, 1, 0.36, 1] as const;
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let lenis: Lenis | null = null;

export function SmoothScroll() {
  const path = usePathname();
  const locked = useUI((s) => s.cartOpen || s.menuOpen || s.searchOpen);

  useEffect(() => {
    if (reduced()) return;
    lenis = new Lenis({ lerp: 0.1, anchors: { offset: -90 } });
    let id = 0;
    const raf = (t: number) => { lenis?.raf(t); id = requestAnimationFrame(raf); };
    id = requestAnimationFrame(raf);
    return () => { cancelAnimationFrame(id); lenis?.destroy(); lenis = null; };
  }, []);

  useEffect(() => { if (locked) lenis?.stop(); else lenis?.start(); }, [locked]);
  useEffect(() => { if (!window.location.hash) lenis?.scrollTo(0, { immediate: true }); }, [path]);
  return null;
}

/** Hace volar una copia de la imagen del producto hasta el botón de la bolsa. */
export function flyToCart(img: string, from?: DOMRect | null) {
  if (typeof window === 'undefined' || reduced()) return;
  const target = document.querySelector<HTMLElement>('.cart-btn');
  if (!target) return;
  const to = target.getBoundingClientRect();
  const start = from ?? new DOMRect(window.innerWidth / 2 - 60, window.innerHeight / 2 - 80, 120, 160);
  const el = document.createElement('div');
  el.className = 'fly';
  el.style.backgroundImage = `url(${img})`;
  Object.assign(el.style, { left: `${start.left}px`, top: `${start.top}px`, width: `${start.width}px`, height: `${start.height}px` });
  document.body.append(el);
  const dx = to.left + to.width / 2 - (start.left + start.width / 2);
  const dy = to.top + to.height / 2 - (start.top + start.height / 2);
  animate(el, { x: [0, dx * 0.55, dx], y: [0, dy - 80, dy], scale: [1, 0.6, 0.12], opacity: [1, 1, 0.3] }, { duration: 0.9, ease: EASE })
    .then(() => {
      el.remove();
      animate(target, { scale: [1, 1.08, 1] }, { duration: 0.4, ease: EASE });
    });
}
