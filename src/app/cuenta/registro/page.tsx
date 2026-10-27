import type { Metadata } from 'next';
import { Suspense } from 'react';
import { RegisterForm } from '@/components/account/AuthForms';

export const metadata: Metadata = { title: 'Crear cuenta', robots: { index: false } };

export default function Page() {
  return <Suspense><RegisterForm /></Suspense>;
}
