/**
 * Indicador numerico (design system, capa shared).
 *
 * Es el ladrillo del panel de resumen del closer: total de viables, score
 * promedio, porcentaje de afiliados. Numeros con `tabular-nums` para que las
 * cifras no bailen al actualizarse.
 */

import { Minus, TrendingDown, TrendingUp } from 'lucide-react';
import type { ReactElement, ReactNode } from 'react';
import { cn } from '../lib/cn';

export type StatTrend = 'up' | 'down' | 'flat';

const TENDENCIAS: Record<StatTrend, { readonly icono: ReactElement; readonly clases: string }> = {
  up: { icono: <TrendingUp aria-hidden="true" className="size-3.5" />, clases: 'text-success' },
  down: { icono: <TrendingDown aria-hidden="true" className="size-3.5" />, clases: 'text-danger' },
  flat: { icono: <Minus aria-hidden="true" className="size-3.5" />, clases: 'text-text-muted' },
};

export interface StatProps {
  label: string;
  value: ReactNode;
  /** Contexto corto debajo del numero. */
  hint?: string | undefined;
  /** Icono decorativo a la derecha. */
  icon?: ReactNode;
  trend?: StatTrend | undefined;
  /** Texto de la tendencia, p. ej. "+12% vs. semana pasada". */
  trendLabel?: string | undefined;
  className?: string | undefined;
}

export function Stat({
  label,
  value,
  hint,
  icon,
  trend,
  trendLabel,
  className,
}: StatProps): ReactElement {
  const tendencia = trend === undefined ? null : TENDENCIAS[trend];

  return (
    <div
      className={cn(
        'flex items-start justify-between gap-3 rounded-card border border-border bg-surface p-4',
        className,
      )}
    >
      <div className="min-w-0">
        <p className="text-xs font-medium tracking-wide text-text-muted uppercase">{label}</p>
        <p className="mt-1 text-2xl leading-none font-semibold tabular-nums text-text">{value}</p>

        {tendencia !== null && trendLabel !== undefined && (
          <p className={cn('mt-1.5 flex items-center gap-1 text-xs font-medium', tendencia.clases)}>
            {tendencia.icono}
            {trendLabel}
          </p>
        )}

        {hint !== undefined && <p className="mt-1 text-xs text-text-subtle">{hint}</p>}
      </div>

      {icon !== undefined && (
        <span
          aria-hidden="true"
          className="flex size-9 shrink-0 items-center justify-center rounded-field bg-surface-3 text-text-muted"
        >
          {icon}
        </span>
      )}
    </div>
  );
}
