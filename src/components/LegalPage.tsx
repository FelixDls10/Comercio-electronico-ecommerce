import Link from 'next/link';
import { PageHead } from './PageHead';
import { Reveal } from './Reveal';

export type LegalSection = { id: string; title: string; body: React.ReactNode };

const DOCS = [
  { href: '/legal/terminos', label: 'Términos y condiciones' },
  { href: '/legal/privacidad', label: 'Política de privacidad' },
  { href: '/legal/devoluciones', label: 'Cambios y devoluciones' },
];

// Plantilla para documentos legales: índice lateral fijo y secciones numeradas.
export function LegalPage({ crumb, title, updated, intro, sections, current }: {
  crumb: string; title: React.ReactNode; updated: string; intro: string; sections: LegalSection[]; current: string;
}) {
  return (
    <>
      <PageHead crumb={crumb} title={title} sub={intro} />
      <div className="wrap legal">
        <Reveal as="div" className="legal__aside">
          <p className="legal__updated">Última actualización: {updated}</p>
          <nav aria-label="Contenido">
            <h4>En esta página</h4>
            {sections.map((s, i) => <a key={s.id} href={`#${s.id}`}><span>{String(i + 1).padStart(2, '0')}</span>{s.title}</a>)}
          </nav>
          <nav aria-label="Documentos legales" className="legal__docs">
            <h4>Documentos</h4>
            {DOCS.map((d) => <Link key={d.href} href={d.href} className={d.href === current ? 'active' : ''}>{d.label}</Link>)}
          </nav>
        </Reveal>
        <article className="legal__body">
          {sections.map((s, i) => (
            <Reveal as="section" key={s.id} id={s.id} className="legal__section">
              <h2><span>{String(i + 1).padStart(2, '0')}</span>{s.title}</h2>
              {s.body}
            </Reveal>
          ))}
          <Reveal className="legal__note">
            Royale Parfums Collection es un proyecto académico de la asignatura Comercio Electrónico (UASD). Estos textos son un modelo
            basado en la Ley 358-05 de Protección al Consumidor, la Ley 126-02 de Comercio Electrónico y la Ley 172-13 de Protección de Datos
            Personales de la República Dominicana; antes de operar una tienda real deben ser revisados por un abogado.
          </Reveal>
        </article>
      </div>
    </>
  );
}
