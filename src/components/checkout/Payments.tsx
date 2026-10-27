'use client';
// Métodos de pago: Stripe (tarjeta real en modo prueba), tarjeta simulada si Stripe no está configurado, y PayPal Sandbox.
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe, type Stripe } from '@stripe/stripe-js';
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';
import { useEffect, useState } from 'react';
import type { CartLine, ShipMethod } from '@/lib/pricing';
import { fmt, toUSD, USD_RATE } from '@/lib/pricing';
import { Icon } from '../Icons';

export type Paid = { type: 'stripe' | 'card-demo' | 'paypal'; label: string; ref?: string };

const STRIPE_PK = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const PAYPAL_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'test';
let stripePromise: Promise<Stripe | null> | null = null;
const getStripe = () => (stripePromise ??= STRIPE_PK ? loadStripe(STRIPE_PK, { locale: 'es' }) : Promise.resolve(null));

const BRAND_APPEARANCE = {
  theme: 'stripe' as const,
  variables: {
    colorPrimary: '#003449', colorText: '#10222b', colorBackground: '#fbf9f5', colorDanger: '#b4483c',
    fontFamily: 'Inter, system-ui, sans-serif', borderRadius: '14px', spacingUnit: '4px',
  },
  rules: { '.Input': { border: '1px solid #e4ded4', boxShadow: 'none', padding: '14px' }, '.Input:focus': { border: '1px solid #003449', boxShadow: '0 0 0 4px rgba(0,52,73,.07)' } },
};

/* ---------- Stripe ---------- */
function StripeForm({ total, email, disabled, onPaid }: { total: number; email: string; disabled: boolean; onPaid: (p: Paid) => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const pay = async () => {
    if (!stripe || !elements) return;
    setBusy(true); setError('');
    const { error: err, paymentIntent } = await stripe.confirmPayment({
      elements, redirect: 'if_required',
      confirmParams: { return_url: `${window.location.origin}/checkout/confirmacion`, receipt_email: email },
    });
    if (err) { setError(err.message ?? 'No se pudo procesar el pago.'); setBusy(false); return; }
    // Verificación en el servidor del estado del cobro.
    const v = await fetch(`/api/checkout/verify?id=${paymentIntent!.id}`).then((r) => r.json()).catch(() => null);
    if (v?.status !== 'succeeded') { setError('El pago no se completó. Intenta con otra tarjeta.'); setBusy(false); return; }
    const pm = paymentIntent!.payment_method;
    onPaid({ type: 'stripe', label: typeof pm === 'object' && pm?.card ? `${pm.card.brand.toUpperCase()} •••• ${pm.card.last4}` : 'Tarjeta (Stripe)', ref: paymentIntent!.id });
  };
  return (
    <>
      <PaymentElement options={{ layout: 'tabs', fields: { billingDetails: { email: 'never' } }, defaultValues: { billingDetails: { email } } }} />
      {error && <p className="err-msg" role="alert">{error}</p>}
      <button type="button" className="btn btn--block" style={{ marginTop: 18 }} disabled={!stripe || busy || disabled} onClick={pay}>
        <Icon.lock /> {busy ? 'Procesando…' : `Pagar ${fmt(total)}`}
      </button>
    </>
  );
}

export function StripePayment({ items, promo, method, email, disabled, onPaid }: { items: CartLine[]; promo: string | null; method: ShipMethod; email: string; disabled: boolean; onPaid: (p: Paid) => void }) {
  const [state, setState] = useState<{ secret?: string; total?: number; error?: string; off?: boolean }>({});
  const key = JSON.stringify({ items, promo, method });
  useEffect(() => {
    if (!STRIPE_PK) { setState({ off: true }); return; }
    let alive = true;
    setState({});
    fetch('/api/checkout/payment-intent', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items, promo, method, email: email || undefined }) })
      .then(async (r) => ({ ok: r.ok, status: r.status, data: await r.json() }))
      .then(({ ok, status, data }) => {
        if (!alive) return;
        if (status === 503) setState({ off: true });
        else if (!ok) setState({ error: data.error ?? 'No se pudo iniciar el pago.' });
        else setState({ secret: data.clientSecret, total: data.total });
      })
      .catch(() => alive && setState({ error: 'Sin conexión con el servidor de pagos.' }));
    return () => { alive = false; };
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

  if (state.off) return <DemoCard disabled={disabled} onPaid={onPaid} />;
  if (state.error) return <p className="err-msg">{state.error}</p>;
  if (!state.secret) return <div className="pay-loading"><span className="spinner" /> Conectando con Stripe…</div>;
  return (
    <Elements stripe={getStripe()} options={{ clientSecret: state.secret, appearance: BRAND_APPEARANCE, locale: 'es' }} key={state.secret}>
      <StripeForm total={state.total!} email={email} disabled={disabled} onPaid={onPaid} />
    </Elements>
  );
}

/* ---------- Tarjeta simulada (sin claves de Stripe) ---------- */
const luhn = (n: string) => {
  let s = 0;
  [...n].reverse().forEach((c, i) => { let d = +c; if (i % 2) { d *= 2; if (d > 9) d -= 9; } s += d; });
  return n.length >= 13 && s % 10 === 0;
};
const brandOf = (n: string) => (/^4/.test(n) ? 'VISA' : /^(5[1-5]|2[2-7])/.test(n) ? 'Mastercard' : /^3[47]/.test(n) ? 'AMEX' : '');

function DemoCard({ disabled, onPaid }: { disabled: boolean; onPaid: (p: Paid) => void }) {
  const [cc, setCc] = useState(''); const [name, setName] = useState(''); const [exp, setExp] = useState(''); const [cvc, setCvc] = useState('');
  const [err, setErr] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const digits = cc.replace(/\D/g, '');
  const submit = () => {
    const [mm, yy] = exp.split('/').map(Number);
    const e: Record<string, string> = {};
    if (!luhn(digits)) e.cc = 'Número de tarjeta no válido';
    if (!name.trim()) e.name = 'Escribe el nombre como aparece en la tarjeta';
    if (!(mm >= 1 && mm <= 12 && new Date(2000 + yy, mm) > new Date())) e.exp = 'Fecha no válida';
    if (!/^\d{3,4}$/.test(cvc)) e.cvc = 'CVC no válido';
    setErr(e);
    if (Object.keys(e).length) return;
    if (digits === '4000000000000002') { setErr({ cc: 'Tarjeta rechazada por el banco (prueba de rechazo).' }); return; }
    setBusy(true);
    // Solo se conservan la marca y los últimos 4 dígitos; nunca el número completo ni el CVC.
    setTimeout(() => onPaid({ type: 'card-demo', label: `${brandOf(digits) || 'Tarjeta'} •••• ${digits.slice(-4)}`, ref: `demo_${Date.now()}` }), 1200);
  };
  return (
    <>
      <div className="fields">
        <div className={`field full ${err.cc ? 'err' : ''}`}>
          <input id="cc" placeholder=" " inputMode="numeric" autoComplete="cc-number" value={cc} onChange={(e) => setCc(e.target.value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim())} />
          <label htmlFor="cc">Número de tarjeta</label><span className="card-brand">{brandOf(digits)}</span>
          {err.cc && <div className="msg">{err.cc}</div>}
        </div>
        <div className={`field full ${err.name ? 'err' : ''}`}>
          <input id="ccname" placeholder=" " autoComplete="cc-name" value={name} onChange={(e) => setName(e.target.value)} /><label htmlFor="ccname">Nombre en la tarjeta</label>
          {err.name && <div className="msg">{err.name}</div>}
        </div>
        <div className={`field ${err.exp ? 'err' : ''}`}>
          <input id="exp" placeholder=" " inputMode="numeric" autoComplete="cc-exp" value={exp} onChange={(e) => { const d = e.target.value.replace(/\D/g, '').slice(0, 4); setExp(d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d); }} />
          <label htmlFor="exp">Vencimiento (MM/AA)</label>{err.exp && <div className="msg">{err.exp}</div>}
        </div>
        <div className={`field ${err.cvc ? 'err' : ''}`}>
          <input id="cvc" placeholder=" " inputMode="numeric" autoComplete="cc-csc" value={cvc} onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))} />
          <label htmlFor="cvc">CVC</label>{err.cvc && <div className="msg">{err.cvc}</div>}
        </div>
      </div>
      <button type="button" className="btn btn--block" style={{ marginTop: 18 }} disabled={busy || disabled} onClick={submit}>
        <Icon.lock /> {busy ? 'Procesando…' : 'Pagar con tarjeta'}
      </button>
    </>
  );
}

/* ---------- PayPal Sandbox ---------- */
export function PayPalPayment({ total, disabled, onPaid }: { total: number; disabled: boolean; onPaid: (p: Paid) => void }) {
  const [error, setError] = useState('');
  return (
    <div>
      <div className="demo-note" style={{ marginTop: 0, marginBottom: 14 }}>
        <Icon.info /><span>PayPal no opera en pesos dominicanos: se cobrará <strong>US$ {toUSD(total)}</strong> (tasa RD$ {USD_RATE} = US$ 1). Entorno Sandbox: usa una cuenta de prueba de PayPal.</span>
      </div>
      <PayPalScriptProvider options={{ clientId: PAYPAL_ID, currency: 'USD', intent: 'capture', locale: 'es_ES' }}>
        <PayPalButtons
          style={{ layout: 'vertical', color: 'black', shape: 'pill', label: 'pay' }}
          disabled={disabled}
          forceReRender={[total, disabled]}
          createOrder={(_, actions) => actions.order.create({
            intent: 'CAPTURE',
            purchase_units: [{ description: 'Royale Parfums Collection', amount: { currency_code: 'USD', value: toUSD(total) } }],
          })}
          onApprove={async (_, actions) => {
            const details = await actions.order?.capture();
            onPaid({ type: 'paypal', label: `PayPal${details?.payer?.email_address ? ` · ${details.payer.email_address}` : ''}`, ref: details?.id });
          }}
          onError={() => setError('PayPal no pudo completar el pago. Intenta de nuevo o usa otro método.')}
        />
      </PayPalScriptProvider>
      {disabled && <p className="muted" style={{ fontSize: 13 }}>Acepta los términos para habilitar el pago.</p>}
      {error && <p className="err-msg">{error}</p>}
    </div>
  );
}
