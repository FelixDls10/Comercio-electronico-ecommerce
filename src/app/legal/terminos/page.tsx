import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalPage } from '@/components/LegalPage';

export const metadata: Metadata = { title: 'Términos y condiciones', description: 'Condiciones de uso y de compra en Royale Parfums Collection.' };

export default function TerminosPage() {
  return (
    <LegalPage
      current="/legal/terminos" crumb="Términos y condiciones" updated="26 de octubre de 2026"
      title={<>Términos y <em>condiciones</em></>}
      intro="Las reglas que rigen el uso de nuestro sitio y cada compra que realizas en Royale Parfums Collection."
      sections={[
        { id: 'generales', title: 'Información general', body: <>
          <p>Este sitio es operado por Royale Parfums Collection («Royale», «nosotros»), con domicilio en Av. Winston Churchill #93, Piantini, Santo Domingo, República Dominicana. Al navegar o comprar en el sitio aceptas estos términos.</p>
          <p>Para comprar debes ser mayor de 18 años o contar con la autorización de un adulto responsable.</p>
        </> },
        { id: 'productos', title: 'Productos y autenticidad', body: <>
          <p>Todos los perfumes que vendemos son originales, nuevos y sellados de fábrica, adquiridos a distribuidores autorizados. Cada frasco incluye su número de lote verificable.</p>
          <p>Las fotografías son referenciales: el empaque puede variar según el lote del fabricante. Las notas olfativas y la información técnica provienen de cada casa de perfumería.</p>
        </> },
        { id: 'precios', title: 'Precios y disponibilidad', body: <>
          <p>Los precios se expresan en pesos dominicanos (RD$) e incluyen el ITBIS (18%). El costo de envío se muestra antes de confirmar el pedido.</p>
          <p>Nos reservamos el derecho de corregir errores evidentes de precio. Si un producto se agota después de tu compra, te ofreceremos un reemplazo o el reembolso total.</p>
        </> },
        { id: 'compra', title: 'Proceso de compra', body: <>
          <p>El contrato se perfecciona cuando recibes el correo de confirmación con tu número de pedido. Puedes seguir el estado de tus pedidos desde <Link href="/cuenta/pedidos">Mi cuenta</Link>.</p>
          <ul>
            <li>Los códigos de descuento no son acumulables y aplican sobre el subtotal de productos.</li>
            <li>Podemos cancelar pedidos con indicios de fraude, reembolsando cualquier monto cobrado.</li>
          </ul>
        </> },
        { id: 'pagos', title: 'Métodos de pago', body: <>
          <p>Aceptamos tarjetas Visa, Mastercard y American Express procesadas por Stripe, PayPal, transferencia bancaria y pago contra entrega en zonas habilitadas.</p>
          <p>Royale nunca almacena el número completo de tu tarjeta ni el código de seguridad: los datos viajan cifrados directamente a la pasarela de pago. Los pagos con PayPal se cobran en dólares estadounidenses a la tasa indicada al pagar.</p>
        </> },
        { id: 'envios', title: 'Envíos y entregas', body: <>
          <ul>
            <li><strong>Estándar:</strong> 24–48 h a todo el país. RD$ 250, gratis desde RD$ 5,000.</li>
            <li><strong>Express:</strong> el mismo día en el Gran Santo Domingo para pedidos antes de las 2:00 p. m. (RD$ 450).</li>
            <li><strong>Retiro en tienda:</strong> gratis, listo en 2 horas en Piantini.</li>
          </ul>
          <p>El riesgo del producto pasa al cliente al momento de la entrega. Revisa el paquete frente al mensajero.</p>
        </> },
        { id: 'devoluciones', title: 'Cambios y devoluciones', body: <p>Consulta nuestra <Link href="/legal/devoluciones">política de cambios y devoluciones</Link>, conforme a la Ley 358-05 de Protección al Consumidor.</p> },
        { id: 'cuentas', title: 'Cuentas de usuario', body: <p>Eres responsable de mantener la confidencialidad de tu contraseña y de la actividad de tu cuenta. Puedes solicitar su eliminación en cualquier momento escribiendo a hola@royaleparfums.do.</p> },
        { id: 'ley', title: 'Ley aplicable', body: <p>Estos términos se rigen por las leyes de la República Dominicana, en particular la Ley 126-02 sobre Comercio Electrónico y la Ley 358-05. Cualquier reclamación podrá presentarse ante Pro Consumidor o los tribunales de Santo Domingo.</p> },
      ]}
    />
  );
}
