'use client';
import { useState } from 'react';
import { PROMOS } from '@/lib/pricing';
import { useMounted } from '@/lib/hooks';
import { useShop } from '@/store/shop';

export function PromoForm() {
  const mounted = useMounted();
  const promo = useShop((s) => s.promo);
  const apply = useShop((s) => s.applyPromo);
  const clear = useShop((s) => s.clearPromo);
  const [code, setCode] = useState('');
  const [bad, setBad] = useState(false);
  const active = mounted ? promo : null;

  if (active) {
    return (
      <div className="promo-msg ok promo-active">
        Código <strong>{active}</strong> aplicado (−{PROMOS[active] * 100}%)
        <button type="button" onClick={clear}>Quitar</button>
      </div>
    );
  }
  return (
    <>
      <form className="promo" onSubmit={(e) => { e.preventDefault(); const ok = apply(code); setBad(!ok && !!code.trim()); if (ok) setCode(''); }}>
        <input value={code} onChange={(e) => { setCode(e.target.value); setBad(false); }} placeholder="Código de descuento" aria-label="Código de descuento" />
        <button className="btn btn--sm btn--ghost" type="submit">Aplicar</button>
      </form>
      {bad && <div className="promo-msg bad">Código no válido. Prueba con ROYALE10.</div>}
    </>
  );
}
