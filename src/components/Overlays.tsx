'use client';
// Capas globales: menú móvil, bolsa lateral, buscador y toast.
import Image from 'next/image';
import { TotalsRows } from './Totals';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { PRODUCTS, defaultSize, type Product } from '@/lib/products';
import { computeTotals, fmt, FREE_SHIP } from '@/lib/pricing';
import { useLockBody, useMounted } from '@/lib/hooks';
import { useShop, useUI } from '@/store/shop';
import { Icon, PayBadges } from './Icons';
import { EASE } from './Reveal';

export const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
export const matches = (p: Product, q: string) => {
  const hay = norm([p.name, p.brand, p.family, p.concentration, ...p.notes.top, ...p.notes.heart, ...p.notes.base, ...p.accords.map((a) => a[0])].join(' '));
  return norm(q).split(/\s+/).filter(Boolean).every((w) => hay.includes(w));
};

export function QtyStepper({ value, onChange, lg }: { value: number; onChange: (n: number) => void; lg?: boolean }) {
  return (
    <div className={`qty ${lg ? 'qty--lg' : ''}`}>
      <button type="button" onClick={() => onChange(value - 1)} aria-label="Restar"><Icon.minus /></button>
      <span aria-live="polite">{value}</span>
      <button type="button" onClick={() => onChange(value + 1)} aria-label="Sumar" disabled={value >= 10}><Icon.plus /></button>
    </div>
  );
}

export function ShipProgress({ subtotal }: { subtotal: number }) {
  const left = FREE_SHIP - subtotal;
  return (
    <div className="ship-progress">
      {left > 0 ? <>Te faltan <strong>{fmt(left)}</strong> para el envío gratis</> : <><strong>¡Tienes envío gratis!</strong> Tu pedido califica.</>}
      <div className="bar"><i style={{ width: `${Math.min(100, (subtotal / FREE_SHIP) * 100)}%` }} /></div>
    </div>
  );
}

function CartScreen() {
  const { cartOpen, set } = useUI();
  const cart = useShop((s) => s.cart);
  const promo = useShop((s) => s.promo);
  const { setQty, remove, add, toggleWish } = useShop();
  const mounted = useMounted();
  const t = computeTotals(mounted ? cart : [], promo);
  const close = () => set({ cartOpen: false });
  const count = t.lines.reduce((a, l) => a + l.qty, 0);
  const inCart = new Set(t.lines.map((l) => l.id));
  const suggestions = PRODUCTS.filter((p) => !inCart.has(p.id)).sort((a, b) => b.rating * b.reviews - a.rating * a.reviews).slice(0, 6);

  return (
    <AnimatePresence>
      {cartOpen && (
        <motion.aside
          className="cartscreen" aria-label="Bolsa de compras" role="dialog" aria-modal="true"
          initial={{ clipPath: 'inset(100% 0 0 0)' }} animate={{ clipPath: 'inset(0% 0 0 0)' }} exit={{ clipPath: 'inset(0 0 100% 0)' }}
          transition={{ duration: 0.8, ease: EASE }}
          data-lenis-prevent
        >
          <motion.div className="cartscreen__inner wrap" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.7, ease: EASE, delay: 0.25 }}>
            <header className="cartscreen__head">
              <div>
                <span className="eyebrow">{count ? `${count} ${count === 1 ? 'artículo' : 'artículos'}` : 'Vacía'}</span>
                <h2>Tu bolsa</h2>
              </div>
              <button className="cartscreen__close" onClick={close}>Cerrar <Icon.x /></button>
            </header>

            {!t.lines.length ? (
              <div className="cartscreen__empty">
                <Image src="/img/brand/monogram-teal.png" alt="" width={90} height={110} />
                <h3>Tu bolsa está vacía</h3>
                <p>Descubre fragancias que cuentan tu historia.</p>
                <Link href="/tienda" className="btn" onClick={close}>Explorar la tienda <Icon.arrow /></Link>
              </div>
            ) : (
              <div className="cartscreen__grid">
                <div className="cartscreen__items">
                  <AnimatePresence initial={false}>
                    {t.lines.map((l, i) => (
                      <motion.div key={`${l.id}-${l.ml}`} className="cs-item" layout
                        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE, delay: 0.3 + i * 0.05 } }}
                        exit={{ opacity: 0, x: -30, transition: { duration: 0.35, ease: EASE } }}>
                        <Link href={`/producto/${l.id}`} className="cs-item__img" onClick={close}><Image src={l.p.img} alt={l.p.name} width={150} height={200} /></Link>
                        <div className="cs-item__info">
                          <span className="card__brand">{l.p.brand}</span>
                          <Link href={`/producto/${l.id}`} className="cs-item__name" onClick={close}>{l.p.name}</Link>
                          <span className="cs-item__meta">{l.p.concentration} · {l.p.family}</span>
                          <div className="cs-item__sizes" role="radiogroup" aria-label="Tamaño">
                            {l.p.sizes.map((sz) => (
                              <button key={sz.ml} role="radio" aria-checked={sz.ml === l.ml} className={sz.ml === l.ml ? 'active' : ''}
                                onClick={() => { if (sz.ml === l.ml) return; remove(l.id, l.ml); add(l.id, sz.ml, l.qty); }}>{sz.ml} ml</button>
                            ))}
                          </div>
                          <div className="cs-item__links">
                            <button onClick={() => { toggleWish(l.id); remove(l.id, l.ml); }}><Icon.heart /> Mover a favoritos</button>
                            <button onClick={() => remove(l.id, l.ml)}><Icon.x /> Eliminar</button>
                          </div>
                        </div>
                        <div className="cs-item__right">
                          <motion.strong key={l.total} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: EASE }}>{fmt(l.total)}</motion.strong>
                          <QtyStepper value={l.qty} onChange={(n) => setQty(l.id, l.ml, n)} />
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                <aside className="cartscreen__summary">
                  <ShipProgress subtotal={t.subtotal} />
                  <PromoInline />
                  <TotalsRows t={t} promo={promo} shipLabel="Envío estándar" />
                  <Link href="/checkout" className="btn btn--block" onClick={close}><Icon.lock /> Finalizar compra</Link>
                  <button className="btn btn--block btn--ghost" style={{ marginTop: 8 }} onClick={close}>Seguir comprando</button>
                  <PayBadges />
                </aside>
              </div>
            )}

            <section className="cartscreen__more">
              <h3>{t.lines.length ? 'Completa tu ritual' : 'Los más deseados'}</h3>
              <div className="cartscreen__row">
                {suggestions.map((p) => (
                  <div key={p.id} className="cs-sug">
                    <Link href={`/producto/${p.id}`} onClick={close} className="cs-sug__img"><Image src={p.img} alt={p.name} width={150} height={200} /></Link>
                    <div className="cs-sug__txt"><small>{p.brand}</small><strong>{p.name}</strong><span>{fmt(defaultSize(p).price)}</span></div>
                    <button className="round round--dark" aria-label={`Añadir ${p.name}`} onClick={() => add(p.id, defaultSize(p).ml)}><Icon.plus /></button>
                  </div>
                ))}
              </div>
            </section>
          </motion.div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

function PromoInline() {
  const promo = useShop((s) => s.promo);
  const apply = useShop((s) => s.applyPromo);
  const clear = useShop((s) => s.clearPromo);
  const [code, setCode] = useState('');
  const [bad, setBad] = useState(false);
  if (promo) return <div className="promo-msg ok promo-active">Código <strong>{promo}</strong> aplicado <button type="button" onClick={clear}>Quitar</button></div>;
  return (
    <>
      <form className="promo" onSubmit={(e) => { e.preventDefault(); const ok = apply(code); setBad(!ok && !!code.trim()); if (ok) setCode(''); }}>
        <input value={code} onChange={(e) => { setCode(e.target.value); setBad(false); }} placeholder="Código de descuento" aria-label="Código de descuento" />
        <button className="btn btn--sm btn--ghost" type="submit">Aplicar</button>
      </form>
      {bad && <div className="promo-msg bad">Código no válido. Prueba con ROYALE10.</div>}
    </>
  );
}

function MobileMenu() {
  const { menuOpen, set } = useUI();
  const session = useShop((s) => s.session);
  const mounted = useMounted();
  const close = () => set({ menuOpen: false });
  const links = [
    ['/', 'Inicio'], ['/tienda', 'Toda la tienda'], ['/tienda?g=hombre', 'Hombre'], ['/tienda?g=mujer', 'Mujer'],
    ['/tienda?g=unisex', 'Nicho & Unisex'], ['/favoritos', 'Favoritos'], ['/#quiz', 'Encuentra tu fragancia'],
    [mounted && session ? '/cuenta' : '/cuenta/ingresar', mounted && session ? 'Mi cuenta' : 'Iniciar sesión'],
  ];
  return (
    <aside className={`drawer drawer--left ${menuOpen ? 'is-open' : ''}`} aria-label="Menú" aria-hidden={!menuOpen} inert={!menuOpen}>
      <div className="drawer__head">
        <Image src="/img/brand/logo-horizontal-teal.png" alt="Royale" width={827} height={281} className="drawer__logo" style={{ width: 'auto' }} />
        <button className="icon-btn" onClick={close} aria-label="Cerrar"><Icon.x /></button>
      </div>
      <button className="search-trigger" onClick={() => set({ menuOpen: false, searchOpen: true })}><Icon.search /> Buscar perfumes, marcas o notas</button>
      <nav className="mobile-nav">
        {links.map(([href, label]) => <Link key={label} href={href} onClick={close}>{label}</Link>)}
      </nav>
      <p className="drawer__foot">Atención por WhatsApp<br /><strong>+1 (809) 555-0140</strong></p>
    </aside>
  );
}

function SearchOverlay() {
  const { searchOpen, set } = useUI();
  const [q, setQ] = useState('');
  const input = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const close = () => set({ searchOpen: false });
  useEffect(() => { if (searchOpen) setTimeout(() => input.current?.focus(), 60); }, [searchOpen]);
  const res = useMemo(() => (q.trim() ? PRODUCTS.filter((p) => matches(p, q)) : PRODUCTS.filter((p) => p.tags.includes('bestseller')).slice(0, 6)), [q]);
  const sugg = ['Vainilla', 'Dior', 'Chanel', 'Jazmín', 'Lavanda', 'Ámbar', 'Café', 'Creed'];

  return (
    <div className={`search ${searchOpen ? 'is-open' : ''}`} aria-hidden={!searchOpen} inert={!searchOpen} onClick={(e) => e.target === e.currentTarget && close()}>
      <div className="search__panel" role="dialog" aria-label="Buscar">
        <form className="search__bar" onSubmit={(e) => { e.preventDefault(); if (q.trim()) { close(); router.push(`/tienda?q=${encodeURIComponent(q.trim())}`); } }}>
          <Icon.search />
          <input ref={input} type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Busca por perfume, marca o nota (ej. vainilla)…" autoComplete="off" aria-label="Buscar" />
          <button type="button" className="icon-btn" onClick={close} aria-label="Cerrar búsqueda"><Icon.x /></button>
        </form>
        {!q && <div className="search__suggest">{sugg.map((s) => <button key={s} className="chip" onClick={() => setQ(s)}>{s}</button>)}</div>}
        <div className="search__results">
          {!q && <p className="s-empty eyebrow">Más buscados</p>}
          {res.length ? res.map((p) => (
            <Link key={p.id} className="s-item" href={`/producto/${p.id}`} onClick={close}>
              <Image src={p.img} alt="" width={52} height={64} />
              <div><small>{p.brand}</small><strong>{p.name}</strong><span className="price"><small>desde</small>{fmt(p.price)}</span></div>
            </Link>
          )) : <p className="s-empty">No encontramos resultados para “{q}”. Prueba con una marca o una nota olfativa.</p>}
        </div>
      </div>
    </div>
  );
}

function Toast() {
  const { toast, set } = useUI();
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => set({ toast: null }), 3200);
    return () => clearTimeout(t);
  }, [toast, set]);
  return <div className={`toast ${toast ? 'is-show' : ''}`} role="status" aria-live="polite">{toast?.node}</div>;
}

export function Overlays() {
  const ui = useUI();
  const path = usePathname();
  const anyOpen = ui.cartOpen || ui.menuOpen || ui.searchOpen;
  useLockBody(anyOpen);
  // Cierra todo al cambiar de página o con Escape.
  useEffect(() => { ui.set({ cartOpen: false, menuOpen: false, searchOpen: false }); }, [path]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const on = (e: KeyboardEvent) => e.key === 'Escape' && ui.set({ cartOpen: false, menuOpen: false, searchOpen: false });
    window.addEventListener('keydown', on); return () => window.removeEventListener('keydown', on);
  }, [ui]);
  return (
    <>
      <div className={`overlay ${ui.menuOpen ? 'is-open' : ''}`} onClick={() => ui.set({ menuOpen: false })} />
      <MobileMenu />
      <CartScreen />
      <SearchOverlay />
      <Toast />
    </>
  );
}
