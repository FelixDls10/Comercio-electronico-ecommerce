'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useMemo, useState } from 'react';
import { BRANDS, FAMILIES, GENDER_LABEL, PRODUCTS, type Gender } from '@/lib/products';
import { fmt } from '@/lib/pricing';
import { useLockBody } from '@/lib/hooks';
import { Icon } from './Icons';
import { matches } from './Overlays';
import { PageHead } from './PageHead';
import { ProductCard } from './ProductCard';
import { EASE, Reveal } from './Reveal';

const MAX_PRICE = Math.ceil(Math.max(...PRODUCTS.map((p) => p.price)) / 1000) * 1000;
const SORTS = { featured: 'Destacados', 'price-asc': 'Precio: menor a mayor', 'price-desc': 'Precio: mayor a menor', rating: 'Mejor valorados', new: 'Más recientes', name: 'Nombre A–Z' } as const;
type SortKey = keyof typeof SORTS;
const TITLES: Record<string, [string, React.ReactNode]> = {
  hombre: ['Hombre', <>Perfumes para <em>él</em></>],
  mujer: ['Mujer', <>Perfumes para <em>ella</em></>],
  unisex: ['Nicho & Unisex', <>Perfumería de <em>autor</em></>],
};
const split = (v: string | null) => (v ? v.split(',').filter(Boolean) : []);

function Check({ name, value, label, n, checked, onChange }: { name: string; value: string; label: string; n: number; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="f-opt">
      <span className="lbl">
        <input type="checkbox" name={name} value={value} checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <span className="box"><Icon.check /></span>{label}
      </span>
      <span className="cnt">{n}</span>
    </label>
  );
}

export function ShopView() {
  const sp = useSearchParams();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  useLockBody(open);

  const f = {
    g: split(sp.get('g')), fam: split(sp.get('f')), b: split(sp.get('b')),
    max: sp.get('max') ? Number(sp.get('max')) : MAX_PRICE,
    sort: (sp.get('sort') as SortKey) in SORTS ? (sp.get('sort') as SortKey) : 'featured',
    q: sp.get('q') ?? '',
  };
  const [price, setPrice] = useState(f.max);
  useEffect(() => setPrice(f.max), [f.max]);

  const update = (patch: Partial<typeof f>) => {
    const n = { ...f, ...patch };
    const qs = new URLSearchParams();
    if (n.g.length) qs.set('g', n.g.join(','));
    if (n.fam.length) qs.set('f', n.fam.join(','));
    if (n.b.length) qs.set('b', n.b.join(','));
    if (n.max < MAX_PRICE) qs.set('max', String(n.max));
    if (n.sort !== 'featured') qs.set('sort', n.sort);
    if (n.q) qs.set('q', n.q);
    const s = qs.toString().replace(/%2C/g, ',');
    router.replace(`/tienda${s ? `?${s}` : ''}`, { scroll: false });
  };
  const toggle = (key: 'g' | 'fam' | 'b', v: string, on: boolean) => update({ [key]: on ? [...f[key], v] : f[key].filter((x) => x !== v) });

  const list = useMemo(() => {
    const l = PRODUCTS.filter((p) =>
      (!f.g.length || f.g.includes(p.gender)) && (!f.fam.length || f.fam.includes(p.familyKey)) &&
      (!f.b.length || f.b.includes(p.brand)) && p.price <= price && (!f.q || matches(p, f.q)));
    const sorters: Record<SortKey, (a: (typeof l)[0], b: (typeof l)[0]) => number> = {
      featured: (a, b) => b.rating * b.reviews - a.rating * a.reviews, 'price-asc': (a, b) => a.price - b.price,
      'price-desc': (a, b) => b.price - a.price, rating: (a, b) => b.rating - a.rating, new: (a, b) => b.year - a.year,
      name: (a, b) => a.name.localeCompare(b.name),
    };
    return l.sort(sorters[f.sort]);
  }, [sp, price]); // eslint-disable-line react-hooks/exhaustive-deps

  const chips: [string, string, string][] = [
    ...f.g.map((v): [string, string, string] => ['g', v, GENDER_LABEL[v as Gender]]),
    ...f.fam.map((v): [string, string, string] => ['fam', v, FAMILIES.find((x) => x.key === v)?.name ?? v]),
    ...f.b.map((v): [string, string, string] => ['b', v, v]),
    ...(f.q ? [['q', f.q, `“${f.q}”`] as [string, string, string]] : []),
    ...(f.max < MAX_PRICE ? [['max', '', `Hasta ${fmt(f.max)}`] as [string, string, string]] : []),
  ];
  const clearAll = () => router.replace('/tienda', { scroll: false });
  const t: [string, React.ReactNode] = f.g.length === 1 && TITLES[f.g[0]] ? TITLES[f.g[0]] : ['Tienda', <>Toda la <em>colección</em></>];
  const count = (fn: (p: (typeof PRODUCTS)[0]) => boolean) => PRODUCTS.filter(fn).length;

  return (
    <>
      <PageHead crumb={t[0]} title={t[1]} sub="Fragancias originales de diseñador y nicho. Filtra por familia olfativa, marca o presupuesto." />
      <div className="wrap shop">
        <div className={`overlay ${open ? 'is-open' : ''}`} onClick={() => setOpen(false)} />
        <aside className={`filters ${open ? 'is-open' : ''}`} aria-label="Filtros">
          <div className="filters__head"><h3>Filtros</h3><button className="icon-btn" onClick={() => setOpen(false)} aria-label="Cerrar filtros"><Icon.x /></button></div>
          <div><h4>Género</h4>{(['hombre', 'mujer', 'unisex'] as Gender[]).map((g) => <Check key={g} name="g" value={g} label={GENDER_LABEL[g]} n={count((p) => p.gender === g)} checked={f.g.includes(g)} onChange={(on) => toggle('g', g, on)} />)}</div>
          <div><h4>Familia olfativa</h4>{FAMILIES.map((x) => <Check key={x.key} name="fam" value={x.key} label={x.name} n={count((p) => p.familyKey === x.key)} checked={f.fam.includes(x.key)} onChange={(on) => toggle('fam', x.key, on)} />)}</div>
          <div>
            <h4>Precio máximo</h4>
            <input type="range" className="range" min={4000} max={MAX_PRICE} step={500} value={price} aria-label="Precio máximo"
              onChange={(e) => setPrice(Number(e.target.value))} onPointerUp={() => update({ max: price })} onKeyUp={() => update({ max: price })} />
            <div className="range-label"><span>RD$ 4,000</span><span>{fmt(price)}</span></div>
          </div>
          <div><h4>Marca</h4>{BRANDS.map((b) => <Check key={b} name="b" value={b} label={b} n={count((p) => p.brand === b)} checked={f.b.includes(b)} onChange={(on) => toggle('b', b, on)} />)}</div>
          <button className="btn btn--ghost btn--sm" onClick={clearAll}>Limpiar filtros</button>
        </aside>
        <div>
          <div className="toolbar">
            <span className="toolbar__count">{list.length} {list.length === 1 ? 'fragancia' : 'fragancias'}</span>
            <div className="toolbar__right">
              <button className="chip filter-btn" onClick={() => setOpen(true)}><Icon.filter /> Filtros{chips.length ? ` (${chips.length})` : ''}</button>
              <select className="select" value={f.sort} onChange={(e) => update({ sort: e.target.value as SortKey })} aria-label="Ordenar">
                {Object.entries(SORTS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
              </select>
            </div>
          </div>
          {chips.length ? (
            <div className="active-filters">
              {chips.map(([k, v, l]) => (
                <button key={k + v} className="chip active" onClick={() => {
                  if (k === 'q') update({ q: '' }); else if (k === 'max') update({ max: MAX_PRICE }); else toggle(k as 'g' | 'fam' | 'b', v, false);
                }}>{l} <Icon.x /></button>
              ))}
            </div>
          ) : null}
          <Reveal className="grid grid--3" tall>
            <AnimatePresence mode="popLayout" initial={false}>
              {list.map((p, i) => (
                <motion.div key={p.id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.6, ease: EASE }} style={{ display: 'flex' }}>
                  <ProductCard p={p} priority={i < 3} />
                </motion.div>
              ))}
            </AnimatePresence>
            {!list.length && (
              <div className="no-results">
                <h3>Sin coincidencias</h3>
                <p>Prueba a quitar algún filtro o ampliar el presupuesto.</p>
                <button className="btn btn--sm" onClick={clearAll}>Limpiar filtros</button>
              </div>
            )}
          </Reveal>
        </div>
      </div>
    </>
  );
}
