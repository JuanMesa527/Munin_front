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
  /**
   * `primary` = chips rellenos en amarillo de marca (CTA principal cuando hay
   * pocas opciones). `default` = outline.
   */
  emphasis?: 'default' | 'primary';
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
  emphasis = 'default',
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
              'focus-ring inline-flex items-center rounded-pill border px-4 py-2.5 text-sm font-semibold',
              'transition-colors duration-150 disabled:pointer-events-none disabled:opacity-50',
              emphasis === 'primary' && !activo && 'border-brand bg-brand text-text hover:bg-brand-400',
              emphasis === 'primary' && activo && 'border-brand-600 bg-brand-600 text-text',
              emphasis === 'default' &&
                activo &&
                'border-brand bg-brand text-text',
              emphasis === 'default' &&
                !activo &&
                'border-border bg-surface text-text hover:border-brand-300 hover:bg-brand-50',
            )}
          >
            {opcion.label}
          </button>
        );
      })}
    </div>
  );
}
