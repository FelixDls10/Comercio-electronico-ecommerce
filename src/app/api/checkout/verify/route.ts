import { getStripe } from '@/lib/stripe-server';

// Confirma en el servidor que el PaymentIntent quedó pagado antes de registrar el pedido.
export async function GET(req: Request) {
  const stripe = getStripe();
  if (!stripe) return Response.json({ configured: false }, { status: 503 });
  const id = new URL(req.url).searchParams.get('id');
  if (!id?.startsWith('pi_')) return Response.json({ error: 'ID inválido' }, { status: 400 });
  try {
    const pi = await stripe.paymentIntents.retrieve(id);
    return Response.json({ status: pi.status, amount: pi.amount / 100, currency: pi.currency });
  } catch {
    return Response.json({ error: 'No encontrado' }, { status: 404 });
  }
}
