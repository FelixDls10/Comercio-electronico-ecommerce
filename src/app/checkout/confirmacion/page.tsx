'use client';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { useMounted } from '@/lib/hooks';
import { useShop } from '@/store/shop';
import { Icon } from '@/components/Icons';
import { OrderItems, OrderMeta, OrderTimeline } from '@/components/OrderDetail';
import { Reveal } from '@/components/Reveal';

function Confirm() {
  const mounted = useMounted();
  const no = useSearchParams().get('no');
  const order = useShop((s) => s.orders.find((o) => o.no === no));
  const session = useShop((s) => s.session);
  if (!mounted) return <section className="wrap confirm" />;
  if (!order) {
    return (
      <section className="wrap confirm">
        <h1>Pedido no encontrado</h1>
        <p>No encontramos ese número de pedido en este dispositivo.</p>
        <Link href="/" className="btn" style={{ marginTop: 24 }}>Volver al inicio</Link>
      </section>
    );
  }
  const eta = order.method === 'express' ? 'hoy mismo' : order.method === 'pickup' ? 'en 2 horas en nuestra tienda de Piantini' : 'en las próximas 24–48 horas';
  return (
    <section className="wrap confirm">
      <Reveal hero media className="confirm__icon"><svg viewBox="0 0 24 24"><path d="m5 12.5 4.5 4.5L19 7.5" /></svg></Reveal>
      <Reveal hero>
        <h1>¡Gracias, {order.name}!</h1>
        <p>Tu pedido fue recibido y lo estamos preparando con mucho cuidado. Lo recibirás {eta}. Enviamos la confirmación a <strong>{order.email}</strong>.</p>
        <span className="order-no">Pedido {order.no}</span>
      </Reveal>
      <Reveal><OrderTimeline o={order} /></Reveal>
      <Reveal className="panel confirm__panel">
        <OrderMeta o={order} />
        <OrderItems o={order} />
      </Reveal>
      <Reveal className="confirm__actions">
        <Link href="/tienda" className="btn">Seguir explorando <Icon.arrow /></Link>
        {session ? <Link href={`/cuenta/pedidos/${order.no}`} className="btn btn--ghost">Ver en mi cuenta</Link>
          : <Link href={`/cuenta/registro?email=${encodeURIComponent(order.email)}`} className="btn btn--ghost">Crear cuenta para seguir tu pedido</Link>}
      </Reveal>
    </section>
  );
}

export default function ConfirmacionPage() {
  return <Suspense><Confirm /></Suspense>;
}
