'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useUser } from '@/store/shop';
import { Field, SelectField } from './forms';
import { Icon } from './Icons';
import { EASE } from './Reveal';

const TOPICS = ['Asesoría de fragancias', 'Estado de mi pedido', 'Cambios y devoluciones', 'Ventas corporativas y regalos', 'Otro'];
const schema = z.object({
  name: z.string().trim().min(2, 'Escribe tu nombre'),
  email: z.email('Introduce un correo válido'),
  phone: z.string().optional(),
  topic: z.string(),
  order: z.string().optional(),
  message: z.string().trim().min(10, 'Cuéntanos un poco más (mínimo 10 caracteres)').max(1000),
});
type Form = z.infer<typeof schema>;

export function ContactForm() {
  const user = useUser();
  const [sent, setSent] = useState<string | null>(null);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema),
    values: { name: user?.name ?? '', email: user?.email ?? '', phone: user?.phone ?? '', topic: TOPICS[0], order: '', message: '' },
  });
  // Envío simulado: en producción se conectaría a un servicio de correo o CRM.
  const submit = async (d: Form) => {
    await new Promise((r) => setTimeout(r, 900));
    setSent(d.name.split(' ')[0]);
    reset();
  };
  return (
    <AnimatePresence mode="wait">
      {sent ? (
        <motion.div key="ok" className="contact__ok" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.6, ease: EASE }}>
          <span className="confirm__icon" style={{ width: 72, height: 72, margin: 0 }}><Icon.check style={{ width: 32, height: 32 }} /></span>
          <h3>¡Gracias, {sent}!</h3>
          <p>Recibimos tu mensaje. Te responderemos en menos de 2 horas en horario laborable.</p>
          <button className="btn btn--sm btn--ghost" onClick={() => setSent(null)}>Enviar otro mensaje</button>
        </motion.div>
      ) : (
        <motion.form key="form" onSubmit={handleSubmit(submit)} noValidate initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4, ease: EASE }}>
          <div className="fields">
            <Field label="Nombre" autoComplete="name" error={errors.name?.message} {...register('name')} />
            <Field label="Correo electrónico" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
            <Field label="Teléfono (opcional)" type="tel" autoComplete="tel" {...register('phone')} />
            <Field label="N.º de pedido (opcional)" {...register('order')} />
            <SelectField label="Motivo" full options={TOPICS} {...register('topic')} />
            <Field label="¿En qué podemos ayudarte?" textarea full error={errors.message?.message} {...register('message')} />
          </div>
          <button className="btn" style={{ marginTop: 18 }} disabled={isSubmitting}>{isSubmitting ? 'Enviando…' : <>Enviar mensaje <Icon.arrow /></>}</button>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
