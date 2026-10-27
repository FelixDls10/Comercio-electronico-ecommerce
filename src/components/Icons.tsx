// Iconos de interfaz (Lucide) y logotipos de marca con su color oficial (Simple Icons).
import {
  ArrowLeft, ArrowRight, ArrowUpRight, Calendar, Check, ChevronDown, Droplet, Gift, Globe, Heart, Info, Layers, Lock, LogOut,
  Mail, MapPin, Menu, Minus, Moon, Package, Phone, Plus, Search, ShieldCheck, ShoppingBag, SlidersHorizontal, Star, Sun, Tag,
  Truck, Undo2, User, X, type LucideProps,
} from 'lucide-react';
import { siAmericanexpress, siFacebook, siInstagram, siPaypal, siStripe, siTiktok, siVisa, siWhatsapp, type SimpleIcon } from 'simple-icons';

const L = (C: React.ComponentType<LucideProps>, extra?: Partial<LucideProps>) =>
  function LucideIcon(p: LucideProps) { return <C size={20} strokeWidth={1.6} aria-hidden="true" {...extra} {...p} />; };

export const Icon = {
  arrow: L(ArrowRight, { className: 'arrow' }), arrowL: L(ArrowLeft), arrowUR: L(ArrowUpRight),
  heart: L(Heart), bag: L(ShoppingBag), plus: L(Plus), minus: L(Minus), star: L(Star), check: L(Check),
  chevron: L(ChevronDown), x: L(X), menu: L(Menu), search: L(Search), filter: L(SlidersHorizontal),
  truck: L(Truck), shield: L(ShieldCheck), gift: L(Gift), lock: L(Lock), return: L(Undo2), info: L(Info),
  tag: L(Tag), drop: L(Droplet), user: L(User), globe: L(Globe), sun: L(Sun), moon: L(Moon), cal: L(Calendar),
  layers: L(Layers), box: L(Package), logout: L(LogOut), pin: L(MapPin), phone: L(Phone), mail: L(Mail),
  instagram: (p: Omit<React.SVGProps<SVGSVGElement>, 'name'>) => <Brand name="instagram" {...p} />,
  tiktok: (p: Omit<React.SVGProps<SVGSVGElement>, 'name'>) => <Brand name="tiktok" {...p} />,
  whatsapp: (p: Omit<React.SVGProps<SVGSVGElement>, 'name'>) => <Brand name="whatsapp" {...p} />,
};

const ICONS: Record<string, SimpleIcon> = {
  instagram: siInstagram, tiktok: siTiktok, whatsapp: siWhatsapp, facebook: siFacebook,
  visa: siVisa, amex: siAmericanexpress, paypal: siPaypal, stripe: siStripe,
};

type BrandName = 'instagram' | 'tiktok' | 'whatsapp' | 'facebook' | 'visa' | 'amex' | 'paypal' | 'stripe' | 'mastercard';

/** Logotipo de marca con sus colores originales. */
export function Brand({ name, ...p }: { name: BrandName } & Omit<React.SVGProps<SVGSVGElement>, 'name'>) {
  if (name === 'mastercard') {
    return (
      <svg viewBox="0 0 48 30" aria-label="Mastercard" role="img" style={{ fill: 'none', stroke: 'none' }} {...p}>
        <circle cx="17" cy="15" r="12" fill="#EB001B" />
        <circle cx="31" cy="15" r="12" fill="#F79E1B" />
        <path d="M24 5.3a12 12 0 0 1 0 19.4 12 12 0 0 1 0-19.4Z" fill="#FF5F00" />
      </svg>
    );
  }
  const icon = ICONS[name];
  const fill = name === 'instagram' ? 'url(#ig-grad)' : `#${icon.hex}`;
  return (
    <svg viewBox="0 0 24 24" aria-label={icon.title} role="img" style={{ stroke: 'none' }} {...p}>
      {name === 'instagram' && (
        <defs>
          <radialGradient id="ig-grad" cx="30%" cy="107%" r="150%">
            <stop offset="0" stopColor="#FDF497" /><stop offset=".05" stopColor="#FDF497" />
            <stop offset=".45" stopColor="#FD5949" /><stop offset=".6" stopColor="#D6249F" /><stop offset=".9" stopColor="#285AEB" />
          </radialGradient>
        </defs>
      )}
      <path d={icon.path} fill={fill} />
    </svg>
  );
}

/** Fila de métodos de pago aceptados, cada uno en su insignia blanca. */
export function PayBadges({ className = 'pay-badges' }: { className?: string }) {
  const list: BrandName[] = ['visa', 'mastercard', 'amex', 'paypal', 'stripe'];
  return (
    <div className={className} aria-label="Métodos de pago aceptados">
      {list.map((b) => <span key={b} className={`pay-badge pay-badge--${b}`}><Brand name={b} /></span>)}
    </div>
  );
}

export function Stars({ value }: { value: number }) {
  return (
    <span className="stars">
      <Star size={14} strokeWidth={0} fill="currentColor" aria-hidden="true" />
      <span>{value.toFixed(1)}</span>
    </span>
  );
}

export function StarRow({ n, size = 14 }: { n: number; size?: number }) {
  return (
    <span className="stars" style={{ gap: 2 }} aria-label={`${n} de 5 estrellas`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} size={size} strokeWidth={0} fill="currentColor" style={{ opacity: i < n ? 1 : 0.22 }} aria-hidden="true" />
      ))}
    </span>
  );
}
