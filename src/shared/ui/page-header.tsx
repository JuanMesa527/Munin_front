/**
 * Encabezado de pagina (design system, capa shared).
 *
 * Un solo `<h1>` por pantalla vive aqui: eso mantiene la jerarquia de
 * encabezados coherente para lectores de pantalla (WCAG 1.3.1) y evita que
 * cada feature invente su propio titulo.
 */

import type { ReactElement, ReactNode } from 'react';
import { cn } from '../lib/cn';

export interface PageHeaderProps {
  title: string;
  /** Linea corta encima del titulo: contexto o nombre del modulo. */
  eyebrow?: string | undefined;
  description?: string | undefined;
  /** Acciones alineadas a la derecha (botones, filtros). */
  actions?: ReactNode;
  className?: string | undefined;
}

export function PageHeader({
  title,
  eyebrow,
  description,
  actions,
  className,
}: PageHeaderProps): ReactElement {
  return (
    <header
      className={cn(
        'flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-end sm:justify-between',
        className,
      )}
    >
      <div className="min-w-0">
        {eyebrow !== undefined && (
          <p className="text-xs font-semibold tracking-wide text-brand-700 uppercase dark:text-brand-300">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-0.5 text-xl font-semibold text-text sm:text-2xl">{title}</h1>
        {description !== undefined && (
          <p className="mt-1 max-w-2xl text-sm text-text-muted">{description}</p>
        )}
      </div>

      {actions !== undefined && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </header>
  );
}
