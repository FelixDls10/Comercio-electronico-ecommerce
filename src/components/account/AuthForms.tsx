'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'motion/react';
import { forwardRef, useId, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { hashPassword, useShop, useUI } from '@/store/shop';
import { Icon } from '../Icons';

const EASE = [0.22, 1, 0.36, 1] as const;

const loginSchema = z.object({ email: z.email('Correo no válido'), password: z.string().min(1, 'Escribe tu contraseña'), remember: z.boolean().optional() });
const registerSchema = z.object({
  name: z.string().trim().min(3, 'Escribe tu nombre completo'),
  email: z.email('Correo no válido'),
  phone: z.string().refine((v) => v.replace(/\D/g, '').length >= 10, 'Teléfono de 10 dígitos'),
  password: z.string().min(8, 'Mínimo 8 caracteres').regex(/\d/, 'Incluye al menos un número'),
  newsletter: z.boolean(),
  terms: z.literal(true, 'Debes aceptar los términos'),
});

/* ---------- Campo con etiqueta fija arriba ---------- */
type InputProps = React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string; aside?: React.ReactNode };
const AuthInput = forwardRef<HTMLInputElement, InputProps>(function AuthInput({ label, error, aside, type, ...rest }, ref) {
  const id = useId();
  const [show, setShow] = useState(false);
  const isPass = type === 'password';
  return (
    <div className={`auth-field ${error ? 'is-err' : ''}`}>
      <div className="auth-field__top"><label htmlFor={id}>{label}</label>{aside}</div>
      <div className="auth-field__box">
        <input id={id} ref={ref} type={isPass && show ? 'text' : type} aria-invalid={!!error} {...rest} />
        {isPass && (
          <button type="button" className="auth-field__eye" onClick={() => setShow(!show)} aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
            {show ? 'Ocultar' : 'Mostrar'}
          </button>
        )}
      </div>
      {error && <p className="auth-field__err" role="alert">{error}</p>}
    </div>
  );
});

/* ---------- Formularios de acceso centrados ---------- */
function AuthShell({ title, sub, children, foot }: { title: string; sub: string; children: React.ReactNode; foot: React.ReactNode }) {
  return (
    <section className="auth2 auth2--single">
      <div className="auth2__main">
        <motion.div className="auth2__form" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE }}>
          <Image className="auth2__mono" src="/img/brand/monogram-teal.png" alt="" width={40} height={49} />
          <h1>{title}</h1>
          <p className="auth2__sub">{sub}</p>
          {children}
          <div className="auth2__foot">{foot}</div>
        </motion.div>
      </div>
    </section>
  );
}

const safeNext = (n: string | null) => (n && n.startsWith('/') && !n.startsWith('//') ? n : '/cuenta');

export function LoginForm() {
  const router = useRouter();
  const next = safeNext(useSearchParams().get('next'));
  const login = useShop((s) => s.login);
  const notify = useUI((s) => s.notify);
  const [error, setError] = useState('');
  type F = z.infer<typeof loginSchema>;
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<F>({ resolver: zodResolver(loginSchema), defaultValues: { remember: true } });
  const submit = async (d: F) => {
    const ok = login(d.email.toLowerCase(), await hashPassword(d.email, d.password));
    if (!ok) { setError('Correo o contraseña incorrectos.'); return; }
    notify(<><Icon.check /><span>¡Bienvenido de nuevo!</span></>);
    router.push(next);
  };
  return (
    <AuthShell title="Bienvenido de nuevo" sub="Inicia sesión para ver tus pedidos, favoritos y direcciones."
      foot={<>¿Primera vez en Royale? <Link href={`/cuenta/registro${next !== '/cuenta' ? `?next=${next}` : ''}`}>Crea tu cuenta</Link></>}>
      <form onSubmit={handleSubmit(submit)} noValidate className="auth2__fields">
        <AuthInput label="Correo electrónico" type="email" autoComplete="email" placeholder="tu@correo.com" error={errors.email?.message} {...register('email')} />
        <AuthInput label="Contraseña" type="password" autoComplete="current-password" placeholder="••••••••" error={errors.password?.message}
          aside={<Link href="/cuenta/recuperar" className="auth2__link">¿La olvidaste?</Link>} {...register('password')} />
        <label className="auth2__check"><input type="checkbox" {...register('remember')} /> Mantener la sesión iniciada</label>
        {error && <p className="auth2__alert" role="alert"><Icon.info /> {error}</p>}
        <button className="btn btn--block auth2__submit" disabled={isSubmitting}>{isSubmitting ? 'Entrando…' : 'Iniciar sesión'}</button>
        <div className="auth2__or"><span>o</span></div>
        <Link href={next.startsWith('/checkout') ? '/checkout' : '/tienda'} className="btn btn--block btn--ghost">Continuar como invitado</Link>
      </form>
    </AuthShell>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = safeNext(sp.get('next'));
  const registerUser = useShop((s) => s.register);
  const notify = useUI((s) => s.notify);
  const [error, setError] = useState('');
  type F = z.input<typeof registerSchema>;
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<F>({
    resolver: zodResolver(registerSchema), defaultValues: { email: sp.get('email') ?? '', newsletter: true },
  });
  const submit = async (d: F) => {
    const ok = registerUser({
      name: d.name.trim(), email: d.email.toLowerCase(), phone: d.phone, passHash: await hashPassword(d.email, d.password),
      created: new Date().toISOString(), newsletter: d.newsletter,
    });
    if (!ok) { setError('Ya existe una cuenta con ese correo.'); return; }
    notify(<><Icon.check /><span>¡Cuenta creada! Usa <strong>ROYALE10</strong> en tu primera compra.</span></>);
    router.push(next);
  };
  return (
    <AuthShell title="Crea tu cuenta" sub="Guarda tus favoritos, sigue tus pedidos y recibe 10% en tu primera compra."
      foot={<>¿Ya tienes cuenta? <Link href="/cuenta/ingresar">Inicia sesión</Link></>}>
      <form onSubmit={handleSubmit(submit)} noValidate className="auth2__fields">
        <AuthInput label="Nombre completo" autoComplete="name" placeholder="Nombre y apellido" error={errors.name?.message} {...register('name')} />
        <div className="auth2__two">
          <AuthInput label="Correo electrónico" type="email" autoComplete="email" placeholder="tu@correo.com" error={errors.email?.message} {...register('email')} />
          <AuthInput label="Teléfono" type="tel" autoComplete="tel" placeholder="809 000 0000" error={errors.phone?.message} {...register('phone')} />
        </div>
        <AuthInput label="Contraseña" type="password" autoComplete="new-password" placeholder="Mínimo 8 caracteres y un número" error={errors.password?.message} {...register('password')} />
        <label className="auth2__check"><input type="checkbox" {...register('newsletter')} /> Quiero recibir lanzamientos y ofertas</label>
        <label className="auth2__check"><input type="checkbox" {...register('terms')} /> Acepto los <Link href="/legal/terminos" target="_blank">términos</Link> y la <Link href="/legal/privacidad" target="_blank">privacidad</Link></label>
        {errors.terms && <p className="auth-field__err">{errors.terms.message}</p>}
        {error && <p className="auth2__alert" role="alert"><Icon.info /> {error}</p>}
        <button className="btn btn--block auth2__submit" disabled={isSubmitting}>Crear cuenta</button>
      </form>
    </AuthShell>
  );
}

export function RecoverForm() {
  const [sent, setSent] = useState('');
  const { register, handleSubmit, formState: { errors } } = useForm<{ email: string }>({ resolver: zodResolver(z.object({ email: z.email('Correo no válido') })) });
  return (
    <AuthShell title="Recupera tu acceso" sub="Te enviaremos un enlace para crear una nueva contraseña."
      foot={<Link href="/cuenta/ingresar">Volver a iniciar sesión</Link>}>
      {sent ? (
        <p className="auth2__alert auth2__alert--ok"><Icon.mail /> Si existe una cuenta con <strong>{sent}</strong>, recibirás las instrucciones en unos minutos.</p>
      ) : (
        <form onSubmit={handleSubmit((d) => setSent(d.email))} noValidate className="auth2__fields">
          <AuthInput label="Correo electrónico" type="email" autoComplete="email" placeholder="tu@correo.com" error={errors.email?.message} {...register('email')} />
          <button className="btn btn--block auth2__submit">Enviar enlace</button>
        </form>
      )}
    </AuthShell>
  );
}
