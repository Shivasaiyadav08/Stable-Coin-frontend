import { useId, type InputHTMLAttributes, type ReactNode } from 'react';

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: ReactNode;
  error?: string;
  suffix?: string;
};

export function Field({ label, hint, error, suffix, ...input }: FieldProps) {
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className="input-wrap">
        <input
          {...input}
          id={id}
          aria-invalid={!!error}
          aria-describedby={error || hint ? `${id}-hint` : undefined}
        />
        {suffix ? <span className="input-suffix">{suffix}</span> : null}
      </div>
      {error || hint ? (
        <span
          id={`${id}-hint`}
          role={error ? 'alert' : undefined}
          className={error ? 'field-error' : 'field-hint'}
        >
          {error || hint}
        </span>
      ) : null}
    </div>
  );
}
