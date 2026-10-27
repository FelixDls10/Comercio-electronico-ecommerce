import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ShopView } from '@/components/ShopView';

export const metadata: Metadata = {
  title: 'Tienda',
  description: 'Compra perfumes originales de Dior, Chanel, Creed, YSL, Tom Ford y más. Filtra por familia olfativa, marca y precio.',
};

export default function TiendaPage() {
  return (
    <Suspense fallback={<div className="wrap page-head"><h1>Tienda</h1></div>}>
      <ShopView />
    </Suspense>
  );
}
