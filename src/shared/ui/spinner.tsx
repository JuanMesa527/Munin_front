/**
 * Spinner de carga (design system, capa shared).
 *
 * Siempre anuncia algo a lectores de pantalla: un indicador puramente visual
 * deja a quien usa lector sin saber que la app esta trabajando.
 */

import type { ReactElement } from 'react';
import { cn } from '../lib/cn';

export type SpinnerSize = 'sm' | 'md' | 'lg';

const TAMANOS: Record<SpinnerSize, string> = {
  sm: 'size-4 border-2',
  md: 'size-6 border-2',
  lg: 'size-9 border-[3px]',
};

export interface SpinnerProps {
  size?: SpinnerSize;
  /** Texto para lector de pantalla. Se oculta visualmente. */
  label?: string | undefined;
  className?: string | undefined;
}

export function Spinner({
  size = 'md',
  label = 'Cargando…',
  className,
}: SpinnerProps): ReactElement {
  return (
    <span role="status" className={cn('inline-flex items-center', className)}>
      <span
        aria-hidden="true"
        className={cn(
          'animate-spin rounded-full border-current border-t-transparent opacity-80',
          TAMANOS[size],
        )}
      />
      <span className="sr-only">{label}</span>
    </span>
  );
}
