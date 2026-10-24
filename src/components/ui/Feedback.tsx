import type { ReactNode } from 'react';

export function Feedback({
  tone = 'info',
  title,
  children,
}: {
  tone?: 'info' | 'success' | 'error' | 'warning';
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className={`feedback feedback-${tone}`} role={tone === 'error' ? 'alert' : 'status'}>
      <strong>{title}</strong>
      {children ? <div className="feedback-body">{children}</div> : null}
    </div>
  );
}
