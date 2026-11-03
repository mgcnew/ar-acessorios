import type { CSSProperties, ReactNode } from 'react';
import { MinusIcon, PlusIcon } from './Icons';

/** Marcador do logo até a arte original da marca ser entregue. */
export function LogoMark({ logoUrl }: { logoUrl?: string }) {
  if (logoUrl) return <img className="logo-img" src={logoUrl} alt="AR Acessórios" />;
  return (
    <span className="logo-ph">
      <span>Logo original</span>
      <span>AR Acessórios</span>
    </span>
  );
}

export function SectionHead({ eyebrow, title, id, action }: { eyebrow: string; title: string; id: string; action?: ReactNode }) {
  return (
    <div className="sec-h">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h2 id={id}>{title}</h2>
      </div>
      {action}
    </div>
  );
}

export function PageHead({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <div className="page-h">
      <span className="eyebrow">{eyebrow}</span>
      <h1>{title}</h1>
      {children}
    </div>
  );
}

export function EmptyState({ icon, title, text, action, style }: { icon?: ReactNode; title: string; text: string; action: ReactNode; style?: CSSProperties }) {
  return (
    <div className="empty" style={style}>
      {icon}
      <h2>{title}</h2>
      <p>{text}</p>
      {action}
    </div>
  );
}

export function Stepper({
  value,
  onDec,
  onInc,
  decDisabled,
  incDisabled,
  label,
  live,
}: {
  value: number;
  onDec: () => void;
  onInc: () => void;
  decDisabled?: boolean;
  incDisabled?: boolean;
  label: string;
  live?: boolean;
}) {
  return (
    <div className="stepper" role="group" aria-label={label}>
      <button onClick={onDec} aria-label="Diminuir quantidade" disabled={decDisabled}>
        <MinusIcon />
      </button>
      <span aria-live={live ? 'polite' : undefined}>{value}</span>
      <button onClick={onInc} aria-label="Aumentar quantidade" disabled={incDisabled}>
        <PlusIcon />
      </button>
    </div>
  );
}
