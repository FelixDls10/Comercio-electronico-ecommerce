'use client';
import Image from 'next/image';
import { getProduct } from '@/lib/products';
import { useShop, useUI } from '@/store/shop';
import { Icon } from './Icons';
import { flyToCart } from './Motion';

// Último elemento pulsado: sirve para saber desde qué imagen sale el «vuelo» a la bolsa.
let lastPress: HTMLElement | null = null;
if (typeof window !== 'undefined') window.addEventListener('pointerdown', (e) => { lastPress = e.target as HTMLElement; }, { capture: true, passive: true });

function sourceRect() {
  const scope = lastPress?.closest('.card, .pdp, .cs-sug, .hero2__main, .quiz__result, .sticky-buy, .mini, .cat-exp__panel');
  const img = scope?.querySelector('.pdp__main img, .hero2__bottle img') ?? scope?.querySelector('img');
  return img?.getBoundingClientRect() ?? null;
}

// Acciones de compra con su retroalimentación (toast + rebote del contador).
export function useCartActions() {
  const add = useShop((s) => s.add);
  const toggle = useShop((s) => s.toggleWish);
  const wish = useShop((s) => s.wish);
  const { notify, set } = useUI();

  const addToCart = (id: string, ml: number, qty = 1) => {
    const p = getProduct(id); if (!p) return;
    add(id, ml, qty);
    flyToCart(p.img, sourceRect());
    notify(
      <>
        <Image src={p.img} alt="" width={42} height={50} />
        <div><strong>{p.name}</strong> {ml} ml<br /><span style={{ opacity: 0.7 }}>añadido a tu bolsa</span></div>
        <button onClick={() => set({ cartOpen: true, toast: null })}>Ver bolsa</button>
      </>,
    );
  };
  const toggleWish = (id: string) => {
    const on = toggle(id);
    if (on) notify(<><Icon.heart /><span>Guardado en favoritos</span></>);
  };
  return { addToCart, toggleWish, isWished: (id: string) => wish.includes(id) };
}
