import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Icon } from '@/components/Icons';
import { PageHead } from '@/components/PageHead';
import { Reveal } from '@/components/Reveal';
import { BRANDS, PRODUCTS, getProduct } from '@/lib/products';

export const metadata: Metadata = { title: 'Nuestra historia', description: 'Royale Parfums Collection: perfumería de lujo dominicana dedicada a fragancias originales de diseñador y nicho.' };

const VALUES = [
  { icon: <Icon.shield />, title: 'Autenticidad sin excepciones', text: 'Compramos solo a distribuidores autorizados. Cada frasco tiene lote verificable y garantía de doble devolución.' },
  { icon: <Icon.drop />, title: 'Curaduría con criterio', text: 'No vendemos todo: elegimos fragancias que funcionan en el clima caribeño y que valen cada atomización.' },
  { icon: <Icon.gift />, title: 'Detalles que se sienten', text: 'Muestra de cortesía, empaque de regalo y una nota escrita a mano en cada pedido.' },
  { icon: <Icon.user />, title: 'Asesoría humana', text: 'Te atiende una persona, no un bot: te ayudamos a encontrar la fragancia que cuenta tu historia.' },
];

export default function NosotrosPage() {
  const imgs = ['chanel-n5-edp', 'baccarat-rouge-540', 'dior-sauvage-edp'].map((id) => getProduct(id)!);
  return (
    <>
      <PageHead crumb="Nuestra historia" title={<>El lujo de <em>dejar huella</em></>} sub="Royale nació en Santo Domingo con una idea sencilla: que comprar un perfume original sea tan especial como usarlo." />

      <section className="wrap about-hero">
        <Reveal media className="about-hero__media">
          {imgs.map((p) => <div key={p.id}><Image src={p.img} alt={`${p.brand} ${p.name}`} width={375} height={500} /></div>)}
        </Reveal>
        <Reveal className="about-hero__copy">
          <span className="eyebrow">Desde 2021</span>
          <h2>Una perfumería con <em>alma dominicana</em></h2>
          <p>Empezamos atendiendo a amigos y familiares que no encontraban sus fragancias favoritas sin pagar de más o sin la duda de si eran originales. Hoy enviamos a las 32 provincias del país y asesoramos a miles de clientes cada año.</p>
          <p>Nuestro nombre, Royale, y la flor de nuestro monograma representan esa mezcla de elegancia clásica y calidez caribeña que queremos en cada entrega.</p>
          <div className="about-stats">
            <div><strong>{PRODUCTS.length}+</strong><span>Fragancias</span></div>
            <div><strong>{BRANDS.length}</strong><span>Casas de perfumería</span></div>
            <div><strong>2,500+</strong><span>Pedidos entregados</span></div>
          </div>
        </Reveal>
      </section>

      <section className="section wrap">
        <Reveal className="section-head">
          <div><span className="eyebrow">Lo que nos mueve</span><h2>Nuestros <em>valores</em></h2></div>
        </Reveal>
        <div className="values">
          {VALUES.map((v, i) => (
            <Reveal key={v.title} delay={i * 0.1} className="value">
              <span className="perk__icon">{v.icon}</span><h3>{v.title}</h3><p>{v.text}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="wrap" style={{ paddingBottom: 110 }}>
        <Reveal className="about-cta">
          <Image src="/img/brand/monogram-white.png" alt="" width={120} height={148} unoptimized />
          <div>
            <h2>Encuentra la fragancia que cuenta <em>tu historia</em></h2>
            <p>Explora la colección o haz nuestro test olfativo de 3 preguntas.</p>
          </div>
          <div className="about-cta__actions">
            <Link href="/tienda" className="btn btn--light">Ver la colección <Icon.arrow /></Link>
            <Link href="/#quiz" className="btn btn--outline-light">Hacer el test</Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
