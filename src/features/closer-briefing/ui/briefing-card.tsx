/**
 * Envoltorio de tarjeta de la ficha de llamada (F4).
 *
 * La ficha son once bloques con el mismo marco. Centralizarlo evita que once
 * archivos repitan el mismo borde y que uno se desalinee al ajustar el radio.
 */

import type { ReactElement, ReactNode } from 'react';
import { cn } from '@shared/lib/cn';

export interface BriefingCardProps {
  children: ReactNode;
  className?: string;
}

export function BriefingCard({ children, className }: BriefingCardProps): ReactElement {
  return (
    <section
      className={cn(
        'rounded-[20px] border border-console-line bg-console-surface p-6',
        className,
      )}
    >
      {children}
    </section>
  );
}

export interface CardEyebrowProps {
  children: ReactNode;
  /** Sobre fondo oscuro el rotulo va en amarillo de senal, no en gris. */
  tone?: 'muted' | 'signal';
  className?: string;
}

/** Rotulo en mono/versalitas. Es el ritmo tipografico de toda la consola. */
export function CardEyebrow({
  children,
  tone = 'muted',
  className,
}: CardEyebrowProps): ReactElement {
  return (
    <h3
      className={cn(
        'font-mono text-[11px] font-bold tracking-[0.12em] uppercase',
        tone === 'signal' ? 'text-console-signal' : 'text-console-mute',
        className,
      )}
    >
      {children}
    </h3>
  );
}

export interface CardTitleProps {
  children: ReactNode;
  className?: string;
}

export function CardTitle({ children, className }: CardTitleProps): ReactElement {
  return (
    <h3 className={cn('text-[20px] font-bold tracking-[-0.02em] text-console-ink', className)}>
      {children}
    </h3>
  );
}
