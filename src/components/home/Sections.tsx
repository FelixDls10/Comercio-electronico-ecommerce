'use client';
import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion } from 'motion/react';
import { useRef, useState } from 'react';
import { FAMILIES, PRODUCTS, getProduct, defaultSize, type FamilyKey, type Product } from '@/lib/products';
import { fmt } from '@/lib/pricing';
import { Icon } from '../Icons';
import { ProductCard } from '../ProductCard';
import { EASE, Reveal } from '../Reveal';
import { useCartActions } from '../useCartActions';

const byPopularity = (a: Product, b: Product) => b.rating * b.reviews - a.rating * a.reviews;

export function BestSellers() {
  const [tab, setTab] = useState<'all' | 'hombre' | 'mujer' | 'unisex'>('all');
  let list = [...PRODUCTS].sort(byPopularity);
  if (tab !== 'all') list = list.filter((p) => p.gender === tab || (tab === 'unisex' && p.tags.includes('nicho')));
  const tabs = [['all', 'Todos'], ['hombre', 'Hombre'], ['mujer', 'Mujer'], ['unisex', 'Nicho']] as const;
  return (
    <section className="section--tight wrap" style={{ paddingTop: 0 }}>
      <Reveal className="section-head">
        <h2>Más vendidos</h2>
        <div className="tabs" role="tablist">
          {tabs.map(([k, l]) => (
            <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? 'active' : ''} onClick={() => setTab(k)}>{l}</button>
          ))}
        </div>
      </Reveal>
      <Reveal className="grid">
        <AnimatePresence mode="popLayout" initial={false}>
          {list.slice(0, 8).map((p) => (
            <motion.div key={`${tab}-${p.id}`} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.6, ease: EASE }} style={{ display: 'flex' }}>
              <ProductCard p={p} />
            </motion.div>
          ))}
        </AnimatePresence>
      </Reveal>
      <Reveal style={{ textAlign: 'center', marginTop: 40 }}>
        <Link href="/tienda" className="btn btn--ghost">Ver toda la colección <Icon.arrow /></Link>
      </Reveal>
    </section>
  );
}

// Familias olfativas como cuadrícula de catálogo: cada tarjeta enseña sus frascos reales.
const FAMILY_TINT: Record<FamilyKey, string> = {
  amaderada: '#EEF6F8', floral: '#FDF1EE', ambar: '#FDF1EE', gourmand: '#FBF3F0', aromatica: '#EEF6F8', fresca: '#E8F3F5',
};

export function FamilyExplorer() {
  return (
    <section className="section wrap">
      <Reveal className="section-head">
        <h2>Compra por familia olfativa</h2>
        <Link href="/tienda" className="link-arrow">Ver todo <Icon.arrow /></Link>
      </Reveal>
      <Reveal className="fam-grid">
        {FAMILIES.map((f) => {
          const list = PRODUCTS.filter((p) => p.familyKey === f.key);
          return (
            <Link key={f.key} href={`/tienda?f=${f.key}`} className="fam-tile" style={{ background: FAMILY_TINT[f.key] }}>
              <div className="fam-tile__top">
                <h3>{f.name}</h3>
                <span className="fam-tile__count">{list.length} fragancias</span>
              </div>
              <p className="fam-tile__notes">{f.notes}</p>
              <div className="fam-tile__bottles">
                {list.slice(0, 3).map((p) => (
                  <span key={p.id} className="fam-tile__b"><Image src={p.img} alt={p.name} width={150} height={200} /></span>
                ))}
              </div>
              <span className="fam-tile__go" aria-hidden="true"><Icon.arrowUR /></span>
            </Link>
          );
        })}
      </Reveal>
    </section>
  );
}

type Answers = { g?: string; t?: string; f?: string };
const QUESTIONS = [
  { k: 'g', title: '¿Para quién es la fragancia?', opts: [['hombre', 'Para él', 'Masculina y con carácter'], ['mujer', 'Para ella', 'Femenina y envolvente'], ['unisex', 'Sin etiquetas', 'Perfumería de autor'], ['regalo', 'Es un regalo', 'Sorpréndeme con lo mejor']] },
  { k: 't', title: '¿Cuándo la usarás más?', opts: [['Día', 'De día', 'Oficina, universidad, el día a día'], ['Noche', 'De noche', 'Cenas, salidas y eventos'], ['ambos', 'Siempre', 'Una firma para todo momento'], ['calor', 'Con calor', 'Ligera para el clima caribeño']] },
  { k: 'f', title: '¿Qué notas te atraen?', opts: [['fresca', 'Frescas', 'Cítricos, mar, bergamota'], ['floral', 'Florales', 'Rosa, jazmín, iris'], ['gourmand', 'Dulces', 'Vainilla, café, praliné'], ['amaderada', 'Intensas', 'Maderas, ámbar, especias']] },
] as const;

function recommend(a: Answers) {
  const famMap: Record<string, FamilyKey[]> = { fresca: ['fresca', 'aromatica'], floral: ['floral'], gourmand: ['gourmand', 'ambar'], amaderada: ['amaderada', 'ambar'] };
  return PRODUCTS.filter((p) => a.g === 'regalo' || p.gender === a.g || p.gender === 'unisex' || (a.g === 'unisex' && p.tags.includes('nicho')))
    .map((p) => {
      let s = p.rating;
      const fam = famMap[a.f!];
      if (fam.includes(p.familyKey)) s += fam[0] === p.familyKey ? 4 : 3;
      if (a.t === 'calor') s += p.season.includes('Verano') ? 3 : 0;
      else if (a.t === 'ambos') s += p.time === 'Día y noche' ? 2 : 0;
      else s += p.time === a.t ? 2 : p.time === 'Día y noche' ? 1.5 : 0;
      if (a.g === 'regalo') s += p.reviews / 100;
      if (a.g === 'unisex' && p.gender === 'unisex') s += 2;
      return { p, s };
    })
    .sort((x, y) => y.s - x.s)
    .map((x) => x.p);
}

export function ScentQuiz() {
  const [step, setStep] = useState(0);
  const [ans, setAns] = useState<Answers>({});
  const { addToCart } = useCartActions();
  const done = step >= QUESTIONS.length;
  const [top, ...rest] = done ? recommend(ans) : [];

  return (
    <section className="section wrap" id="quiz">
      <div className="quiz">
        <Reveal className="quiz__intro">
          <div>
            <span className="eyebrow">Test olfativo</span>
            <h2>Encuentra tu fragancia en 3 pasos</h2>
            <p>Responde tres preguntas y nuestro asesor te recomendará el perfume ideal según tu estilo, el momento del día y las notas que te enamoran.</p>
          </div>
          <div className="quiz__steps">{QUESTIONS.map((_, i) => <i key={i} className={i < step ? 'done' : ''} />)}</div>
          <Image className="mono" src="/img/brand/monogram-teal.png" alt="" width={260} height={320} />
        </Reveal>
        <Reveal className="quiz__box" delay={0.1}>
          <AnimatePresence mode="wait">
            <motion.div key={step} className="quiz__q" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.5, ease: EASE }}>
              {!done ? (
                <>
                  <span className="eyebrow">Pregunta {step + 1} de {QUESTIONS.length}</span>
                  <h3>{QUESTIONS[step].title}</h3>
                  <div className="quiz__opts">
                    {QUESTIONS[step].opts.map(([v, t, d]) => (
                      <button key={v} className="opt" onClick={() => { setAns({ ...ans, [QUESTIONS[step].k]: v }); setStep(step + 1); }}>
                        <strong>{t}</strong><span>{d}</span>
                      </button>
                    ))}
                  </div>
                  {step > 0 && <button className="back-link" style={{ marginTop: 'auto', paddingTop: 24 }} onClick={() => setStep(step - 1)}><Icon.arrowL /> Anterior</button>}
                </>
              ) : (
                <>
                  <span className="eyebrow">Tu fragancia ideal</span>
                  <div className="quiz__result">
                    <Link href={`/producto/${top.id}`} className="img"><Image src={top.img} alt={top.name} width={375} height={500} /></Link>
                    <div>
                      <span className="card__brand">{top.brand}</span>
                      <h4>{top.name}</h4>
                      <p className="muted" style={{ fontSize: 14, margin: '6px 0 14px' }}>{top.family} · {top.notes.top.slice(0, 2).join(', ')}, {top.notes.base.slice(0, 2).join(', ')}</p>
                      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        <button className="btn btn--sm" onClick={() => addToCart(top.id, defaultSize(top).ml)}><Icon.bag /> Añadir · {fmt(defaultSize(top).price)}</button>
                        <Link className="btn btn--sm btn--ghost" href={`/producto/${top.id}`}>Ver detalles</Link>
                      </div>
                    </div>
                  </div>
                  <p className="label" style={{ marginTop: 28 }}>También podría gustarte</p>
                  <div className="mini-list">
                    {rest.slice(0, 2).map((p) => (
                      <Link key={p.id} className="mini" href={`/producto/${p.id}`}><Image src={p.img} alt="" width={48} height={60} /><div><strong>{p.name}</strong><span>{p.brand}</span></div></Link>
                    ))}
                  </div>
                  <button className="back-link" style={{ marginTop: 'auto', paddingTop: 24 }} onClick={() => { setStep(0); setAns({}); }}><Icon.return /> Repetir el test</button>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </Reveal>
      </div>
    </section>
  );
}

export function CategoryCards() {
  const count = (g: string) => PRODUCTS.filter((p) => p.gender === g).length;
  const cats = [
    { href: '/tienda?g=hombre', tone: 'dark', title: 'Hombre', sub: 'Amaderados, aromáticos y ambarados con carácter.', n: count('hombre'), ids: ['bleu-de-chanel-edp', 'dior-sauvage-edp', 'le-male-le-parfum'] },
    { href: '/tienda?g=mujer', tone: 'light', title: 'Mujer', sub: 'Florales, gourmands y chipres que envuelven.', n: count('mujer'), ids: ['ysl-libre-edp', 'chanel-n5-edp', 'jadore-edp'] },
    { href: '/tienda?b=Xerjoff,Parfums de Marly,Creed,Maison Francis Kurkdjian,Tom Ford', tone: 'gold', title: 'Nicho', sub: 'Xerjoff, Parfums de Marly, Creed y más perfumería de autor.', n: PRODUCTS.filter((p) => p.tags.includes('nicho')).length, ids: ['xerjoff-naxos', 'baccarat-rouge-540', 'pdm-layton'] },
    { href: '/tienda?b=Lattafa,Armaf,Rasasi', tone: 'sand', title: 'Árabes', sub: 'Lattafa, Armaf y Rasasi: intensos, duraderos y accesibles.', n: PRODUCTS.filter((p) => p.tags.includes('arabe')).length, ids: ['lattafa-yara', 'lattafa-khamrah', 'armaf-cdnim'] },
  ];
  const [open, setOpen] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Intención de hover (140 ms) para no parpadear al cruzar la fila, como en Grupo NOX.
  const intend = (i: number) => { if (timer.current) clearTimeout(timer.current); timer.current = setTimeout(() => setOpen(i), 140); };
  return (
    <Reveal className="cat-exp" onPointerLeave={() => timer.current && clearTimeout(timer.current)}>
      {cats.map((c, i) => {
        const isOpen = open === i;
        return (
          <motion.div
            key={c.title}
            className={`cat-exp__panel cat-exp__panel--${c.tone} ${isOpen ? 'is-open' : ''}`}
            onPointerEnter={() => intend(i)} onFocus={() => setOpen(i)} onClick={() => setOpen(i)}
          >
            <span className="cat-exp__num">0{i + 1}</span>
            <span className="cat-exp__spine">{c.title}</span>
            <AnimatePresence>
              {isOpen && (
                <motion.div className="cat-exp__body" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.6, ease: EASE, delay: 0.15 }}>
                  <div className="cat-exp__copy">
                    <span className="cat-exp__count">{c.n} fragancias</span>
                    <h3>{c.title}</h3>
                    <p>{c.sub}</p>
                    <Link href={c.href} className="btn btn--sm cat-exp__cta">Ver colección <Icon.arrow /></Link>
                  </div>
                  <div className="cat-exp__bottles">
                    {c.ids.map((id, k) => {
                      const p = getProduct(id)!;
                      return (
                        <motion.span key={id} className="b" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: EASE, delay: 0.2 + k * 0.08 }}>
                          <Image src={p.img} alt={p.name} width={375} height={500} />
                        </motion.span>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </Reveal>
  );
}
