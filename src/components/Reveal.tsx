'use client';
// Entradas sobrias con Motion: opacidad + 12 px (8 px en móvil) o escala 0.98 para medios.
// Al 15 % visible (0 % si el grupo es más alto que la pantalla), 1 s con 0.1 s de retraso, una sola vez.
// MotionConfig respeta "reducir movimiento".
import { motion, type HTMLMotionProps } from 'motion/react';
import { useEffect, useState } from 'react';

export const EASE = [0.22, 1, 0.36, 1] as const;

function useTravel() {
  const [y, setY] = useState(12);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const on = () => setY(mq.matches ? 8 : 12);
    on(); mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return y;
}

type Props = HTMLMotionProps<'div'> & { media?: boolean; delay?: number; hero?: boolean; tall?: boolean; as?: 'div' | 'section' | 'article' };

export function Reveal({ media, delay = 0, hero, tall, as = 'div', children, ...rest }: Props) {
  const y = useTravel();
  const isPhone = y === 8;
  const initial = media ? { opacity: 0, scale: 0.98 } : { opacity: 0, y };
  const target = media ? { opacity: 1, scale: 1 } : { opacity: 1, y: 0 };
  const transition = hero
    ? { duration: 0.8, ease: EASE }
    : { duration: 1, ease: EASE, delay: 0.1 + (isPhone ? 0 : delay) };
  const M = motion[as];
  if (hero) return <M initial={initial} animate={target} transition={transition} {...rest}>{children}</M>;
  return (
    <M initial={initial} whileInView={target} viewport={{ once: true, amount: tall ? 0 : 0.15 }} transition={transition} {...rest}>
      {children}
    </M>
  );
}
