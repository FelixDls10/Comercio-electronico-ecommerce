'use client';
import Image from 'next/image';
import Link from 'next/link';
import { PRODUCTS } from '@/lib/products';
import { fmt } from '@/lib/pricing';
import { useShop } from '@/store/shop';
import { AccountShell } from '@/components/account/AccountShell';
import { Icon } from '@/components/Icons';
import { OrderTimeline, stageLabel } from '@/components/OrderDetail';
import { Reveal } from '@/components/Reveal';

const date = (d: string) => new Date(d).toLocaleDateString('es-DO', { day: 'numeric', month: 'short', year: 'numeric' });

export default function CuentaPage() {
  const orders = useShop((s) => s.orders);
  const wish = useShop((s) => s.wish);
  return (
    <AccountShell>
      {(u) => {
        const mine = orders.filter((o) => o.email === u.email);
        const last = mine[0];
        const spent = mine.reduce((a, o) => a + o.total, 0);
        const favs = wish.map((id) => PRODUCTS.find((p) => p.id === id)).filter(Boolean).slice(0, 4);
        return (
          <div className="acct-grid">
            <Reveal className="acct-card acct-card--main">
              {last ? (
                <>
                  <div className="acct-card__top">
                    <div><span className="acct-label">Tu último pedido</span><h2>{last.no}</h2><p className="muted">{date(last.date)} · {last.items.reduce((a, i) => a + i.qty, 0)} artículos · {fmt(last.total)}</p></div>
                    <span className="status-pill">{stageLabel(last)}</span>
                  </div>
                  <OrderTimeline o={last} />
                  <div className="acct-card__foot">
                    <div className="acct-thumbs">{last.items.slice(0, 4).map((it) => <span key={it.id + it.ml}><Image src={it.img} alt={it.name} width={60} height={80} /></span>)}</div>
                    <Link href={`/cuenta/pedidos/${last.no}`} className="btn btn--sm">Ver seguimiento <Icon.arrow /></Link>
                  </div>
                </>
              ) : (
                <div className="acct-empty">
                  <span className="acct-label">Tu primer pedido</span>
                  <h2>Aún no has comprado</h2>
                  <p className="muted">Cuando compres, aquí verás el seguimiento en tiempo real.</p>
                  <Link href="/tienda" className="btn btn--sm">Explorar la tienda <Icon.arrow /></Link>
                </div>
              )}
            </Reveal>

            <Reveal className="acct-card acct-stats" delay={0.1}>
              <span className="acct-label">Tu actividad</span>
              <ul>
                <li><span className="acct-ico"><Icon.box /></span><div><small>Pedidos</small><strong>{mine.length}</strong></div></li>
                <li><span className="acct-ico"><Icon.tag /></span><div><small>Total comprado</small><strong>{fmt(spent)}</strong></div></li>
                <li><span className="acct-ico"><Icon.heart /></span><div><small>Favoritos guardados</small><strong>{wish.length}</strong></div></li>
              </ul>
            </Reveal>

            <Reveal className="acct-card">
              <div className="acct-card__row"><h3>Pedidos recientes</h3><Link className="link-arrow" href="/cuenta/pedidos">Ver todos <Icon.arrow /></Link></div>
              {mine.length ? (
                <div className="order-list">
                  {mine.slice(0, 3).map((o) => (
                    <Link key={o.no} href={`/cuenta/pedidos/${o.no}`} className="order-row">
                      <div className="order-row__imgs">{o.items.slice(0, 3).map((it) => <Image key={it.id + it.ml} src={it.img} alt="" width={40} height={50} />)}</div>
                      <div><strong>{o.no}</strong><span>{date(o.date)}</span></div>
                      <span className="status">{stageLabel(o)}</span>
                      <span className="price">{fmt(o.total)}</span>
                    </Link>
                  ))}
                </div>
              ) : <p className="muted">Todavía no hay pedidos.</p>}
            </Reveal>

            <Reveal className="acct-card" delay={0.1}>
              <div className="acct-card__row"><h3>Dirección de envío</h3><Link className="link-arrow" href="/cuenta/perfil">Editar <Icon.arrow /></Link></div>
              {u.address
                ? <p className="acct-address"><Icon.pin />{u.address.first} {u.address.last}<br />{u.address.address}, {u.address.city}<br />{u.address.prov} · {u.address.phone}</p>
                : <p className="muted">Se guardará automáticamente con tu próxima compra.</p>}
              <div className="acct-promo"><span>Tu código de bienvenida</span><strong>ROYALE10</strong><small>10% en tu próxima compra</small></div>
            </Reveal>

            {favs.length ? (
              <Reveal className="acct-card acct-card--wide">
                <div className="acct-card__row"><h3>Tus favoritos</h3><Link className="link-arrow" href="/favoritos">Ver todos <Icon.arrow /></Link></div>
                <div className="acct-favs">
                  {favs.map((p) => p && (
                    <Link key={p.id} href={`/producto/${p.id}`} className="mini"><Image src={p.img} alt="" width={48} height={60} /><div><strong>{p.name}</strong><span>{p.brand} · {fmt(p.price)}</span></div></Link>
                  ))}
                </div>
              </Reveal>
            ) : null}
          </div>
        );
      }}
    </AccountShell>
  );
}
