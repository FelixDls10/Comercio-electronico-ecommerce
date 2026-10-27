'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { TotalsRows } from '../Totals';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { PROVINCES } from '@/lib/products';
import { computeTotals, fmt, SHIP_METHODS, type ShipMethod } from '@/lib/pricing';
import { useMounted } from '@/lib/hooks';
import { useShop, useUser, type Address, type Order } from '@/store/shop';
import { Field, SelectField } from '../forms';
import { Brand, Icon } from '../Icons';
import { PageHead } from '../PageHead';
import { EASE, Reveal } from '../Reveal';
import { PayPalPayment, StripePayment, type Paid } from './Payments';
import { PromoForm } from './PromoForm';

const addressSchema = z.object({
  first: z.string().trim().min(2, 'Escribe tu nombre'),
  last: z.string().trim().min(2, 'Escribe tu apellido'),
  email: z.email('Introduce un correo válido'),
  phone: z.string().refine((v) => v.replace(/\D/g, '').length >= 10, 'Introduce un teléfono de 10 dígitos'),
  address: z.string().trim().min(5, 'Escribe la calle, número y sector'),
  city: z.string().trim().min(2, 'Escribe la ciudad'),
  prov: z.string().min(1),
  notes: z.string().max(200).optional(),
});

type PayKind = 'card' | 'paypal' | 'transfer' | 'cod';
const PAY_OPTIONS: Record<PayKind, [string, string]> = {
  card: ['Tarjeta de crédito o débito', 'Visa, Mastercard, American Express · procesado por Stripe'],
  paypal: ['PayPal', 'Paga con tu cuenta PayPal o tarjeta'],
  transfer: ['Transferencia bancaria', 'Banreservas, Popular o BHD · te enviamos los datos'],
  cod: ['Pago contra entrega', 'Efectivo o tarjeta al recibir (Gran Santo Domingo y Santiago)'],
};

function Summary({ method }: { method: ShipMethod }) {
  const cart = useShop((s) => s.cart);
  const promo = useShop((s) => s.promo);
  const t = computeTotals(cart, promo, method);
  return (
    <aside className="summary">
      <h3>Resumen</h3>
      {t.lines.map((l) => (
        <div className="sum-item" key={`${l.id}-${l.ml}`}>
          <div className="img"><Image src={l.p.img} alt="" width={64} height={76} /><b>{l.qty}</b></div>
          <div><strong>{l.p.name}</strong><span>{l.p.brand} · {l.ml} ml</span></div>
          <span>{fmt(l.total)}</span>
        </div>
      ))}
      <PromoForm />
      <TotalsRows t={t} promo={promo} shipLabel={SHIP_METHODS[method].name} />
      <div className="demo-note"><Icon.gift /><span>Incluimos una muestra de cortesía y empaque de regalo en tu pedido.</span></div>
    </aside>
  );
}

export function CheckoutView() {
  const mounted = useMounted();
  const router = useRouter();
  const user = useUser();
  const { cart, promo, addOrder, clearCart, updateUser } = useShop();
  const [step, setStep] = useState(1);
  const [method, setMethod] = useState<ShipMethod>('standard');
  const [address, setAddress] = useState<Address | null>(null);
  const [pay, setPay] = useState<PayKind>('card');
  const [terms, setTerms] = useState(false);
  const [gift, setGift] = useState(false);
  const [saveAddr, setSaveAddr] = useState(true);
  const [placing, setPlacing] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<Address>({
    resolver: zodResolver(addressSchema),
    values: user?.address ?? (user ? { first: user.name.split(' ')[0] ?? '', last: user.name.split(' ').slice(1).join(' '), email: user.email, phone: user.phone, address: '', city: '', prov: PROVINCES[0], notes: '' } : undefined),
    defaultValues: { prov: PROVINCES[0] },
  });

  if (!mounted || placing) return <PageHead crumb="Checkout" title={<>Finalizar <em>compra</em></>} sub={placing ? 'Confirmando tu pedido…' : undefined} />;
  if (!cart.length) {
    return (
      <>
        <PageHead crumb="Checkout" title={<>Tu bolsa está <em>vacía</em></>} sub="Agrega alguna fragancia para continuar con tu compra." />
        <div className="wrap" style={{ paddingBottom: 110 }}><Link href="/tienda" className="btn">Explorar la tienda <Icon.arrow /></Link></div>
      </>
    );
  }

  const t = computeTotals(cart, promo, method);

  const place = (payment: Order['payment']) => {
    if (!address) return;
    setPlacing(true);
    const order: Order = {
      no: `RP-${Date.now().toString().slice(-7)}`, date: new Date().toISOString(),
      email: address.email, name: address.first,
      items: t.lines.map((l) => ({ id: l.id, name: l.p.name, brand: l.p.brand, img: l.p.img, ml: l.ml, qty: l.qty, price: l.size.price })),
      subtotal: t.subtotal, discount: t.discount, shipping: t.shipping, total: t.total, itbis: t.itbis, promo,
      address, method, gift, payment,
    };
    addOrder(order);
    if (user && saveAddr) updateUser({ address });
    clearCart();
    router.push(`/checkout/confirmacion?no=${order.no}`);
  };
  const onPaid = (p: Paid) => place(p);

  return (
    <>
      <PageHead crumb="Checkout" title={<>Finalizar <em>compra</em></>} parent={{ href: '/carrito', label: 'Bolsa' }} />
      <div className="wrap checkout">
        <div>
          {!user && step === 1 && (
            <Reveal className="login-hint">
              <Icon.user /><span>¿Ya tienes cuenta? <Link href="/cuenta/ingresar?next=/checkout">Inicia sesión</Link> para usar tus datos guardados y seguir tus pedidos.</span>
            </Reveal>
          )}
          <div className="steps">
            {['Información y envío', 'Pago'].map((n, i) => (
              <button key={n} disabled={step <= i + 1} onClick={() => setStep(i + 1)} className={step === i + 1 ? 'active' : step > i + 1 ? 'done' : ''}>
                <b>{step > i + 1 ? '✓' : i + 1}</b><span>{n}</span>
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.form key="s1" className="co-step" noValidate initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.5, ease: EASE }}
                onSubmit={handleSubmit((d) => { setAddress(d); setStep(2); window.scrollTo({ top: 0, behavior: 'smooth' }); })}>
                <h2>Datos de contacto y envío</h2>
                <div className="fields">
                  <Field label="Nombre" autoComplete="given-name" error={errors.first?.message} {...register('first')} />
                  <Field label="Apellido" autoComplete="family-name" error={errors.last?.message} {...register('last')} />
                  <Field label="Correo electrónico" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
                  <Field label="Teléfono / WhatsApp" type="tel" inputMode="tel" autoComplete="tel" error={errors.phone?.message} {...register('phone')} />
                  <Field label="Calle, número y sector" full autoComplete="street-address" error={errors.address?.message} {...register('address')} />
                  <Field label="Ciudad" autoComplete="address-level2" error={errors.city?.message} {...register('city')} />
                  <SelectField label="Provincia" options={PROVINCES} {...register('prov')} />
                  <Field label="Referencia o notas para el mensajero (opcional)" textarea full {...register('notes')} />
                </div>
                {user && <label className="check"><input type="checkbox" checked={saveAddr} onChange={(e) => setSaveAddr(e.target.checked)} /> Guardar esta dirección en mi cuenta</label>}
                <h3>Método de entrega</h3>
                <div className="options">
                  {(Object.keys(SHIP_METHODS) as ShipMethod[]).map((k) => {
                    const m = SHIP_METHODS[k]; const price = m.price(t.subtotal);
                    return (
                      <label className="option" key={k}>
                        <input type="radio" name="method" checked={method === k} onChange={() => setMethod(k)} />
                        <span className="dot" /><span className="o-main"><strong>{m.name}</strong><span>{m.desc}</span></span>
                        <span className="o-price">{price ? fmt(price) : 'Gratis'}</span>
                      </label>
                    );
                  })}
                </div>
                <div className="co-actions">
                  <Link href="/carrito" className="back-link"><Icon.arrowL /> Volver a la bolsa</Link>
                  <button className="btn" type="submit">Continuar al pago <Icon.arrow /></button>
                </div>
              </motion.form>
            ) : (
              <motion.div key="s2" className="co-step" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.5, ease: EASE }}>
                <h2>Pago</h2>
                <div className="review-block">
                  <div><h4>Enviar a</h4><p>{address!.first} {address!.last} · {address!.phone}<br />{address!.address}, {address!.city}, {address!.prov}</p></div>
                  <button onClick={() => setStep(1)}>Editar</button>
                </div>
                <div className="review-block">
                  <div><h4>Entrega</h4><p>{SHIP_METHODS[method].name} — {SHIP_METHODS[method].desc}</p></div>
                  <button onClick={() => setStep(1)}>Editar</button>
                </div>

                <h3>Método de pago</h3>
                <div className="options">
                  {(Object.keys(PAY_OPTIONS) as PayKind[]).map((k) => (
                    <div key={k} className={`pay-option ${pay === k ? 'open' : ''}`}>
                      <label className="option">
                        <input type="radio" name="pay" checked={pay === k} onChange={() => setPay(k)} />
                        <span className="dot" /><span className="o-main"><strong>{PAY_OPTIONS[k][0]}</strong><span>{PAY_OPTIONS[k][1]}</span></span>
                        <span className="pay-brands">{k === 'card' ? <><Brand name="visa" /><Brand name="mastercard" /><Brand name="amex" /></> : k === 'paypal' ? <Brand name="paypal" /> : null}</span>
                      </label>
                    </div>
                  ))}
                </div>

                <label className="check"><input type="checkbox" checked={gift} onChange={(e) => setGift(e.target.checked)} /> Es un regalo: incluir tarjeta escrita a mano y ocultar precios.</label>
                <label className="check"><input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} /> Acepto los <Link href="/legal/terminos" target="_blank" style={{ textDecoration: 'underline' }}>términos y condiciones</Link> y la <Link href="/legal/privacidad" target="_blank" style={{ textDecoration: 'underline' }}>política de privacidad</Link>.</label>

                <AnimatePresence mode="wait">
                  <motion.div key={pay} className="pay-panel" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4, ease: EASE }}>
                    {pay === 'card' && <StripePayment items={cart} promo={promo} method={method} email={address!.email} disabled={!terms || placing} onPaid={onPaid} />}
                    {pay === 'paypal' && <PayPalPayment total={t.total} disabled={!terms || placing} onPaid={onPaid} />}
                    {(pay === 'transfer' || pay === 'cod') && (
                      <>
                        <div className="demo-note" style={{ marginTop: 0 }}><Icon.info /><span>{pay === 'transfer'
                          ? 'Al confirmar te enviaremos por correo y WhatsApp las cuentas de Banreservas, Popular y BHD. Tu pedido se reserva por 24 horas.'
                          : 'Paga en efectivo o con tarjeta al mensajero. Disponible en el Gran Santo Domingo y Santiago.'}</span></div>
                        <button className="btn btn--block" style={{ marginTop: 18 }} disabled={!terms || placing}
                          onClick={() => place({ type: pay, label: PAY_OPTIONS[pay][0] })}>
                          <Icon.lock /> {placing ? 'Procesando…' : `Confirmar pedido · ${fmt(t.total)}`}
                        </button>
                      </>
                    )}
                  </motion.div>
                </AnimatePresence>
                <div className="co-actions"><button type="button" className="back-link" onClick={() => setStep(1)}><Icon.arrowL /> Volver a envío</button>
                  <span className="secure-note"><Icon.lock /> Conexión cifrada · No guardamos datos de tarjetas</span></div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <Summary method={method} />
      </div>
    </>
  );
}
