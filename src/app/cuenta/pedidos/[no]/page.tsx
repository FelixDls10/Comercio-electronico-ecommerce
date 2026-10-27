'use client';
import Link from 'next/link';
import { Suspense } from 'react';
import { useParams } from 'next/navigation';
import { useShop, useUI } from '@/store/shop';
import { AccountShell } from '@/components/account/AccountShell';
import { Icon } from '@/components/Icons';
import { OrderItems, OrderMeta, OrderTimeline } from '@/components/OrderDetail';
import { Reveal } from '@/components/Reveal';

function Pedido() {
  const { no } = useParams<{ no: string }>();
  const orders = useShop((s) => s.orders);
  const add = useShop((s) => s.add);
  const set = useUI((s) => s.set);
  return (
    <AccountShell title={<>Pedido <em>{no}</em></>}>
      {(u) => {
        const o = orders.find((x) => x.no === no && x.email === u.email);
        if (!o) return <Reveal className="panel"><h3>Pedido no encontrado</h3><Link href="/cuenta/pedidos" className="back-link"><Icon.arrowL /> Volver a mis pedidos</Link></Reveal>;
        return (
          <>
            <Reveal className="panel">
              <div className="section-head" style={{ marginBottom: 6 }}>
                <div><h3 style={{ margin: 0 }}>Seguimiento</h3><p className="muted" style={{ fontSize: 14 }}>Realizado el {new Date(o.date).toLocaleString('es-DO', { dateStyle: 'long', timeStyle: 'short' })}</p></div>
                <button className="btn btn--sm" onClick={() => { o.items.forEach((it) => add(it.id, it.ml, it.qty)); set({ cartOpen: true }); }}><Icon.return /> Volver a comprar</button>
              </div>
              <OrderTimeline o={o} />
            </Reveal>
            <Reveal className="panel"><OrderMeta o={o} /></Reveal>
            <Reveal className="panel"><h3>Artículos</h3><OrderItems o={o} /></Reveal>
            <Link href="/cuenta/pedidos" className="back-link"><Icon.arrowL /> Volver a mis pedidos</Link>
          </>
        );
      }}
    </AccountShell>
  );
}

export default function PedidoPage() {
  return <Suspense><Pedido /></Suspense>;
}
