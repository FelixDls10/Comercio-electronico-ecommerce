'use client';
// Campos con etiqueta flotante, compatibles con react-hook-form (register).
import { forwardRef, useId } from 'react';

type Base = { label: string; error?: string; full?: boolean; hint?: React.ReactNode };
type InputProps = Base & React.InputHTMLAttributes<HTMLInputElement> & { textarea?: false };
type AreaProps = Base & React.TextareaHTMLAttributes<HTMLTextAreaElement> & { textarea: true };

export const Field = forwardRef<HTMLInputElement & HTMLTextAreaElement, InputProps | AreaProps>(function Field(props, ref) {
  const { label, error, full, hint, textarea, ...rest } = props;
  const id = useId();
  return (
    <div className={`field ${full ? 'full' : ''} ${error ? 'err' : ''}`}>
      {textarea
        ? <textarea id={id} ref={ref} placeholder=" " aria-invalid={!!error} {...(rest as React.TextareaHTMLAttributes<HTMLTextAreaElement>)} />
        : <input id={id} ref={ref} placeholder=" " aria-invalid={!!error} {...(rest as React.InputHTMLAttributes<HTMLInputElement>)} />}
      <label htmlFor={id}>{label}</label>
      {hint}
      {error ? <div className="msg" role="alert">{error}</div> : null}
    </div>
  );
});

export const SelectField = forwardRef<HTMLSelectElement, Base & React.SelectHTMLAttributes<HTMLSelectElement> & { options: string[] }>(
  function SelectField({ label, error, full, options, ...rest }, ref) {
    const id = useId();
    return (
      <div className={`field ${full ? 'full' : ''} ${error ? 'err' : ''}`}>
        <select id={id} ref={ref} {...rest}>{options.map((o) => <option key={o}>{o}</option>)}</select>
        <label htmlFor={id}>{label}</label>
        {error ? <div className="msg" role="alert">{error}</div> : null}
      </div>
    );
  },
);
