/**
 * Boton (design system, capa shared).
 *
 * Las variantes son props, no clases sueltas: si cada pantalla inventa su
 * boton, a las 3 de la manana nadie sabe cual es el CTA. Los pares de color
 * estan elegidos para cumplir contraste AA en claro y en oscuro.
 *
 * React 19 pasa `ref` como prop normal, por eso no hace falta `forwardRef`.
 */

import type { ComponentPropsWithRef, ReactElement, ReactNode } from 'react';
import { cn } from '../lib/cn';
import { Spinner } from './spinner';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'accent' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

const BASE =
  'focus-ring relative inline-flex select-none items-center justify-center gap-2 rounded-field ' +
  'font-semibold whitespace-nowrap transition-colors duration-150 ' +
  'disabled:pointer-events-none disabled:opacity-55';

const VARIANTES: Record<ButtonVariant, string> = {
  // Verde institucional. En claro se usa brand-700 (no el 600) porque el texto
  // blanco sobre brand-600 no llega a 4.5:1; en oscuro se invierte el par.
  primary:
    'bg-brand-700 text-white shadow-sm hover:bg-brand-800 active:bg-brand-900 ' +
    'dark:bg-brand-400 dark:text-brand-950 dark:hover:bg-brand-300',
  secondary:
    'border border-border bg-surface text-text shadow-sm hover:bg-surface-3 ' +
    'active:bg-surface-3 dark:border-border-strong',
  ghost: 'bg-transparent text-text-muted hover:bg-surface-3 hover:text-text',
  // CTA del carril gamificado (F2.2): ambar con texto oscuro, AA en los dos temas.
  accent: 'bg-accent-500 text-accent-950 shadow-sm hover:bg-accent-400 active:bg-accent-600',
  // `text-surface` sigue al tema: blanco en claro, oscuro en oscuro.
  danger: 'bg-danger text-surface shadow-sm hover:opacity-90 active:opacity-100',
};

const TAMANOS: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-[0.8125rem]',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
};

const TAMANOS_ICONO: Record<ButtonSize, string> = {
  sm: 'size-8 p-0',
  md: 'size-10 p-0',
  lg: 'size-12 p-0',
};

export interface ButtonProps extends ComponentPropsWithRef<'button'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Bloquea el boton y muestra spinner, manteniendo el ancho para no saltar. */
  loading?: boolean;
  fullWidth?: boolean;
  /** Cuadrado, para acciones de un solo icono. Exige `aria-label`. */
  iconOnly?: boolean;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  iconOnly = false,
  iconLeft,
  iconRight,
  className,
  children,
  disabled,
  // `type="button"` por defecto: el default del HTML es `submit` y ya nos ha
  // costado formularios enviados por accidente.
  type = 'button',
  ...rest
}: ButtonProps): ReactElement {
  return (
    <button
      type={type}
      disabled={disabled === true || loading}
      aria-busy={loading || undefined}
      className={cn(
        BASE,
        VARIANTES[variant],
        iconOnly ? TAMANOS_ICONO[size] : TAMANOS[size],
        fullWidth && 'w-full',
        className,
      )}
      {...rest}
    >
      {loading ? (
        <>
          {/* El contenido se mantiene invisible para que el boton no cambie de
              tamano al entrar en carga. */}
          <span className="invisible flex items-center gap-2">
            {iconLeft}
            {children}
            {iconRight}
          </span>
          <Spinner size={size === 'lg' ? 'md' : 'sm'} className="absolute inset-0 justify-center" />
        </>
      ) : (
        <>
          {iconLeft !== undefined && (
            <span aria-hidden="true" className="inline-flex shrink-0">
              {iconLeft}
            </span>
          )}
          {children}
          {iconRight !== undefined && (
            <span aria-hidden="true" className="inline-flex shrink-0">
              {iconRight}
            </span>
          )}
        </>
      )}
    </button>
  );
}
