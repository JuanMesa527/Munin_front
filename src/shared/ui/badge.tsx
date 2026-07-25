/**
 * Badge / chip de estado (design system, capa shared).
 *
 * Se usa para senales de un vistazo en el dashboard: "Afiliado", "Viene de
 * nutricion", banda de capacidad. El color NUNCA es el unico portador de la
 * informacion: el texto siempre dice lo mismo que el color (WCAG 1.4.1).
 */

import type { ComponentPropsWithRef, ReactElement, ReactNode } from 'react';
import { cn } from '../lib/cn';

export type BadgeTone =
  | 'neutral'
  | 'brand'
  | 'accent'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info';

export type BadgeSize = 'sm' | 'md';

const TONOS: Record<BadgeTone, string> = {
  neutral: 'bg-surface-3 text-text-muted border-border',
  brand: 'bg-brand-50 text-brand-800 border-brand-200 dark:bg-brand-950 dark:text-brand-200 dark:border-brand-800',
  accent:
    'bg-accent-50 text-accent-900 border-accent-200 dark:bg-accent-950 dark:text-accent-200 dark:border-accent-800',
  success: 'bg-success-soft text-success border-success-border',
  warning: 'bg-warning-soft text-warning border-warning-border',
  danger: 'bg-danger-soft text-danger border-danger-border',
  info: 'bg-info-soft text-info border-info-border',
};

const TAMANOS: Record<BadgeSize, string> = {
  sm: 'h-5 px-2 text-[0.6875rem]',
  md: 'h-6 px-2.5 text-xs',
};

export interface BadgeProps extends ComponentPropsWithRef<'span'> {
  tone?: BadgeTone;
  size?: BadgeSize;
  /** Punto de color al inicio. Decorativo. */
  dot?: boolean;
  icon?: ReactNode;
}

export function Badge({
  tone = 'neutral',
  size = 'md',
  dot = false,
  icon,
  className,
  children,
  ...rest
}: BadgeProps): ReactElement {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-pill border font-medium whitespace-nowrap',
        TONOS[tone],
        TAMANOS[size],
        className,
      )}
      {...rest}
    >
      {dot && <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />}
      {icon !== undefined && (
        <span aria-hidden="true" className="inline-flex shrink-0">
          {icon}
        </span>
      )}
      {children}
    </span>
  );
}
