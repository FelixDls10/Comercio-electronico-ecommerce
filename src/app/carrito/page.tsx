'use client';
import Image from 'next/image';
import { PayBadges } from '@/components/Icons';
import { TotalsRows } from '@/components/Totals';
import Link from 'next/link';
import { PRODUCTS } from '@/lib/products';
import { computeTotals, fmt } from '@/lib/pricing';
import { useMounted } from '@/lib/hooks';
import { useShop } from '@/store/shop';
import { Icon } from '@/components/Icons';
import { PageHead } from '@/components/PageHead';
import { QtyStepper, ShipProgress } from '@/components/Overlays';
import { ProductCarousel } from '@/components/product/ProductCarousel';
import { PromoForm } from '@/components/checkout/PromoForm';
import { Reveal } from '@/components/Reveal';

export default function CarritoPage() {
  const mounted = useMounted();
  const cart = useShop((s) => s.cart);
  const promo = useShop((s) => s.promo);
  const { setQty, remove, toggleWish } = useShop();
  const t = computeTotals(mounted ? cart : [], promo);
  const inCart = new Set(t.lines.map((l) => l.id));
  const suggestions = PRODUCTS.filter((p) => !inCart.has(p.id) && p.tags.includes('bestseller')).slice(0, 8);

  return (
    <>
      <PageHead crumb="Bolsa" title={<>Tu <em>bolsa</em></>} sub={t.lines.length ? `${t.lines.reduce((a, l) => a + l.qty, 0)} artículos · Precios con ITBIS incluido` : undefined} />
      {mounted && !t.lines.length ? (
        <div className="wrap" style={{ paddingBottom: 60 }}>
          <Reveal className="no-results">
            <h3>Tu bolsa está vacía</h3>
            <p>Descubre fragancias que cuentan tu historia.</p>
            <Link href="/tienda" className="btn btn--sm">Explorar la tienda</Link>
          </Reveal>
        </div>
      ) : (
        <div className="wrap checkout">
          <Reveal>
            <div className="cart-table">
              <div className="cart-table__head"><span>Producto</span><span>Cantidad</span><span>Total</span></div>
              {t.lines.map((l) => (
                <div className="cart-row" key={`${l.id}-${l.ml}`}>
                  <Link href={`/producto/${l.id}`} className="cart-item__img"><Image src={l.p.img} alt={l.p.name} width={75} height={100} /></Link>
                  <div>
                    <div className="cart-item__brand">{l.p.brand}</div>
                    <Link href={`/producto/${l.id}`} className="cart-item__name">{l.p.name}</Link>
                    <div className="cart-item__meta">{l.p.concentration} · {l.ml} ml · {fmt(l.size.price)} c/u</div>
                    <div className="cart-row__links">
                      <button className="remove" onClick={() => { toggleWish(l.id); remove(l.id, l.ml); }}>Mover a favoritos</button>
                      <button className="remove" onClick={() => remove(l.id, l.ml)}>Eliminar</button>
                    </div>
                  </div>
                  <QtyStepper value={l.qty} onChange={(n) => setQty(l.id, l.ml, n)} />
                  <div className="cart-item__price">{fmt(l.total)}</div>
                </div>
              ))}
            </div>
            <Link href="/tienda" className="back-link" style={{ marginTop: 24 }}><Icon.arrowL /> Seguir comprando</Link>
          </Reveal>
          <Reveal className="summary" delay={0.1}>
            <h3>Resumen</h3>
            <ShipProgress subtotal={t.subtotal} />
            <PromoForm />
            <TotalsRows t={t} promo={promo} shipLabel="Envío estándar" totalLabel="Total estimado" />
            <Link href="/checkout" className="btn btn--block" style={{ marginTop: 18 }}><Icon.lock /> Finalizar compra</Link>
            <PayBadges />
          </Reveal>
        </div>
      )}
      <ProductCarousel products={suggestions} title="Más vendidos" />
    </>
  );
}
