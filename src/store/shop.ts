'use client';
// Estado persistente de la tienda: bolsa, favoritos, pedidos, reseñas y cuentas.
// Para el proyecto académico se guarda en localStorage; en producción esto viviría en una base de datos.
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { CartLine, ShipMethod } from '@/lib/pricing';
import { PROMOS } from '@/lib/pricing';

export type Address = { first: string; last: string; email: string; phone: string; address: string; city: string; prov: string; notes?: string };

export type OrderItem = { id: string; name: string; brand: string; img: string; ml: number; qty: number; price: number };
export type Order = {
  no: string; date: string; email: string; name: string;
  items: OrderItem[]; subtotal: number; discount: number; shipping: number; total: number; itbis?: number; promo: string | null;
  address: Address; method: ShipMethod; gift: boolean;
  payment: { type: 'stripe' | 'card-demo' | 'paypal' | 'transfer' | 'cod'; label: string; ref?: string };
};

export type UserReview = { productId: string; name: string; rating: number; title: string; text: string; date: string };
export type User = { name: string; email: string; phone: string; passHash: string; created: string; address?: Address; newsletter: boolean };

type ShopState = {
  cart: CartLine[]; promo: string | null; wish: string[];
  orders: Order[]; reviews: UserReview[];
  users: User[]; session: string | null;
  add: (id: string, ml: number, qty?: number) => void;
  setQty: (id: string, ml: number, qty: number) => void;
  remove: (id: string, ml: number) => void;
  clearCart: () => void;
  applyPromo: (code: string) => boolean;
  clearPromo: () => void;
  toggleWish: (id: string) => boolean;
  addOrder: (o: Order) => void;
  addReview: (r: UserReview) => void;
  register: (u: User) => boolean;
  login: (email: string, passHash: string) => boolean;
  logout: () => void;
  updateUser: (patch: Partial<User>) => void;
};

export const useShop = create<ShopState>()(
  persist(
    (set, get) => ({
      cart: [], promo: null, wish: [], orders: [], reviews: [], users: [], session: null,
      add: (id, ml, qty = 1) => set((s) => {
        const line = s.cart.find((l) => l.id === id && l.ml === ml);
        if (line) return { cart: s.cart.map((l) => (l === line ? { ...l, qty: Math.min(10, l.qty + qty) } : l)) };
        return { cart: [...s.cart, { id, ml, qty: Math.min(10, qty) }] };
      }),
      setQty: (id, ml, qty) => set((s) => ({
        cart: qty <= 0 ? s.cart.filter((l) => !(l.id === id && l.ml === ml)) : s.cart.map((l) => (l.id === id && l.ml === ml ? { ...l, qty: Math.min(10, qty) } : l)),
      })),
      remove: (id, ml) => set((s) => ({ cart: s.cart.filter((l) => !(l.id === id && l.ml === ml)) })),
      clearCart: () => set({ cart: [], promo: null }),
      applyPromo: (code) => {
        const c = code.trim().toUpperCase();
        if (!PROMOS[c]) return false;
        set({ promo: c }); return true;
      },
      clearPromo: () => set({ promo: null }),
      toggleWish: (id) => {
        const on = get().wish.includes(id);
        set((s) => ({ wish: on ? s.wish.filter((x) => x !== id) : [...s.wish, id] }));
        return !on;
      },
      addOrder: (o) => set((s) => ({ orders: [o, ...s.orders] })),
      addReview: (r) => set((s) => ({ reviews: [r, ...s.reviews] })),
      register: (u) => {
        if (get().users.some((x) => x.email === u.email)) return false;
        set((s) => ({ users: [...s.users, u], session: u.email })); return true;
      },
      login: (email, passHash) => {
        const ok = get().users.some((u) => u.email === email && u.passHash === passHash);
        if (ok) set({ session: email });
        return ok;
      },
      logout: () => set({ session: null }),
      updateUser: (patch) => set((s) => ({ users: s.users.map((u) => (u.email === s.session ? { ...u, ...patch } : u)) })),
    }),
    { name: 'royale-shop', storage: createJSONStorage(() => localStorage), version: 1 },
  ),
);

export const useUser = () => useShop((s) => s.users.find((u) => u.email === s.session) ?? null);

// Hash SHA-256 de la contraseña (demo: la autenticación real debe hacerse en el servidor).
export async function hashPassword(email: string, password: string) {
  const data = new TextEncoder().encode(`${email.toLowerCase()}::${password}`);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Estado efímero de la interfaz (no se persiste).
type UIState = {
  cartOpen: boolean; menuOpen: boolean; searchOpen: boolean;
  toast: { id: number; node: React.ReactNode } | null;
  set: (p: Partial<Omit<UIState, 'set' | 'notify'>>) => void;
  notify: (node: React.ReactNode) => void;
};
export const useUI = create<UIState>()((set) => ({
  cartOpen: false, menuOpen: false, searchOpen: false, toast: null,
  set: (p) => set(p),
  notify: (node) => set({ toast: { id: Date.now(), node } }),
}));
