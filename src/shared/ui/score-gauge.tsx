/**
 * Gauge circular del score (design system, capa shared).
 *
 * GLASS-BOX: este componente PINTA un numero que ya vino calculado por una
 * funcion pura del backend (`ScoreResult.valor`). No decide, no clasifica y no
 * sabe de umbrales de negocio: el umbral real vive en
 * `ScoringWeights.umbralViable`. Si quien llama conoce ese umbral, pasa `tone`
 * y el gauge obedece; el mapeo por defecto es SOLO estetico.
 *
 * La animacion usa Motion y se apaga con `useReducedMotion()` (WCAG 2.3.3).
 */

import { motion, useReducedMotion } from 'motion/react';
import type { ReactElement } from 'react';
import { cn } from '../lib/cn';

export type GaugeSize = 'sm' | 'md' | 'lg';
export type GaugeTone = 'brand' | 'success' | 'warning' | 'danger';

const RADIO = 42;
const CIRCUNFERENCIA = 2 * Math.PI * RADIO;

/** Tupla explicita: Motion espera un bezier de 4 numeros, no un `number[]`. */
const EASE_SUAVE: [number, number, number, number] = [0.22, 1, 0.36, 1];

interface EscalaGauge {
  readonly caja: string;
  readonly valor: string;
  readonly grosor: number;
}

const TAMANOS: Record<GaugeSize, EscalaGauge> = {
  sm: { caja: 'size-11', valor: 'text-[0.6875rem]', grosor: 11 },
  md: { caja: 'size-16', valor: 'text-sm', grosor: 9 },
  lg: { caja: 'size-28', valor: 'text-2xl', grosor: 8 },
};

const TONOS: Record<GaugeTone, string> = {
  brand: 'text-brand-600 dark:text-brand-400',
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-danger',
};

/** Mapeo puramente visual: da temperatura al numero, no decide viabilidad. */
function toneVisual(valor: number): GaugeTone {
  if (valor >= 70) return 'success';
  if (valor >= 45) return 'warning';
  return 'danger';
}

export interface ScoreGaugeProps {
  /** 0-100. Viene de `ScoreResult.valor`. */
  value: number;
  size?: GaugeSize;
  tone?: GaugeTone | undefined;
  /** Etiqueta corta bajo el numero (solo en `lg`). */
  label?: string | undefined;
  className?: string | undefined;
}

export function ScoreGauge({
  value,
  size = 'md',
  tone,
  label,
  className,
}: ScoreGaugeProps): ReactElement {
  const reducirMovimiento = useReducedMotion() ?? false;
  const acotado = Math.min(Math.max(Math.round(value), 0), 100);
  const { caja, valor: claseValor, grosor } = TAMANOS[size];
  const offset = CIRCUNFERENCIA * (1 - acotado / 100);

  return (
    <div
      role="img"
      aria-label={`Puntaje ${String(acotado)} de 100`}
      className={cn('relative inline-flex shrink-0 items-center justify-center', caja, className)}
    >
      <svg viewBox="0 0 100 100" className="size-full -rotate-90">
        <circle
          cx="50"
          cy="50"
          r={RADIO}
          fill="none"
          strokeWidth={grosor}
          className="stroke-surface-3"
        />
        <motion.circle
          cx="50"
          cy="50"
          r={RADIO}
          fill="none"
          strokeWidth={grosor}
          strokeLinecap="round"
          strokeDasharray={CIRCUNFERENCIA}
          className={cn('stroke-current', TONOS[tone ?? toneVisual(acotado)])}
          initial={{ strokeDashoffset: CIRCUNFERENCIA }}
          animate={{ strokeDashoffset: offset }}
          transition={reducirMovimiento ? { duration: 0 } : { duration: 0.9, ease: EASE_SUAVE }}
        />
      </svg>

      <div aria-hidden="true" className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn('font-semibold tabular-nums text-text', claseValor)}>{acotado}</span>
        {label !== undefined && size === 'lg' && (
          <span className="text-[0.6875rem] text-text-muted">{label}</span>
        )}
      </div>
    </div>
  );
}
