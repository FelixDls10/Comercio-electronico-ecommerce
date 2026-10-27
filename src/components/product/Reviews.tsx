'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import type { Product } from '@/lib/products';
import { useMounted } from '@/lib/hooks';
import { useShop, useUI, useUser } from '@/store/shop';
import { Icon, StarRow } from '../Icons';
import { EASE } from '../Reveal';
import { Field } from '../forms';

const NAMES = ['Ana L.', 'Pedro M.', 'Gabriela S.', 'Luis F.', 'Carolina R.', 'Miguel A.', 'Paola D.', 'Rafael T.', 'Daniela V.', 'Andrés C.'];
const TEXTS = [
  'Huele exactamente igual al de las tiendas del aeropuerto. Llegó sellado y con factura, muy recomendado.',
  'La duración en mi piel es excelente, más de 8 horas. Recibo cumplidos cada vez que lo uso.',
  'Lo compré para regalo y el empaque fue precioso. La muestra de cortesía fue un detalle hermoso.',
  'Entrega al día siguiente en Santiago. La fragancia evoluciona muy bonito durante el día.',
  'Mi perfume insignia desde hace años y aquí lo consigo a mejor precio. Volveré a comprar.',
  'Con el calor de aquí se proyecta muchísimo, con dos atomizaciones es suficiente.',
];
const hash = (s: string) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);

const schema = z.object({
  name: z.string().trim().min(2, 'Escribe tu nombre'),
  rating: z.number().min(1, 'Elige una calificación').max(5),
  title: z.string().trim().min(3, 'Escribe un título breve').max(60),
  text: z.string().trim().min(15, 'Cuéntanos un poco más (mínimo 15 caracteres)').max(600),
});
type Form = z.infer<typeof schema>;

export function Reviews({ p }: { p: Product }) {
  const mounted = useMounted();
  const user = useUser();
  const userReviews = useShop((s) => s.reviews).filter((r) => r.productId === p.id);
  const addReview = useShop((s) => s.addReview);
  const notify = useUI((s) => s.notify);
  const [writing, setWriting] = useState(false);

  const h = hash(p.id);
  const seeded = [0, 1, 2, 3].map((k) => ({
    name: NAMES[(h + k * 3) % NAMES.length], text: TEXTS[(h + k) % TEXTS.length], title: '',
    rating: k === 2 && p.rating < 4.8 ? 4 : 5, date: `${((h + k * 7) % 27) + 1}/${(k % 3) + 7}/2026`,
  }));
  const mine = mounted ? userReviews : [];
  const total = p.reviews + mine.length;
  const avg = (p.rating * p.reviews + mine.reduce((a, r) => a + r.rating, 0)) / total;
  const five = Math.round((p.reviews * (p.rating - 3.6)) / 1.4);
  const four = Math.round((p.reviews - five) * 0.7);
  const three = Math.round((p.reviews - five - four) * 0.7);
  const two = Math.max(0, Math.round((p.reviews - five - four - three) * 0.6));
  const dist = [five, four, three, two, Math.max(0, p.reviews - five - four - three - two)];
  mine.forEach((r) => { dist[5 - r.rating] += 1; });

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema), defaultValues: { name: '', rating: 0, title: '', text: '' },
  });
  const rating = watch('rating');
  const open = () => { reset({ name: user?.name ?? '', rating: 0, title: '', text: '' }); setWriting(true); };
  const submit = (d: Form) => {
    addReview({ productId: p.id, ...d, date: new Date().toLocaleDateString('es-DO') });
    setWriting(false);
    notify(<><Icon.check /><span>¡Gracias! Tu reseña fue publicada.</span></>);
  };

  return (
    <>
      <div className="section-head" style={{ marginBottom: 18, alignItems: 'center' }}>
        <h3 style={{ margin: 0 }}>Reseñas de clientes</h3>
        {!writing && <button className="btn btn--sm btn--ghost" onClick={open}>Escribir reseña</button>}
      </div>
      <div className="rev-summary">
        <div className="rev-score">
          <strong>{avg.toFixed(1)}</strong>
          <div style={{ display: 'flex', justifyContent: 'center', margin: '6px 0' }}><StarRow n={Math.round(avg)} /></div>
          <small>{total} reseñas</small>
        </div>
        <div className="rev-bars">
          {dist.map((n, k) => (
            <div className="rev-bar" key={k}><span>{5 - k}★</span><div className="bar"><i style={{ width: `${(n / total) * 100}%` }} /></div><span>{n}</span></div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {writing && (
          <motion.form className="review-form" onSubmit={handleSubmit(submit)} noValidate
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.5, ease: EASE }}>
            <div className="review-form__inner">
              <div className="label" style={{ marginTop: 0 }}>Tu calificación</div>
              <div className="rate-input" role="radiogroup" aria-label="Calificación">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button type="button" key={n} role="radio" aria-checked={rating === n} aria-label={`${n} estrellas`} className={n <= rating ? 'on' : ''} onClick={() => setValue('rating', n, { shouldValidate: true })}><Icon.star /></button>
                ))}
              </div>
              {errors.rating && <p className="err-msg">{errors.rating.message}</p>}
              <div className="fields" style={{ marginTop: 14 }}>
                <Field label="Tu nombre" error={errors.name?.message} {...register('name')} />
                <Field label="Título" error={errors.title?.message} {...register('title')} />
                <Field label="Tu experiencia con la fragancia" textarea full error={errors.text?.message} {...register('text')} />
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                <button className="btn btn--sm" type="submit">Publicar reseña</button>
                <button className="btn btn--sm btn--ghost" type="button" onClick={() => setWriting(false)}>Cancelar</button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="rev-list">
        {mine.map((r, i) => (
          <article className="rev rev--mine" key={`m${i}`}>
            <header><strong>{r.name}</strong><StarRow n={r.rating} size={13} /></header>
            {r.title && <p style={{ color: 'var(--teal)', fontWeight: 500, marginBottom: 4 }}>{r.title}</p>}
            <p>{r.text}</p><span className="verified"><Icon.check /> Tu reseña · {r.date}</span>
          </article>
        ))}
        {seeded.map((r, i) => (
          <article className="rev" key={i}>
            <header><strong>{r.name}</strong><StarRow n={r.rating} size={13} /></header>
            <p>{r.text}</p><span className="verified"><Icon.check /> Compra verificada · {r.date}</span>
          </article>
        ))}
      </div>
    </>
  );
}
