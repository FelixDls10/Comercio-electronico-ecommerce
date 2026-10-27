import type { Metadata, Viewport } from 'next';
import { Inter, Poppins } from 'next/font/google';
import { Suspense } from 'react';
import { Header } from '@/components/Header';
import { Footer, AnnounceBar } from '@/components/Footer';
import { Overlays } from '@/components/Overlays';
import { Providers } from '@/components/Providers';
import { SmoothScroll } from '@/components/Motion';
import './globals.css';

const poppins = Poppins({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-poppins' });
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: { default: 'Royale Parfums Collection · Perfumería de lujo', template: '%s — Royale Parfums Collection' },
  description: 'Perfumes originales de diseñador y nicho en República Dominicana. Envío en 24–48 h, muestra de cortesía y pago seguro.',
  openGraph: { siteName: 'Royale Parfums Collection', locale: 'es_DO', type: 'website', images: ['/img/brand/logo-stacked-teal.png'] },
};

export const viewport: Viewport = { themeColor: '#003449' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${poppins.variable} ${inter.variable}`}>
      <body>
        <Providers>
          <a href="#main" className="skip">Saltar al contenido</a>
          <AnnounceBar />
          <Suspense fallback={<header className="header" />}><Header /></Suspense>
          <main id="main">{children}</main>
          <Footer />
          <Suspense><Overlays /></Suspense>
          <Suspense><SmoothScroll /></Suspense>
        </Providers>
      </body>
    </html>
  );
}
