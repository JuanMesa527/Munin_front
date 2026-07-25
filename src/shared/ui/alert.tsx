/**
 * Alerta en linea (design system, capa shared).
 *
 * `role` cambia con el tono: `alert` interrumpe al lector de pantalla y eso
 * solo se justifica cuando algo salio mal; informacion y exito usan `status`,
 * que espera una pausa natural.
 */

import { CircleAlert, CircleCheck, Info, TriangleAlert } from 'lucide-react';
import type { ReactElement, ReactNode } from 'react';
import { cn } from '../lib/cn';

export type AlertTone = 'info' | 'success' | 'warning' | 'danger';

const CLASE_ICONO = 'mt-0.5 size-4 shrink-0';

interface ToneConfig {
  readonly clases: string;
  readonly icono: ReactElement;
  /** Prefijo textual: el color no puede ser el unico indicador (WCAG 1.4.1). */
  readonly prefijo: string;
}

const TONOS: Record<AlertTone, ToneConfig> = {
  info: {
    clases: 'bg-info-soft text-info border-info-border',
    icono: <Info aria-hidden="true" className={CLASE_ICONO} />,
    prefijo: 'Información',
  },
  success: {
    clases: 'bg-success-soft text-success border-success-border',
    icono: <CircleCheck aria-hidden="true" className={CLASE_ICONO} />,
    prefijo: 'Listo',
  },
  warning: {
    clases: 'bg-warning-soft text-warning border-warning-border',
    icono: <TriangleAlert aria-hidden="true" className={CLASE_ICONO} />,
    prefijo: 'Atención',
  },
  danger: {
    clases: 'bg-danger-soft text-danger border-danger-border',
    icono: <CircleAlert aria-hidden="true" className={CLASE_ICONO} />,
    prefijo: 'Error',
  },
};

export interface AlertProps {
  tone?: AlertTone;
  title?: string | undefined;
  children?: ReactNode;
  className?: string | undefined;
}

export function Alert({ tone = 'info', title, children, className }: AlertProps): ReactElement {
  const { clases, icono, prefijo } = TONOS[tone];
  const esUrgente = tone === 'warning' || tone === 'danger';

  return (
    <div
      role={esUrgente ? 'alert' : 'status'}
      className={cn('flex gap-3 rounded-card border p-3 text-sm', clases, className)}
    >
      {icono}
      <div className="min-w-0">
        <span className="sr-only">{prefijo}: </span>
        {title !== undefined && <p className="font-semibold">{title}</p>}
        {children !== undefined && (
          <div className={cn('text-text', title !== undefined && 'mt-0.5')}>{children}</div>
        )}
      </div>
    </div>
  );
}
