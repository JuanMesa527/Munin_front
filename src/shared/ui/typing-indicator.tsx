/**
 * Indicador de "escribiendo..." (design system, capa shared).
 *
 * Cubre la latencia del backend/LLM: sin esto, el chat parece congelado. El
 * retardo escalonado de los puntos usa `animate-typing`, que el bloque de
 * `prefers-reduced-motion` del design system neutraliza sin codigo extra.
 *
 * Es un bloque inline (no `<li>`): el caller lo mete en el `<li>` del hilo
 * cuando hace falta (con o sin avatar).
 */

import type { ReactElement } from 'react';
import { cn } from '../lib/cn';

const RETARDOS = ['0ms', '160ms', '320ms'] as const;

export interface TypingIndicatorProps {
  /** Texto para lector de pantalla. Se anuncia como estado, no interrumpe. */
  label?: string | undefined;
  className?: string | undefined;
}

export function TypingIndicator({
  label = 'El asesor está escribiendo',
  className,
}: TypingIndicatorProps): ReactElement {
  return (
    <div
      role="status"
      aria-label={label}
      className={cn(
        'flex items-center gap-1 rounded-bubble rounded-tl-sm bg-surface px-3.5 py-2.5 shadow-bubble',
        className,
      )}
    >
      {RETARDOS.map((retardo) => (
        <span
          key={retardo}
          aria-hidden="true"
          style={{ animationDelay: retardo }}
          className="animate-typing size-2 rounded-full bg-text-subtle"
        />
      ))}
    </div>
  );
}
