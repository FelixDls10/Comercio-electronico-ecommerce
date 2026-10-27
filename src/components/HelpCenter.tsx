'use client';
import Link from 'next/link';
import { AnimatePresence, motion } from 'motion/react';
import { useMemo, useState } from 'react';
import { Icon } from './Icons';
import { norm } from './Overlays';
import { EASE, Reveal } from './Reveal';

type QA = { q: string; a: React.ReactNode; text: string };
const FAQ: { key: string; label: string; icon: React.ReactNode; items: QA[] }[] = [
  { key: 'pedidos', label: 'Pedidos y envíos', icon: <Icon.truck />, items: [
    { q: '¿Cuánto tarda el envío?', text: 'Gran Santo Domingo y Santiago 24 h resto del país 24-48 h express mismo día', a: <>Gran Santo Domingo y Santiago: 24 h. Resto del país: 24–48 h. Express el mismo día en el Gran Santo Domingo para pedidos antes de las 2:00 p. m.</> },
    { q: '¿Cuánto cuesta el envío?', text: 'RD$ 250 gratis desde RD$ 5,000 express 450 retiro gratis', a: <>Envío estándar RD$ 250 y <strong>gratis desde RD$ 5,000</strong>. Express RD$ 450. Retiro en tienda siempre gratis.</> },
    { q: '¿Cómo sigo mi pedido?', text: 'seguimiento mi cuenta pedidos whatsapp', a: <>Desde <Link href="/cuenta/pedidos">Mi cuenta → Mis pedidos</Link> verás cada etapa: confirmado, preparando, en camino y entregado. También te avisamos por WhatsApp.</> },
    { q: '¿Puedo cambiar la dirección después de comprar?', text: 'cambiar direccion pedido', a: <>Sí, mientras el pedido no haya salido. Escríbenos por WhatsApp con tu número de pedido.</> },
  ] },
  { key: 'pagos', label: 'Pagos', icon: <Icon.lock />, items: [
    { q: '¿Qué métodos de pago aceptan?', text: 'tarjeta visa mastercard amex stripe paypal transferencia contra entrega', a: <>Tarjetas Visa, Mastercard y American Express (procesadas por Stripe), PayPal, transferencia bancaria (Banreservas, Popular, BHD) y pago contra entrega.</> },
    { q: '¿Es seguro pagar con tarjeta?', text: 'seguro tarjeta datos cifrado pci 3d secure', a: <>Sí. Los datos viajan cifrados directamente a Stripe, certificado PCI DSS nivel 1, con verificación 3D Secure de tu banco. Nosotros nunca vemos ni guardamos tu tarjeta.</> },
    { q: '¿Por qué PayPal cobra en dólares?', text: 'paypal dolares tasa', a: <>PayPal no opera con pesos dominicanos, por eso el monto se convierte a US$ con la tasa indicada al pagar.</> },
    { q: '¿Emiten factura con comprobante fiscal?', text: 'factura ncf comprobante fiscal', a: <>Sí. Indícalo en las notas del pedido con tu RNC y te enviamos la factura con NCF por correo.</> },
  ] },
  { key: 'productos', label: 'Productos', icon: <Icon.drop />, items: [
    { q: '¿Los perfumes son originales?', text: 'originales autenticos lote garantia', a: <>Siempre. Compramos a distribuidores autorizados, cada frasco llega sellado y con lote verificable. Si no fuera original, te devolvemos el doble.</> },
    { q: '¿Qué diferencia hay entre EDT, EDP y Parfum?', text: 'eau de toilette eau de parfum concentracion duracion', a: <>La concentración de esencia: Eau de Toilette (8–12%), Eau de Parfum (15–20%) y Parfum o Elixir (20–30%). A mayor concentración, más duración y profundidad.</> },
    { q: '¿Cómo elijo una fragancia sin olerla?', text: 'elegir test muestra notas', a: <>Haz nuestro <Link href="/#quiz">test olfativo</Link>, revisa la pirámide de notas de cada producto o escríbenos para una asesoría. Además, cada pedido incluye una muestra de cortesía.</> },
    { q: '¿Cómo hago que mi perfume dure más?', text: 'durar aplicar piel hidratada', a: <>Aplícalo sobre piel hidratada en los puntos de pulso, sin frotar, y guárdalo lejos del sol y de la humedad del baño.</> },
  ] },
  { key: 'cambios', label: 'Cambios y devoluciones', icon: <Icon.return />, items: [
    { q: '¿Puedo devolver un perfume?', text: 'devolver 7 dias sellado', a: <>Sí, dentro de 7 días si está sellado y sin abrir. Consulta la <Link href="/legal/devoluciones">política completa</Link>.</> },
    { q: 'Mi perfume llegó dañado, ¿qué hago?', text: 'roto dañado fuga reemplazo', a: <>Envíanos una foto en las primeras 48 horas y lo reemplazamos sin costo, recogiéndolo en tu domicilio.</> },
    { q: '¿Cuándo recibo mi reembolso?', text: 'reembolso dias tarjeta paypal transferencia', a: <>Tarjeta y PayPal: 5–10 días hábiles según tu banco. Transferencia: 2 días hábiles.</> },
  ] },
  { key: 'cuenta', label: 'Mi cuenta', icon: <Icon.user />, items: [
    { q: '¿Necesito una cuenta para comprar?', text: 'cuenta invitado registro', a: <>No, puedes comprar como invitado. Con una <Link href="/cuenta/registro">cuenta</Link> guardas direcciones, sigues pedidos y sincronizas tus favoritos.</> },
    { q: 'Olvidé mi contraseña', text: 'contraseña olvidada recuperar', a: <>Usa <Link href="/cuenta/recuperar">Recuperar contraseña</Link> y te enviaremos un enlace a tu correo.</> },
    { q: '¿Cómo uso un código de descuento?', text: 'codigo descuento cupon royale10', a: <>Escríbelo en la bolsa o en el checkout. Suscríbete al Club Royale y recibe <strong>ROYALE10</strong> (10% en tu primera compra).</> },
  ] },
];

export function HelpCenter() {
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('all');
  const list = useMemo(() => {
    const words = norm(q).split(/\s+/).filter(Boolean);
    return FAQ.filter((c) => cat === 'all' || c.key === cat)
      .map((c) => ({ ...c, items: c.items.filter((it) => words.every((w) => norm(`${it.q} ${it.text}`).includes(w))) }))
      .filter((c) => c.items.length);
  }, [q, cat]);

  return (
    <div className="wrap help-center">
      <Reveal className="help-search">
        <Icon.search />
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Busca tu pregunta: envío, devolución, PayPal…" aria-label="Buscar en preguntas frecuentes" />
      </Reveal>
      <Reveal className="help-cats">
        <button className={`chip ${cat === 'all' ? 'active' : ''}`} onClick={() => setCat('all')}>Todas</button>
        {FAQ.map((c) => <button key={c.key} className={`chip ${cat === c.key ? 'active' : ''}`} onClick={() => setCat(c.key)}>{c.icon}{c.label}</button>)}
      </Reveal>
      <AnimatePresence mode="wait">
        <motion.div key={cat + q} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4, ease: EASE }}>
          {list.length ? list.map((c) => (
            <section key={c.key} className="help-group">
              <h2>{c.icon}{c.label}</h2>
              {c.items.map((it, i) => (
                <details className="acc" key={it.q} open={!!q && i === 0}>
                  <summary>{it.q} <Icon.chevron /></summary>
                  <div className="acc__body">{it.a}</div>
                </details>
              ))}
            </section>
          )) : (
            <div className="no-results"><h3>Sin resultados</h3><p>No encontramos “{q}”. Escríbenos y te respondemos enseguida.</p><Link href="/contacto" className="btn btn--sm">Contactar</Link></div>
          )}
        </motion.div>
      </AnimatePresence>
      <Reveal className="help-cta">
        <div><h3>¿No encontraste tu respuesta?</h3><p>Nuestro equipo responde por WhatsApp en minutos.</p></div>
        <Link href="/contacto" className="btn">Contactar a un asesor <Icon.arrow /></Link>
      </Reveal>
    </div>
  );
}
