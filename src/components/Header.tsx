'use client';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { computeTotals, fmt } from '@/lib/pricing';
import { useMounted } from '@/lib/hooks';
import { useShop, useUI, useUser } from '@/store/shop';
import { Icon } from './Icons';

const NAV = [
  { href: '/tienda', label: 'Tienda', g: null },
  { href: '/tienda?g=hombre', label: 'Hombre', g: 'hombre' },
  { href: '/tienda?g=mujer', label: 'Mujer', g: 'mujer' },
  { href: '/tienda?g=unisex', label: 'Nicho', g: 'unisex' },
];

function Badge({ n }: { n: number }) {
  const [bump, setBump] = useState(false);
  useEffect(() => {
    if (!n) return;
    setBump(true);
    const t = setTimeout(() => setBump(false), 500);
    return () => clearTimeout(t);
  }, [n]);
  return <span className={`badge ${n ? '' : 'is-empty'} ${bump ? 'bump' : ''}`}>{n}</span>;
}

// Con sesión iniciada, el botón de cuenta abre un menú con los accesos principales.
function AccountMenu({ name, email }: { name: string; email: string }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, right: 0 });
  const ref = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const toggle = () => {
    const r = ref.current!.getBoundingClientRect();
    // Alineado al botón, pero siempre dentro de la pantalla (también en móvil).
    const vw = window.innerWidth;
    const width = Math.min(280, vw - 24);
    setPos({ top: r.bottom + 10, right: Math.min(Math.max(12, vw - r.right), vw - width - 12) });
    setOpen(!open);
  };
  const path = usePathname();
  const router = useRouter();
  const logout = useShop((s) => s.logout);
  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => { const t = e.target as Node; if (!ref.current?.contains(t) && !panel.current?.contains(t)) setOpen(false); };
    const close = () => setOpen(false);
    window.addEventListener('scroll', close, { passive: true }); window.addEventListener('resize', close);
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', away); document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('pointerdown', away); document.removeEventListener('keydown', esc); window.removeEventListener('scroll', close); window.removeEventListener('resize', close); };
  }, [open]);
  const items = [
    { href: '/cuenta', label: 'Mi cuenta', icon: <Icon.user /> },
    { href: '/cuenta/pedidos', label: 'Mis pedidos', icon: <Icon.box /> },
    { href: '/favoritos', label: 'Favoritos', icon: <Icon.heart /> },
    { href: '/cuenta/perfil', label: 'Perfil y dirección', icon: <Icon.pin /> },
  ];
  return (
    <div className="acct-menu" ref={ref}>
      <button className="account-btn" onClick={toggle} aria-haspopup="menu" aria-expanded={open} aria-label="Menú de mi cuenta">
        <Icon.user /><span className="account-btn__label">{name.split(' ')[0]}</span><span className="dot-online" />
        <Icon.chevron className="account-btn__chev" />
      </button>
      {typeof document !== 'undefined' && createPortal(<AnimatePresence>
        {open && (
          <motion.div ref={panel} className="acct-menu__panel" role="menu" style={{ top: pos.top, right: pos.right }}
            initial={{ opacity: 0, y: -6, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}>
            <div className="acct-menu__who"><strong>{name}</strong><span>{email}</span></div>
            {items.map((it) => (
              <Link key={it.href} href={it.href} role="menuitem" className={path === it.href ? 'active' : ''} onClick={() => setOpen(false)}>{it.icon}{it.label}</Link>
            ))}
            <button role="menuitem" className="acct-menu__out" onClick={() => { logout(); setOpen(false); router.push('/'); }}><Icon.logout />Cerrar sesión</button>
          </motion.div>
        )}
      </AnimatePresence>, document.body)}
    </div>
  );
}

export function Header() {
  const mounted = useMounted();
  const path = usePathname();
  const params = useSearchParams();
  const g = params.get('g');
  const cart = useShop((s) => s.cart);
  const wish = useShop((s) => s.wish);
  const sessionUser = useUser();
  const user = mounted ? sessionUser : null;
  const ui = useUI();
  const [scrolled, setScrolled] = useState(false);
  const [overHero, setOverHero] = useState(path === '/');

  // En el inicio el encabezado flota transparente sobre el hero hasta que este sale de la pantalla.
  useEffect(() => {
    const on = () => {
      setScrolled(window.scrollY > 10);
      const hero = document.querySelector<HTMLElement>('[data-hero]');
      setOverHero(!!hero && hero.getBoundingClientRect().bottom > 90);
    };
    on(); window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, [path]);
  const overlay = path === '/' && overHero;

  const qty = mounted ? cart.reduce((a, l) => a + l.qty, 0) : 0;
  const subtotal = mounted ? computeTotals(cart, null).subtotal : 0;

  return (
    <header className={`header ${scrolled && !overlay ? 'is-scrolled' : ''} ${path === '/' ? 'header--home' : ''} ${overlay ? 'header--overlay' : ''} ${overlay && scrolled ? 'is-floating' : ''}`}>
      <div className="header__inner">
        <div className="header__left">
          <button className="icon-btn menu-btn" onClick={() => ui.set({ menuOpen: true })} aria-label="Abrir menú"><Icon.menu /></button>
          <nav className="nav" aria-label="Principal">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className={path === '/tienda' && (n.g ? g === n.g : !g) ? 'active' : ''}>{n.label}</Link>
            ))}
          </nav>
        </div>
        <Link href="/" className="brand" aria-label="Royale Parfums Collection, inicio">
          <Image className="brand__dark" src="/img/brand/logo-horizontal-teal.png" alt="Royale Parfums Collection" width={827} height={281} priority />
          <Image className="brand__light" src="/img/brand/logo-horizontal-white.png" alt="" width={827} height={281} priority />
        </Link>
        <div className="header__right">
          <button className="icon-btn hide-sm" onClick={() => ui.set({ searchOpen: true })} aria-label="Buscar"><Icon.search /></button>
          {user ? <AccountMenu name={user.name} email={user.email} /> : (
            <Link className="account-btn" href="/cuenta/ingresar" aria-label="Iniciar sesión">
              <Icon.user /><span className="account-btn__label">Ingresar</span>
            </Link>
          )}
          <Link className="icon-btn" href="/favoritos" aria-label="Favoritos"><Icon.heart /><Badge n={mounted ? wish.length : 0} /></Link>
          <button className="cart-btn" onClick={() => ui.set({ cartOpen: true })} aria-label="Abrir bolsa de compras">
            <Icon.bag />
            <span className="cart-btn__total">{fmt(subtotal)}</span>
            <Badge n={qty} />
          </button>
        </div>
      </div>
    </header>
  );
}
