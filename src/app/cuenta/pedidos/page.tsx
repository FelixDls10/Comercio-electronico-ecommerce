'use client';
import Image from 'next/image';
import Link from 'next/link';
import { fmt } from '@/lib/pricing';
import { useShop } from '@/store/shop';
import { AccountShell } from '@/components/account/AccountShell';
import { stageLabel } from '@/components/OrderDetail';
import { Reveal } from '@/components/Reveal';

export default function PedidosPage() {
  const orders = useShop((s) => s.orders);
  return (
    <AccountShell title={<>Mis <em>pedidos</em></>}>
      {(u) => {
        const mine = orders.filter((o) => o.email === u.email);
        return (
          <Reveal className="panel">
            {mine.length ? (
              <div className="order-list">
                {mine.map((o) => (
                  <Link key={o.no} href={`/cuenta/pedidos/${o.no}`} className="order-row">
                    <div className="order-row__imgs">{o.items.slice(0, 3).map((it) => <Image key={it.id + it.ml} src={it.img} alt="" width={40} height={50} />)}</div>
                    <div><strong>{o.no}</strong><span>{new Date(o.date).toLocaleString('es-DO', { dateStyle: 'medium', timeStyle: 'short' })} · {o.payment.label}</span></div>
                    <span className="status">{stageLabel(o)}</span>
                    <span className="price">{fmt(o.total)}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="no-results" style={{ border: 0 }}>
                <h3>Aún no tienes pedidos</h3>
                <p>Cuando compres, podrás seguir aquí cada envío.</p>
                <Link href="/tienda" className="btn btn--sm">Ir a la tienda</Link>
              </div>
            )}
          </Reveal>
        );
      }}
    </AccountShell>
  );
}
