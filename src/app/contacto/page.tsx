import type { Metadata } from 'next';
import Link from 'next/link';
import { ContactForm } from '@/components/ContactForm';
import { Icon } from '@/components/Icons';
import { PageHead } from '@/components/PageHead';
import { Reveal } from '@/components/Reveal';

export const metadata: Metadata = { title: 'Contacto', description: 'Escríbenos por WhatsApp, correo o visítanos en Piantini, Santo Domingo. Asesoría de fragancias personalizada.' };

const CHANNELS = [
  { icon: <Icon.whatsapp />, title: 'WhatsApp', line: '+1 (809) 555-0140', note: 'Respuesta en minutos', href: 'https://wa.me/18095550140' },
  { icon: <Icon.mail />, title: 'Correo', line: 'hola@royaleparfums.do', note: 'Respuesta en menos de 2 h', href: 'mailto:hola@royaleparfums.do' },
  { icon: <Icon.phone />, title: 'Teléfono', line: '+1 (809) 555-0140', note: 'Lun–Sáb, 9:00 a. m.–7:00 p. m.', href: 'tel:+18095550140' },
];

export default function ContactoPage() {
  return (
    <>
      <PageHead crumb="Contacto" title={<>Hablemos de <em>fragancias</em></>} sub="Nuestros asesores te ayudan a elegir, rastrear tu pedido o preparar un regalo especial." />
      <div className="wrap contact">
        <div className="contact__side">
          {CHANNELS.map((c, i) => (
            <Reveal key={c.title} delay={i * 0.1}>
              <a className="contact__card" href={c.href} target={c.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
                <span className="perk__icon">{c.icon}</span>
                <div><small>{c.title}</small><strong>{c.line}</strong><span>{c.note}</span></div>
                <Icon.arrowUR />
              </a>
            </Reveal>
          ))}
          <Reveal className="contact__store">
            <span className="eyebrow eyebrow--light">Visítanos</span>
            <h3>Boutique Piantini</h3>
            <p><Icon.pin /> Av. Winston Churchill #93, Piantini, Santo Domingo</p>
            <dl>
              <div><dt>Lunes a viernes</dt><dd>9:00 a. m. – 7:00 p. m.</dd></div>
              <div><dt>Sábados</dt><dd>10:00 a. m. – 6:00 p. m.</dd></div>
              <div><dt>Domingos</dt><dd>Cerrado</dd></div>
            </dl>
            <p className="muted-light">Prueba cualquier fragancia en tienda y retira tu pedido online sin costo.</p>
          </Reveal>
        </div>
        <Reveal className="panel contact__form" delay={0.1}>
          <h3>Envíanos un mensaje</h3>
          <p className="muted" style={{ marginBottom: 22, fontSize: 14 }}>¿Buscas una pregunta frecuente? Revisa el <Link href="/ayuda" style={{ textDecoration: 'underline' }}>centro de ayuda</Link>.</p>
          <ContactForm />
        </Reveal>
      </div>
    </>
  );
}
