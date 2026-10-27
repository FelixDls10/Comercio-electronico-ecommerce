'use client';
import { useEffect, useState } from 'react';

// Evita desajustes de hidratación al leer datos de localStorage.
export function useMounted() {
  const [m, setM] = useState(false);
  useEffect(() => setM(true), []);
  return m;
}

export function useLockBody(lock: boolean) {
  useEffect(() => {
    if (!lock) return;
    document.body.classList.add('locked');
    return () => document.body.classList.remove('locked');
  }, [lock]);
}
