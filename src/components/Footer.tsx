'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useUI } from '@/store/shop';
import { Brand, Icon, PayBadges } from './Icons';
import { Reveal } from './Reveal';

function Newsletter() {
  const notify = useUI((s) => s.notify);
  const [email, setEmail] = useState('');
  return (
    <form className="newsletter" onSubmit={(e) => {
      e.preventDefault(); setEmail('');
      notify(<><Icon.check /><span>¡Bienvenido al Club Royale! Usa <strong>ROYALE10</strong> en tu primera compra.</span></>);
    }}>
      <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Tu correo electrónico" aria-label="Correo electrónico" />
      <button className="btn btn--gold" type="submit">Suscribirme</button>
    </form>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <Reveal className="footer__cta wrap">
        <div>
          <p className="eyebrow eyebrow--light">Club Royale</p>
          <h2>Recibe lanzamientos, ediciones limitadas y un 10% en tu primera compra.</h2>
        </div>
        <Newsletter />
      </Reveal>
      <div className="footer__grid wrap">
        <div className="footer__brand">
          <Image src="/img/brand/logo-stacked-white.png" alt="Royale Parfums Collection" width={1156} height={988} />
          <p>Perfumería de lujo en República Dominicana. Fragancias originales de diseñador y nicho, seleccionadas con criterio.</p>
        </div>
        <div>
          <h4>Tienda</h4>
          <Link href="/tienda?g=hombre">Hombre</Link>
          <Link href="/tienda?g=mujer">Mujer</Link>
          <Link href="/tienda?g=unisex">Nicho & Unisex</Link>
          <Link href="/tienda?sort=new">Novedades</Link>
          <Link href="/favoritos">Favoritos</Link>
        </div>
        <div>
          <h4>Ayuda</h4>
          <Link href="/ayuda">Preguntas frecuentes</Link>
          <Link href="/cuenta/pedidos">Seguimiento de pedido</Link>
          <Link href="/legal/devoluciones">Cambios y devoluciones</Link>
          <Link href="/legal/terminos">Términos y condiciones</Link>
          <Link href="/legal/privacidad">Política de privacidad</Link>
        </div>
        <div>
          <h4>Royale</h4>
          <Link href="/nosotros">Nuestra historia</Link>
          <Link href="/contacto">Contacto</Link>
          <p style={{ marginTop: 10 }}>Av. Winston Churchill #93<br />Piantini, Santo Domingo</p>
          <div className="socials">
            <a href="#" aria-label="Instagram"><Brand name="instagram" /></a>
            <a href="#" aria-label="TikTok"><Brand name="tiktok" /></a>
            <a href="#" aria-label="Facebook"><Brand name="facebook" /></a>
            <a href="https://wa.me/18095550140" aria-label="WhatsApp"><Brand name="whatsapp" /></a>
          </div>
        </div>
      </div>
      <div className="footer__bottom wrap">
        <span>© 2026 Royale Parfums Collection · Proyecto académico UASD — Comercio Electrónico</span>
        <PayBadges />
      </div>
    </footer>
  );
}

const PERKS = [
  { icon: <Icon.truck />, text: <>Envío gratis desde <strong>RD$ 5,000</strong></> },
  { icon: <Icon.shield />, text: <>100% originales, con factura</> },
  { icon: <Icon.gift />, text: <>Muestra de cortesía en cada pedido</> },
];

// Cinta superior: beneficios fijos en escritorio; en móvil rota un mensaje a la vez.
export function AnnounceBar() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % PERKS.length), 3800);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="announce2" role="region" aria-label="Beneficios">
      <div className="announce2__inner">
        <ul className="announce2__list">
          {PERKS.map((p, k) => <li key={k}>{p.icon}<span>{p.text}</span></li>)}
        </ul>
        <div className="announce2__one" aria-live="polite">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
              {PERKS[i].icon}<span>{PERKS[i].text}</span>
            </motion.span>
          </AnimatePresence>
        </div>
        <div className="announce2__links">
          <a href="https://wa.me/18095550140"><Icon.phone /> +1 (809) 555-0140</a>
          <Link href="/ayuda">Ayuda</Link>
          <Link href="/cuenta/pedidos">Seguir mi pedido</Link>
        </div>
      </div>
    </div>
  );
}
