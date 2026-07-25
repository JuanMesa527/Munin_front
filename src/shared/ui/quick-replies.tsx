/**
 * Chips de respuesta rapida (design system, capa shared).
 *
 * Regla de UX del reto: el perfilamiento no puede sentirse un interrogatorio.
 * Tocar un chip es mas rapido que escribir y, ademas, entrega el valor ya
 * normalizado al backend (menos texto libre = menos superficie de inyeccion
 * de prompt).
 *
 * ACCESIBILIDAD: son botones reales dentro de un `role="group"` con nombre,
 * asi que el teclado los recorre y el lector anuncia cuantas opciones hay.
 * En modo multi-seleccion se usa `aria-pressed` (toggle), no `aria-checked`.
 */

import type { QuickReply } from '@contracts';
import type { ReactElement } from 'react';
import { cn } from '../lib/cn';

export interface QuickRepliesProps {
  options: readonly QuickReply[];
  onSelect: (value: string) => void;
  /** Valores marcados. Necesario para la multi-seleccion de intereses (F2.1). */
  selected?: readonly string[] | undefined;
  multiSelect?: boolean;
  disabled?: boolean;
  /** Nombre del grupo para el lector de pantalla. */
  label?: string | undefined;
  className?: string | undefined;
}

export function QuickReplies({
  options,
  onSelect,
  selected,
  multiSelect = false,
  disabled = false,
  label = 'Respuestas rápidas',
  className,
}: QuickRepliesProps): ReactElement {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn('flex flex-wrap gap-2', className)}
    >
      {options.map((opcion) => {
        const activo = selected?.includes(opcion.value) ?? false;

        return (
          <button
            key={opcion.value}
            type="button"
            disabled={disabled}
            aria-pressed={multiSelect ? activo : undefined}
            onClick={() => {
              onSelect(opcion.value);
            }}
            className={cn(
              'focus-ring inline-flex items-center rounded-pill border px-3 py-1.5 text-sm font-medium',
              'transition-colors duration-150 disabled:pointer-events-none disabled:opacity-50',
              activo
                ? 'border-brand-600 bg-brand-600 text-white dark:border-brand-400 dark:bg-brand-400 dark:text-brand-950'
                : 'border-brand-200 bg-surface text-brand-800 hover:bg-brand-50 dark:border-brand-800 dark:text-brand-200 dark:hover:bg-brand-950',
            )}
          >
            {opcion.label}
          </button>
        );
      })}
    </div>
  );
}
