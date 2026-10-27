'use client';
import Image from 'next/image';
import Link from 'next/link';
import { fmt, itbisOf, SHIP_METHODS } from '@/lib/pricing';
import { TotalsRows } from './Totals';
import type { Order } from '@/store/shop';

const STAGES = ['Confirmado', 'Preparando', 'En camino', 'Entregado'];

// Estado simulado según el tiempo transcurrido desde la compra.
export function orderStage(o: Order) {
  const h = (Date.now() - new Date(o.date).getTime()) / 36e5;
  const fast = o.method !== 'standard';
  if (h < (fast ? 0.25 : 1)) return 0;
  if (h < (fast ? 1 : 12)) return 1;
  if (h < (fast ? 3 : 36)) return 2;
  return 3;
}
export const stageLabel = (o: Order) => STAGES[orderStage(o)];

export function OrderTimeline({ o }: { o: Order }) {
  const s = orderStage(o);
  return (
    <div className="timeline">
      {STAGES.map((l, i) => <div key={l} className={i <= s ? 'on' : ''}><i />{l}</div>)}
    </div>
  );
}

export function OrderItems({ o }: { o: Order }) {
  return (
    <div className="order-items">
      {o.items.map((it) => (
        <Link key={`${it.id}-${it.ml}`} href={`/producto/${it.id}`} className="sum-item">
          <div className="img"><Image src={it.img} alt="" width={64} height={76} /><b>{it.qty}</b></div>
          <div><strong>{it.name}</strong><span>{it.brand} · {it.ml} ml</span></div>
          <span>{fmt(it.price * it.qty)}</span>
        </Link>
      ))}
      <div style={{ marginTop: 10 }}>
        <TotalsRows
          t={{ subtotal: o.subtotal, discount: o.discount, shipping: o.shipping, total: o.total, itbis: o.itbis ?? itbisOf(o.total), net: o.total - (o.itbis ?? itbisOf(o.total)) }}
          promo={o.promo} shipLabel={SHIP_METHODS[o.method].name} totalLabel="Total pagado"
        />
      </div>
    </div>
  );
}

export function OrderMeta({ o }: { o: Order }) {
  return (
    <div className="order-meta">
      <div><h4>Envío</h4><p>{o.address.first} {o.address.last}<br />{o.address.address}, {o.address.city}, {o.address.prov}<br />{o.address.phone}</p></div>
      <div><h4>Entrega</h4><p>{SHIP_METHODS[o.method].name}<br />{SHIP_METHODS[o.method].desc}</p></div>
      <div><h4>Pago</h4><p>{o.payment.label}{o.payment.ref ? <><br /><small className="muted">Ref. {o.payment.ref}</small></> : null}{o.gift ? <><br />Envuelto para regalo</> : null}</p></div>
    </div>
  );
}
