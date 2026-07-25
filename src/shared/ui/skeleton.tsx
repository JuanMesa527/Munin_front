/**
 * Skeleton de carga (design system, capa shared).
 *
 * Reserva el espacio del contenido para que la pantalla no salte cuando
 * llegan los datos. Va `aria-hidden`: para el lector de pantalla el estado de
 * carga lo anuncia el contenedor con `aria-busy`, no una caja gris.
 */

import type { ReactElement } from 'react';
import { cn } from '../lib/cn';

export type SkeletonVariant = 'text' | 'block' | 'circle';

const VARIANTES: Record<SkeletonVariant, string> = {
  text: 'h-3.5 rounded-pill',
  block: 'rounded-card',
  circle: 'rounded-full',
};

export interface SkeletonProps {
  variant?: SkeletonVariant;
  /** Numero de lineas cuando `variant="text"`. La ultima sale mas corta. */
  lines?: number;
  className?: string | undefined;
}

export function Skeleton({ variant = 'block', lines = 1, className }: SkeletonProps): ReactElement {
  if (variant === 'text' && lines > 1) {
    return (
      <div aria-hidden="true" className="flex flex-col gap-2">
        {Array.from({ length: lines }, (_, indice) => (
          <div
            key={indice}
            className={cn(
              'skeleton-sheen',
              VARIANTES.text,
              indice === lines - 1 && 'w-3/5',
              className,
            )}
          />
        ))}
      </div>
    );
  }

  return <div aria-hidden="true" className={cn('skeleton-sheen', VARIANTES[variant], className)} />;
}
