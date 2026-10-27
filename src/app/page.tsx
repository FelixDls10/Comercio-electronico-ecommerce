import Image from 'next/image';
import Link from 'next/link';
import { Hero } from '@/components/home/Hero';
import { BestSellers, CategoryCards, FamilyExplorer, ScentQuiz } from '@/components/home/Sections';
import { Icon, StarRow } from '@/components/Icons';
import { Reveal } from '@/components/Reveal';
import { BRANDS, TESTIMONIALS, getProduct } from '@/lib/products';

export default function Home() {
  const br = getProduct('baccarat-rouge-540')!;
  const av = getProduct('creed-aventus')!;
  return (
    <>
      <Hero />

      <div className="brands" aria-label="Marcas">
        <div className="brands__track">
          {[...BRANDS, ...BRANDS].map((b, i) => <span key={i} className="brands__item"><span>{b}</span><i /></span>)}
        </div>
      </div>

      <section className="section wrap">
        <Reveal className="section-head">
          <h2>Colecciones</h2>
          <Link href="/tienda" className="link-arrow">Ver toda la tienda <Icon.arrow /></Link>
        </Reveal>
        <CategoryCards />
      </section>

      <BestSellers />
      <FamilyExplorer />

      <section className="section--tight wrap">
        <div className="editorial">
          <Reveal media className="editorial__media">
            <div><Image src={br.img} alt="Maison Francis Kurkdjian Baccarat Rouge 540" width={375} height={500} /></div>
            <div><Image src={av.img} alt="Creed Aventus" width={375} height={500} /></div>
          </Reveal>
          <Reveal className="editorial__copy">
            <span className="eyebrow">Garantía Royale</span>
            <h2>Originales, sellados y con factura</h2>
            <p>Trabajamos únicamente con distribuidores autorizados. Cada frasco llega sellado de fábrica, con su número de lote verificable y factura con comprobante fiscal.</p>
            <p>¿No estás seguro? Pide una muestra de cortesía con tu pedido y descubre cómo evoluciona la fragancia en tu piel antes de abrir el frasco.</p>
            <Link href="/tienda?f=ambar" className="btn">Descubrir el nicho <Icon.arrow /></Link>
          </Reveal>
        </div>
      </section>

      <ScentQuiz />

      <Reveal as="section" className="wrap">
        <div className="perks">
          <div className="perk"><span className="perk__icon"><Icon.truck /></span><div><h4>Envío en 24–48 h</h4><p>Gratis desde RD$ 5,000 a todo el país.</p></div></div>
          <div className="perk"><span className="perk__icon"><Icon.shield /></span><div><h4>100% originales</h4><p>Distribuidores autorizados y lote verificable.</p></div></div>
          <div className="perk"><span className="perk__icon"><Icon.gift /></span><div><h4>Muestra de cortesía</h4><p>Y empaque de regalo sin costo.</p></div></div>
          <div className="perk"><span className="perk__icon"><Icon.lock /></span><div><h4>Pago seguro</h4><p>Stripe, PayPal, transferencia o contra entrega.</p></div></div>
        </div>
      </Reveal>

      <section className="section wrap">
        <Reveal className="section-head">
          <h2>Opiniones de clientes</h2>
          <span className="rating-pill"><Icon.star /> 4.8 de 5 · más de 2,500 pedidos</span>
        </Reveal>
        <Reveal className="testis">
          {TESTIMONIALS.map((r) => (
            <figure className="testi" key={r.name}>
              <StarRow n={r.rating} />
              <blockquote>“{r.text}”</blockquote>
              <figcaption><span className="avatar">{r.name[0]}</span><div><strong style={{ fontWeight: 500 }}>{r.name}</strong><span>{r.city}</span></div></figcaption>
            </figure>
          ))}
        </Reveal>
      </section>
    </>
  );
}
