'use client';
import { AnimatePresence, motion } from 'motion/react';
import { fmt, ITBIS_RATE } from '@/lib/pricing';
import { EASE } from './Reveal';

type T = { subtotal: number; discount: number; shipping: number; total: number; itbis: number; net: number };

// Resumen de importes con el ITBIS desglosado (los precios ya lo incluyen).
export function TotalsRows({ t, promo, shipLabel = 'Envío', totalLabel = 'Total' }: { t: T; promo?: string | null; shipLabel?: string; totalLabel?: string }) {
  return (
    <div className="sum-rows">
      <div className="row"><span>Subtotal</span><span>{fmt(t.subtotal)}</span></div>
      {t.discount ? <div className="row discount"><span>Descuento{promo ? ` ${promo}` : ''}</span><span>− {fmt(t.discount)}</span></div> : null}
      <div className="row"><span>{shipLabel}</span><span>{t.shipping ? fmt(t.shipping) : 'Gratis'}</span></div>
      <div className="row total">
        <span>{totalLabel}</span>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.strong key={t.total} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.4, ease: EASE }}>{fmt(t.total)}</motion.strong>
        </AnimatePresence>
      </div>
      <div className="tax">
        <div><span>Monto sin ITBIS</span><span>{fmt(t.net)}</span></div>
        <div><span>ITBIS ({Math.round(ITBIS_RATE * 100)}%)</span><span>{fmt(t.itbis)}</span></div>
      </div>
    </div>
  );
}
