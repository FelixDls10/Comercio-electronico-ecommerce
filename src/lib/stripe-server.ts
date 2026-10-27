import 'server-only';
import Stripe from 'stripe';

// Cliente de Stripe creado bajo demanda: la app compila aunque no haya claves configuradas.
let client: Stripe | null = null;
export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  client ??= new Stripe(key);
  return client;
}
