import type { Metadata } from 'next';
import { HelpCenter } from '@/components/HelpCenter';
import { PageHead } from '@/components/PageHead';

export const metadata: Metadata = { title: 'Centro de ayuda', description: 'Preguntas frecuentes sobre envíos, pagos, autenticidad, cambios y tu cuenta en Royale Parfums Collection.' };

export default function AyudaPage() {
  return (
    <>
      <PageHead crumb="Ayuda" title={<>Centro de <em>ayuda</em></>} sub="Todo lo que necesitas saber sobre envíos, pagos, cambios y autenticidad." />
      <HelpCenter />
    </>
  );
}
