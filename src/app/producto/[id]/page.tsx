import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { GENDER_LABEL, PRODUCTS, getProduct } from '@/lib/products';
import { fmt } from '@/lib/pricing';
import { Icon } from '@/components/Icons';
import { Reveal } from '@/components/Reveal';
import { ProductCarousel } from '@/components/product/ProductCarousel';
import { Accords, BuyBox, Gallery, Meters } from '@/components/product/ProductClient';
import { Reviews } from '@/components/product/Reviews';
import Image from 'next/image';

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const p = getProduct(id);
  if (!p) return { title: 'Fragancia no encontrada' };
  return {
    title: `${p.name} ${p.concentration} · ${p.brand}`,
    description: `${p.brand} ${p.name} (${p.year}). ${p.family}. Notas: ${[...p.notes.top, ...p.notes.heart, ...p.notes.base].slice(0, 6).join(', ')}. Desde ${fmt(p.price)}.`,
    openGraph: { images: [p.img] },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = getProduct(id);
  if (!p) notFound();

  const sameBrand = PRODUCTS.filter((x) => x.brand === p.brand && x.id !== p.id);
  const related = PRODUCTS.filter((x) => x.id !== p.id && (x.familyKey === p.familyKey || x.gender === p.gender))
    .sort((a, b) => Number(b.familyKey === p.familyKey) - Number(a.familyKey === p.familyKey) || b.rating - a.rating)
    .slice(0, 8);

  // Datos estructurados para que Google muestre precio, stock y estrellas.
  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'Product', name: `${p.brand} ${p.name}`, image: p.img,
    description: p.description, brand: { '@type': 'Brand', name: p.brand }, sku: p.id,
    aggregateRating: { '@type': 'AggregateRating', ratingValue: p.rating, reviewCount: p.reviews },
    offers: { '@type': 'AggregateOffer', priceCurrency: 'DOP', lowPrice: p.sizes[0].price, highPrice: p.sizes.at(-1)!.price, availability: 'https://schema.org/InStock' },
  };

  const intel = [
    [<Icon.tag key="i" />, 'Marca', p.brand], [<Icon.drop key="i" />, 'Concentración', p.concentration],
    [<Icon.user key="i" />, 'Género', GENDER_LABEL[p.gender]], [<Icon.layers key="i" />, 'Familia', p.family],
    [<Icon.globe key="i" />, 'País', p.country], [<Icon.cal key="i" />, 'Lanzamiento', p.year],
    [<Icon.sun key="i" />, 'Temporada', p.season.join(', ')], [<Icon.moon key="i" />, 'Momento', p.time],
  ] as const;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="wrap" style={{ paddingTop: 28 }}>
        <Reveal hero as="div">
          <nav className="crumbs" aria-label="Ruta"><Link href="/">Inicio</Link><span>/</span><Link href={`/tienda?g=${p.gender}`}>{GENDER_LABEL[p.gender]}</Link><span>/</span><span>{p.name}</span></nav>
        </Reveal>
      </div>

      <section className="wrap pdp">
        <Gallery p={p} />
        <BuyBox p={p} />
      </section>

      <section className="wrap pdp-grid">
        <Reveal className="panel c-4">
          <h3>Ficha olfativa</h3>
          <dl className="intel" style={{ margin: 0 }}>
            {intel.map(([icon, k, v]) => <div key={k}><dt>{icon}{k}</dt><dd>{v}</dd></div>)}
          </dl>
        </Reveal>
        <Reveal className="panel c-4" delay={0.1}>
          <h3>Composición</h3>
          <p className="muted" style={{ fontSize: 13, marginBottom: 18 }}>Así evoluciona la fragancia en tu piel, de la primera impresión al fondo que perdura.</p>
          <ol className="notes-flow">
            {([['Salida', 'Primeros 15 minutos', p.notes.top], ['Corazón', 'De 30 min a 3 horas', p.notes.heart], ['Fondo', 'Lo que queda en la piel', p.notes.base]] as const).map(([label, when, list]) => (
              <li key={label}>
                <div className="notes-flow__head"><strong>{label}</strong><span>{when}</span></div>
                <div className="notes-flow__chips">{list.map((n) => <span key={n}>{n}</span>)}</div>
              </li>
            ))}
          </ol>
        </Reveal>
        <Reveal className="panel c-4" delay={0.2}>
          <h3>Acordes principales</h3>
          <Accords accords={p.accords} />
        </Reveal>
        <Reveal className="panel c-5">
          <h3>Rendimiento</h3>
          <Meters longevity={p.longevity} sillage={p.sillage} />
          <p className="label" style={{ marginTop: 30 }}>Perfumista{p.perfumers.length > 1 ? 's' : ''}</p>
          <div className="perfumers">{p.perfumers.length ? p.perfumers.map((x) => <span key={x}>{x}</span>) : <span>Creación de la casa {p.brand}</span>}</div>
        </Reveal>
        <Reveal className="panel c-7" id="reviews">
          <Reviews p={p} />
        </Reveal>
        {sameBrand.length ? (
          <Reveal className="panel c-12">
            <div className="section-head" style={{ marginBottom: 20 }}>
              <h3 style={{ margin: 0 }}>Más de {p.brand}</h3>
              <Link className="link-arrow" href={`/tienda?b=${encodeURIComponent(p.brand)}`}>Ver todo <Icon.arrow /></Link>
            </div>
            <div className="mini-list" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))' }}>
              {sameBrand.map((x) => (
                <Link key={x.id} className="mini" href={`/producto/${x.id}`}><Image src={x.img} alt="" width={48} height={60} /><div><strong>{x.name}</strong><span>{x.concentration} · {fmt(x.price)}</span></div></Link>
              ))}
            </div>
          </Reveal>
        ) : null}
      </section>

      <ProductCarousel products={related} />
    </>
  );
}
