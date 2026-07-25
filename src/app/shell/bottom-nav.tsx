/**
 * Navbar inferior de mobile (capa app, shell).
 */

import { motion, useReducedMotion } from 'motion/react';
import type { ReactElement } from 'react';
import { cn } from '@shared/lib/cn';
import type { ClientVista } from './client-vista';
import { NAV_ITEMS } from './nav-items';

export interface BottomNavProps {
  vista: ClientVista;
  onCambiarVista: (vista: ClientVista) => void;
}

export function BottomNav({ vista, onCambiarVista }: BottomNavProps): ReactElement {
  const reducir = useReducedMotion() ?? false;

  return (
    <nav
      aria-label="Navegación principal"
      className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] sm:hidden"
    >
      {NAV_ITEMS.map((item) => {
        const Icono = item.icon;
        const resaltado = item.vista !== null && item.vista === vista;
        const deshabilitado = item.vista === null;

        return (
          <button
            key={item.id}
            type="button"
            disabled={deshabilitado}
            onClick={() => {
              if (item.vista !== null) onCambiarVista(item.vista);
            }}
            aria-current={resaltado ? 'page' : undefined}
            className={cn(
              'focus-ring flex flex-1 flex-col items-center gap-0.5 py-2 text-[0.625rem] font-semibold',
              resaltado ? 'text-accent-700' : 'text-text-subtle',
              deshabilitado && 'opacity-40',
            )}
          >
            <span className="relative flex size-8 items-center justify-center">
              {resaltado && !reducir && (
                <motion.span
                  layoutId="bottom-nav-activo"
                  className="absolute inset-0 rounded-full bg-accent-100"
                  transition={{ type: 'spring', stiffness: 420, damping: 30 }}
                />
              )}
              {resaltado && reducir && (
                <span className="absolute inset-0 rounded-full bg-accent-100" />
              )}
              <Icono
                aria-hidden="true"
                className={cn('relative size-5', resaltado && 'text-accent-700')}
                strokeWidth={resaltado ? 2.4 : 2}
              />
            </span>
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}
