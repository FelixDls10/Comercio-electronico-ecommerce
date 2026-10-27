import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalPage } from '@/components/LegalPage';

export const metadata: Metadata = { title: 'Cambios y devoluciones', description: 'Plazos y condiciones para cambios, devoluciones y reembolsos en Royale Parfums Collection.' };

export default function DevolucionesPage() {
  return (
    <LegalPage
      current="/legal/devoluciones" crumb="Cambios y devoluciones" updated="26 de octubre de 2026"
      title={<>Cambios y <em>devoluciones</em></>}
      intro="Queremos que ames tu fragancia. Si algo no salió como esperabas, así lo resolvemos."
      sections={[
        { id: 'plazo', title: 'Plazo', body: <p>Tienes <strong>7 días calendario</strong> desde la entrega para solicitar un cambio o devolución, de acuerdo con el derecho de retracto de la Ley 358-05 para compras a distancia.</p> },
        { id: 'condiciones', title: 'Condiciones', body: <>
          <p>Por razones de higiene, solo aceptamos productos <strong>sellados</strong>, sin abrir y en su empaque original con el celofán intacto.</p>
          <p>¿Quieres probar antes? Cada pedido incluye una muestra de cortesía: úsala antes de abrir el frasco.</p>
        </> },
        { id: 'defectos', title: 'Productos dañados o incorrectos', body: <p>Si tu perfume llegó roto, con fuga o no corresponde a lo que pediste, avísanos en las primeras 48 horas con una foto. Lo reemplazamos sin costo y recogemos el producto en tu domicilio.</p> },
        { id: 'proceso', title: 'Cómo solicitarlo', body: <ol>
          <li>Escríbenos por WhatsApp al +1 (809) 555-0140 o desde la página de <Link href="/contacto">contacto</Link> con tu número de pedido.</li>
          <li>Coordinamos la recogida o puedes llevarlo a nuestra tienda de Piantini.</li>
          <li>Verificamos el producto en un máximo de 48 horas.</li>
        </ol> },
        { id: 'reembolso', title: 'Reembolsos', body: <>
          <p>El reembolso se realiza por el mismo medio de pago: tarjeta y PayPal en 5–10 días hábiles según tu banco; transferencia en 2 días hábiles.</p>
          <p>Si fue un cambio de opinión, el costo de envío original no es reembolsable. En productos defectuosos reembolsamos el 100%.</p>
        </> },
        { id: 'garantia', title: 'Garantía de autenticidad', body: <p>Si comprobaras que un producto comprado en Royale no es original, te devolvemos el <strong>doble</strong> de lo pagado.</p> },
      ]}
    />
  );
}
