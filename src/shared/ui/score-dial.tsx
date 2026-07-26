/**
 * Anillo de score de la consola del closer (capa shared).
 *
 * Dos variantes: `light` en las filas del dashboard (F3) y `dark` en la
 * cabecera de la ficha de llamada (F4). Vive en `shared/ui` porque las dos
 * features lo necesitan y F4 no puede importar internals de F3.
 *
 * NOTA sobre el `style` inline: el barrido del anillo es un `conic-gradient`
 * cuyo angulo depende del dato, y Tailwind no puede generar una clase para un
 * valor que solo existe en runtime. Los COLORES siguen saliendo de tokens
 * (`var(color-console-*)`), asi que no hay ni un hex suelto.
 *
 * No es el `ScoreGauge` del flujo del cliente: ese usa los tokens semanticos
 * (verde de marca, reactivos al tema) y este el registro fijo de la consola.
 */

import type { CSSProperties, ReactElement } from 'react';
import { cn } from '../lib/cn';

export type ScoreDialTone = 'light' | 'dark';

export interface ScoreDialProps {
  /** 0-100. */
  score: number;
  tone?: ScoreDialTone;
  className?: string;
}

/**
 * El color del anillo codifica prioridad comercial: verde = cierre probable,
 * amarillo = trabajable, ambar = necesita argumento. Mismos cortes que usa el
 * backend para ordenar la cola, para que la UI no invente su propia escala.
 */
function ringColor(score: number): string {
  if (score >= 85) return 'var(--color-console-green)';
  if (score >= 70) return 'var(--color-console-signal)';
  return 'var(--color-console-signal-dim)';
}

const GEOMETRIA: Record<ScoreDialTone, { outer: string; inner: string; valor: string }> = {
  light: { outer: 'size-[66px]', inner: 'size-[52px]', valor: 'text-[19px]' },
  dark: { outer: 'size-[84px]', inner: 'size-[68px]', valor: 'text-[24px]' },
};

export function ScoreDial({ score, tone = 'light', className }: ScoreDialProps): ReactElement {
  const acotado = Math.max(0, Math.min(100, Math.round(score)));
  const grados = acotado * 3.6;

  const relleno = tone === 'dark' ? 'var(--color-console-signal)' : ringColor(acotado);
  const pista = tone === 'dark' ? 'var(--color-console-body)' : 'var(--color-console-track)';

  const anillo: CSSProperties = {
    background: `conic-gradient(${relleno} 0deg ${String(grados)}deg, ${pista} ${String(grados)}deg 360deg)`,
  };

  const geo = GEOMETRIA[tone];

  return (
    <div
      className={cn('flex flex-none items-center justify-center rounded-full', geo.outer, className)}
      style={anillo}
      // El score se anuncia como medida, no como decoracion.
      role="img"
      aria-label={`Score ${String(acotado)} de 100`}
    >
      <div
        className={cn(
          'flex flex-col items-center justify-center rounded-full',
          geo.inner,
          tone === 'dark' ? 'bg-console-ink' : 'bg-console-surface',
        )}
      >
        <span
          className={cn(
            'font-bold leading-none tracking-[-0.02em]',
            geo.valor,
            tone === 'dark' ? 'text-console-signal' : 'text-console-ink',
          )}
        >
          {acotado}
        </span>
        <span className="font-mono text-[9px] tracking-[0.06em] text-console-mute">
          {tone === 'dark' ? 'SCORE' : '/100'}
        </span>
      </div>
    </div>
  );
}
