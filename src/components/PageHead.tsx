import Link from 'next/link';
import { Reveal } from './Reveal';

export function PageHead({ crumb, title, sub, parent }: { crumb: string; title: React.ReactNode; sub?: React.ReactNode; parent?: { href: string; label: string } }) {
  return (
    <Reveal hero as="section" className="page-head wrap">
      <nav className="crumbs" aria-label="Ruta">
        <Link href="/">Inicio</Link><span>/</span>
        {parent ? <><Link href={parent.href}>{parent.label}</Link><span>/</span></> : null}
        <span>{crumb}</span>
      </nav>
      <h1>{title}</h1>
      {sub ? <p>{sub}</p> : null}
    </Reveal>
  );
}
