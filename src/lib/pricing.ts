// Cálculo de totales compartido entre el cliente y las rutas de API.
// El servidor recalcula el monto a partir del catálogo: nunca confía en el precio enviado por el navegador.
import { getProduct } from './products';

export type CartLine = { id: string; ml: number; qty: number };
export type ShipMethod = 'standard' | 'express' | 'pickup';

export const FREE_SHIP = 5000;
export const USD_RATE = 63; // RD$ por US$ (PayPal no admite pesos dominicanos)
export const ITBIS_RATE = 0.18; // Los precios del catálogo incluyen ITBIS
export const PROMOS: Record<string, number> = { ROYALE10: 0.1, UASD15: 0.15 };

export const SHIP_METHODS: Record<ShipMethod, { name: string; desc: string; price: (sub: number) => number }> = {
  standard: { name: 'Envío estándar', desc: 'Entrega en 24–48 h a todo el país', price: (sub) => (sub >= FREE_SHIP ? 0 : 250) },
  express: { name: 'Express mismo día', desc: 'Gran Santo Domingo · pedidos antes de las 2:00 p. m.', price: () => 450 },
  pickup: { name: 'Retiro en tienda', desc: 'Av. Winston Churchill #93, Piantini · listo en 2 h', price: () => 0 },
};

export function resolveLines(lines: CartLine[]) {
  return lines.flatMap((l) => {
    const p = getProduct(l.id);
    const size = p?.sizes.find((s) => s.ml === l.ml);
    if (!p || !size) return [];
    const qty = Math.max(1, Math.min(10, Math.floor(l.qty)));
    return [{ ...l, qty, p, size, total: size.price * qty }];
  });
}

export function computeTotals(lines: CartLine[], promo: string | null, method: ShipMethod = 'standard') {
  const resolved = resolveLines(lines);
  const subtotal = resolved.reduce((a, l) => a + l.total, 0);
  const rate = promo ? PROMOS[promo] ?? 0 : 0;
  const discount = Math.round(subtotal * rate);
  const shipping = resolved.length ? SHIP_METHODS[method].price(subtotal) : 0;
  const total = subtotal - discount + shipping;
  // ITBIS contenido en el total (precio con impuesto ÷ 1.18).
  const itbis = Math.round(total - total / (1 + ITBIS_RATE));
  return { lines: resolved, subtotal, discount, shipping, total, itbis, net: total - itbis };
}

export const fmt = (n: number) => 'RD$ ' + Math.round(n).toLocaleString('es-DO');
export const toUSD = (n: number) => (n / USD_RATE).toFixed(2);

export const itbisOf = (amount: number) => Math.round(amount - amount / (1 + ITBIS_RATE));
