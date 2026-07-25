/**
 * Barra de progreso (design system, capa shared).
 *
 * La usan el perfilamiento de F1 (`ConversationTurn.progreso`, 0-1) y el
 * journey de F2.2 (`EducationJourney.progreso`, 0-1). Por eso `max` es 1 por
 * defecto: quien tenga porcentajes 0-100 pasa `max={100}`.
 */

import { useId, type ReactElement } from 'react';
import { cn } from '../lib/cn';

export type ProgressTone = 'brand' | 'accent' | 'success';
export type ProgressSize = 'sm' | 'md' | 'lg';

const TONOS: Record<ProgressTone, string> = {
  brand: 'bg-brand-600 dark:bg-brand-400',
  accent: 'bg-accent-500',
  success: 'bg-success',
};

const ALTURAS: Record<ProgressSize, string> = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
};

export interface ProgressBarProps {
  value: number;
  /** Valor que representa el 100%. `1` por defecto (formato del contrato). */
  max?: number;
  /** Etiqueta visible. Si no la hay, se exige `ariaLabel` para no dejar la barra muda. */
  label?: string | undefined;
  ariaLabel?: string | undefined;
  showValue?: boolean;
  tone?: ProgressTone;
  size?: ProgressSize;
  className?: string | undefined;
}

export function ProgressBar({
  value,
  max = 1,
  label,
  ariaLabel,
  showValue = false,
  tone = 'brand',
  size = 'md',
  className,
}: ProgressBarProps): ReactElement {
  const labelId = useId();
  const fraccion = max > 0 ? Math.min(Math.max(value / max, 0), 1) : 0;
  const porcentaje = Math.round(fraccion * 100);

  return (
    <div className={cn('w-full', className)}>
      {(label !== undefined || showValue) && (
        <div className="mb-1.5 flex items-baseline justify-between gap-2">
          {label !== undefined && (
            <span id={labelId} className="text-xs font-medium text-text-muted">
              {label}
            </span>
          )}
          {showValue && (
            <span className="text-xs font-semibold tabular-nums text-text">{porcentaje}%</span>
          )}
        </div>
      )}

      <div
        role="progressbar"
        aria-valuenow={porcentaje}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuetext={`${String(porcentaje)}%`}
        aria-labelledby={label !== undefined ? labelId : undefined}
        aria-label={label === undefined ? (ariaLabel ?? 'Progreso') : undefined}
        className={cn(
          'w-full overflow-hidden rounded-pill bg-surface-3 ring-1 ring-border ring-inset',
          ALTURAS[size],
        )}
      >
        {/* Transicion en CSS a proposito: el bloque de prefers-reduced-motion
            del design system la neutraliza sin logica extra en JS. */}
        <div
          className={cn('h-full rounded-pill transition-[width] duration-500 ease-out', TONOS[tone])}
          style={{ width: `${String(porcentaje)}%` }}
        />
      </div>
    </div>
  );
}
