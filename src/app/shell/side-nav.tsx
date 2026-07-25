/**
 * Sidebar de escritorio (capa app, shell).
 */

import { Home } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import type { ReactElement } from 'react';
import { cn } from '@shared/lib/cn';
import type { ClientVista } from './client-vista';
import { NAV_ITEMS } from './nav-items';

export interface SideNavProps {
  vista: ClientVista;
  onCambiarVista: (vista: ClientVista) => void;
}

export function SideNav({ vista, onCambiarVista }: SideNavProps): ReactElement {
  const reducir = useReducedMotion() ?? false;

  return (
    <aside className="sticky top-0 hidden h-dvh w-[13.5rem] shrink-0 flex-col border-r border-border bg-surface px-3 py-5 sm:flex">
      <motion.div
        className="mb-8 px-2"
        initial={reducir ? false : { opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28 }}
      >
        <img
          src="/colsubsidio-logo.png"
          alt="Colsubsidio"
          className="h-8 w-auto max-w-full object-contain object-left"
          width={168}
          height={32}
        />
      </motion.div>

      <nav aria-label="Navegación principal" className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map((item, indice) => {
          const Icono = item.icon;
          const resaltado = item.vista !== null && item.vista === vista;
          const deshabilitado = item.vista === null;

          return (
            <motion.button
              key={item.id}
              type="button"
              disabled={deshabilitado}
              title={deshabilitado ? `${item.label} (próximamente)` : undefined}
              onClick={() => {
                if (item.vista !== null) onCambiarVista(item.vista);
              }}
              aria-current={resaltado ? 'page' : undefined}
              initial={reducir ? false : { opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.24, delay: 0.04 + indice * 0.04 }}
              {...(!deshabilitado && !reducir ? { whileTap: { scale: 0.98 } } : {})}
              className={cn(
                'focus-ring flex items-center gap-3 rounded-field px-3 py-2.5 text-sm font-semibold transition-colors',
                resaltado
                  ? 'bg-accent-50 text-accent-700'
                  : 'text-text-muted hover:bg-surface-3 hover:text-text',
                deshabilitado && 'cursor-not-allowed opacity-45',
              )}
            >
              <Icono
                aria-hidden="true"
                className="size-[1.125rem] shrink-0"
                strokeWidth={resaltado ? 2.4 : 2}
              />
              {item.label}
            </motion.button>
          );
        })}
      </nav>

      <motion.div
        className="mt-auto rounded-card bg-brand p-3 shadow-sm"
        initial={reducir ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.28 }}
      >
        <div className="flex items-center gap-2">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-ink/10 text-ink">
            <Home aria-hidden="true" className="size-5" />
          </span>
          <p className="text-xs leading-snug font-bold text-ink">Tu hogar te espera</p>
        </div>
      </motion.div>
    </aside>
  );
}
