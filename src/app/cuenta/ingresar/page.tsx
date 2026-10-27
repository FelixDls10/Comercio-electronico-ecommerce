import type { Metadata } from 'next';
import { Suspense } from 'react';
import { LoginForm } from '@/components/account/AuthForms';

export const metadata: Metadata = { title: 'Iniciar sesión', robots: { index: false } };

export default function Page() {
  return <Suspense><LoginForm /></Suspense>;
}
