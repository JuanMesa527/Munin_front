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

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'dark' | 'accent' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

const BASE =
  'focus-ring relative inline-flex select-none items-center justify-center gap-2 rounded-pill ' +
  'font-bold whitespace-nowrap transition-colors duration-150 ' +
  'disabled:pointer-events-none disabled:opacity-55';

const VARIANTES: Record<ButtonVariant, string> = {
  // Amarillo hackaton + tinta, tal cual el boton primario del Design System.
  // El texto SIEMPRE es tinta, nunca blanco: blanco sobre #F2CE1B da ~1.6:1,
  // que no pasa ni de lejos. Tinta sobre amarillo da ~12:1.
  primary: 'bg-brand-500 text-[#0d0d0d] shadow-sm hover:bg-brand-600 active:bg-brand-700',
  secondary:
    'border border-border-strong bg-surface text-text shadow-sm hover:bg-surface-3 ' +
    'active:bg-surface-3',
  ghost: 'bg-transparent text-text-muted hover:bg-surface-3 hover:text-text',
  // El par invertido del DS: fondo tinta con letra amarilla. Es el CTA
  // secundario fuerte, para cuando ya hay un primario amarillo en pantalla.
  dark: 'bg-[#0d0d0d] text-brand-500 shadow-sm hover:bg-[#2a2a24] active:bg-[#3a382f]',
  // Azul Colsubsidio para el carril gamificado (F2.2): separa ese lane del
  // amarillo transaccional sin salirse de la paleta.
  accent: 'bg-accent-600 text-white shadow-sm hover:bg-accent-700 active:bg-accent-800',
  danger: 'bg-danger text-white shadow-sm hover:opacity-90 active:opacity-100',
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
