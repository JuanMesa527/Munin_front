/**
 * Tarjeta y sus partes (design system, capa shared).
 *
 * Contenedor por defecto de todo el producto: dashboard, ficha del closer y
 * plan de nutricion. Se parte en subcomponentes para que el espaciado y la
 * jerarquia tipografica sean iguales en las 5 features.
 */

import type { ComponentPropsWithRef, ReactElement } from 'react';
import { cn } from '../lib/cn';

export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

const PADDINGS: Record<CardPadding, string> = {
  none: '',
  sm: 'p-3',
  md: 'p-4 sm:p-5',
  lg: 'p-6 sm:p-8',
};

export interface CardProps extends ComponentPropsWithRef<'div'> {
  padding?: CardPadding;
  /** Resalta al pasar el mouse. Para tarjetas que son un enlace o abren detalle. */
  interactive?: boolean;
  /** Franja de acento a la izquierda, para destacar una tarjeta en una lista. */
  accent?: 'none' | 'brand' | 'accent' | 'success' | 'warning' | 'danger';
}

const ACENTOS: Record<NonNullable<CardProps['accent']>, string> = {
  none: '',
  brand: 'border-l-4 border-l-brand-600',
  accent: 'border-l-4 border-l-accent-500',
  success: 'border-l-4 border-l-success',
  warning: 'border-l-4 border-l-warning',
  danger: 'border-l-4 border-l-danger',
};

export function Card({
  padding = 'md',
  interactive = false,
  accent = 'none',
  className,
  children,
  ...rest
}: CardProps): ReactElement {
  return (
    <div
      className={cn(
        'rounded-card border border-border bg-surface shadow-card',
        PADDINGS[padding],
        ACENTOS[accent],
        interactive &&
          'transition-[border-color,box-shadow] duration-150 hover:border-border-strong hover:shadow-pop',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
  ...rest
}: ComponentPropsWithRef<'div'>): ReactElement {
  return (
    <div className={cn('mb-3 flex items-start justify-between gap-3', className)} {...rest}>
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
  ...rest
}: ComponentPropsWithRef<'h3'>): ReactElement {
  return (
    <h3 className={cn('text-base leading-tight font-semibold text-text', className)} {...rest}>
      {children}
    </h3>
  );
}

export function CardDescription({
  className,
  children,
  ...rest
}: ComponentPropsWithRef<'p'>): ReactElement {
  return (
    <p className={cn('mt-1 text-sm text-text-muted', className)} {...rest}>
      {children}
    </p>
  );
}

export function CardContent({
  className,
  children,
  ...rest
}: ComponentPropsWithRef<'div'>): ReactElement {
  return (
    <div className={cn('text-sm text-text', className)} {...rest}>
      {children}
    </div>
  );
}

export function CardFooter({
  className,
  children,
  ...rest
}: ComponentPropsWithRef<'div'>): ReactElement {
  return (
    <div
      className={cn('mt-4 flex items-center gap-2 border-t border-border pt-3', className)}
      {...rest}
    >
      {children}
    </div>
  );
}
