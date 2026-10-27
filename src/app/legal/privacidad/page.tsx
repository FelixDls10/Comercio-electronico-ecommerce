import type { Metadata } from 'next';
import { LegalPage } from '@/components/LegalPage';

export const metadata: Metadata = { title: 'Política de privacidad', description: 'Cómo Royale Parfums Collection recopila, usa y protege tus datos personales.' };

export default function PrivacidadPage() {
  return (
    <LegalPage
      current="/legal/privacidad" crumb="Política de privacidad" updated="26 de octubre de 2026"
      title={<>Política de <em>privacidad</em></>}
      intro="Qué datos recopilamos, para qué los usamos y cómo puedes ejercer tus derechos."
      sections={[
        { id: 'responsable', title: 'Responsable del tratamiento', body: <p>Royale Parfums Collection, Av. Winston Churchill #93, Piantini, Santo Domingo. Contacto de privacidad: privacidad@royaleparfums.do.</p> },
        { id: 'datos', title: 'Datos que recopilamos', body: <ul>
          <li><strong>Identificación y contacto:</strong> nombre, correo, teléfono y dirección de entrega.</li>
          <li><strong>Pedidos:</strong> productos comprados, importes y método de pago (solo marca y últimos 4 dígitos de la tarjeta).</li>
          <li><strong>Cuenta:</strong> credenciales cifradas, favoritos y reseñas que publiques.</li>
          <li><strong>Navegación:</strong> datos técnicos básicos para el funcionamiento del sitio (por ejemplo, el contenido de tu bolsa).</li>
        </ul> },
        { id: 'finalidad', title: 'Para qué los usamos', body: <ul>
          <li>Procesar, entregar y dar seguimiento a tus pedidos.</li>
          <li>Atender consultas, cambios y garantías.</li>
          <li>Enviarte novedades del Club Royale, solo si lo autorizas (puedes darte de baja en cualquier correo).</li>
          <li>Prevenir fraudes y cumplir obligaciones fiscales.</li>
        </ul> },
        { id: 'terceros', title: 'Con quién los compartimos', body: <>
          <p>Solo con proveedores necesarios para operar: Stripe y PayPal (pagos), empresas de mensajería (entregas) y nuestro proveedor de correo. Nunca vendemos tus datos.</p>
          <p>Los procesadores de pago cumplen con el estándar PCI DSS; Royale no ve ni guarda los datos completos de tu tarjeta.</p>
        </> },
        { id: 'conservacion', title: 'Conservación y seguridad', body: <p>Conservamos los datos de pedidos durante el plazo exigido por la normativa fiscal (10 años) y los datos de cuenta mientras esta permanezca activa. Utilizamos conexiones cifradas (HTTPS) y contraseñas con hash.</p> },
        { id: 'derechos', title: 'Tus derechos', body: <p>Conforme a la Ley 172-13 puedes acceder, rectificar, cancelar u oponerte al tratamiento de tus datos. Escríbenos a privacidad@royaleparfums.do y responderemos en un plazo máximo de 10 días hábiles.</p> },
        { id: 'cookies', title: 'Almacenamiento local', body: <p>Usamos el almacenamiento del navegador para recordar tu bolsa, favoritos y sesión. No utilizamos cookies publicitarias de terceros. Puedes borrar estos datos desde la configuración de tu navegador.</p> },
      ]}
    />
  );
}
