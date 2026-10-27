import type { Metadata } from 'next';
import { Suspense } from 'react';
import { RecoverForm } from '@/components/account/AuthForms';

export const metadata: Metadata = { title: 'Recuperar contraseña', robots: { index: false } };

export default function Page() {
  return <Suspense><RecoverForm /></Suspense>;
}
