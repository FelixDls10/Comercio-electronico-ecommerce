'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { useEffect } from 'react';
import { useMounted } from '@/lib/hooks';
import { useShop, useUser, type User } from '@/store/shop';
import { Icon } from '../Icons';

const TABS = [
  { href: '/cuenta', label: 'Resumen' },
  { href: '/cuenta/pedidos', label: 'Mis pedidos' },
  { href: '/favoritos', label: 'Favoritos' },
  { href: '/cuenta/perfil', label: 'Perfil y dirección' },
];

const initials = (name: string) => name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('');

// Protege las páginas de la cuenta: sin sesión redirige al inicio de sesión.
export function AccountShell({ children }: { title?: React.ReactNode; children: (u: User) => React.ReactNode }) {
  const mounted = useMounted();
  const user = useUser();
  const logout = useShop((s) => s.logout);
  const path = usePathname();
  const router = useRouter();
  useEffect(() => { if (mounted && !user) router.replace(`/cuenta/ingresar?next=${path}`); }, [mounted, user, path, router]);
  if (!mounted || !user) return <section className="wrap acct-head" style={{ minHeight: 220 }} />;

  const since = new Date(user.created).toLocaleDateString('es-DO', { month: 'long', year: 'numeric' });
  return (
    <>
      <section className="wrap acct-head">
        <div className="acct-id">
          <span className="acct-avatar" aria-hidden="true">{initials(user.name)}</span>
          <div>
            <h1>{user.name}</h1>
            <p>{user.email} · Cliente desde {since}</p>
          </div>
        </div>
        <div className="acct-actions">
          <Link href="/tienda" className="btn btn--sm btn--ghost">Seguir comprando</Link>
          <button className="acct-logout" onClick={() => { logout(); router.push('/'); }}><Icon.logout /> Cerrar sesión</button>
        </div>
      </section>
      <nav className="wrap acct-tabs" aria-label="Mi cuenta">
        {TABS.map((t) => {
          const on = path === t.href || (t.href !== '/cuenta' && path.startsWith(t.href));
          return (
            <Link key={t.href} href={t.href} className={on ? 'active' : ''} aria-current={on ? 'page' : undefined}>
              {t.label}
              {on && <motion.span layoutId="acct-tab" className="acct-tabs__bar" transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} />}
            </Link>
          );
        })}
      </nav>
      <div className="wrap acct-body">{children(user)}</div>
    </>
  );
}
