import { z } from 'zod';
import { computeTotals } from '@/lib/pricing';
import { getStripe } from '@/lib/stripe-server';

const Body = z.object({
  items: z.array(z.object({ id: z.string(), ml: z.number(), qty: z.number().int().min(1).max(10) })).min(1).max(30),
  promo: z.string().nullable(),
  method: z.enum(['standard', 'express', 'pickup']),
  email: z.email().optional(),
});

// Crea un PaymentIntent de Stripe. El monto se recalcula aquí con el catálogo del servidor.
export async function POST(req: Request) {
  const stripe = getStripe();
  if (!stripe) return Response.json({ configured: false }, { status: 503 });

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: 'Solicitud inválida' }, { status: 400 });

  const { items, promo, method, email } = parsed.data;
  const t = computeTotals(items, promo, method);
  if (!t.lines.length || t.total <= 0) return Response.json({ error: 'La bolsa está vacía' }, { status: 400 });

  try {
    const pi = await stripe.paymentIntents.create({
      amount: Math.round(t.total * 100), // DOP usa 2 decimales
      currency: 'dop',
      automatic_payment_methods: { enabled: true, allow_redirects: 'never' },
      receipt_email: email,
      description: `Royale Parfums · ${t.lines.map((l) => `${l.qty}× ${l.p.name} ${l.ml}ml`).join(', ')}`.slice(0, 990),
      metadata: { items: JSON.stringify(items).slice(0, 490), promo: promo ?? '', method },
    });
    return Response.json({ clientSecret: pi.client_secret, id: pi.id, total: t.total });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error de Stripe';
    return Response.json({ error: msg }, { status: 502 });
  }
}
