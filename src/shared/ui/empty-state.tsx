/**
 * Estado vacio (design system, capa shared).
 *
 * Un dashboard vacio sin explicacion se lee como un error. Siempre dice que
 * paso y cual es el siguiente paso posible.
 */

import { Inbox } from 'lucide-react';
import type { ReactElement, ReactNode } from 'react';
import { cn } from '../lib/cn';

export interface EmptyStateProps {
  title: string;
  description?: string | undefined;
  /** Icono decorativo. Si se omite, se usa una bandeja vacia. */
  icon?: ReactNode;
  /** Accion sugerida: normalmente un `<Button>`. */
  action?: ReactNode;
  className?: string | undefined;
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
}: EmptyStateProps): ReactElement {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-card border border-dashed border-border px-6 py-12 text-center',
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="flex size-12 items-center justify-center rounded-full bg-surface-3 text-text-subtle"
      >
        {icon ?? <Inbox className="size-6" />}
      </span>

      <div className="max-w-sm">
        <p className="font-semibold text-text">{title}</p>
        {description !== undefined && (
          <p className="mt-1 text-sm text-text-muted">{description}</p>
        )}
      </div>

      {action}
    </div>
  );
}
