/**
 * Burbuja de usuario del carril cliente (capa app, shell).
 *
 * Vive en `app/shell` y no dentro de F2.2 porque el shell es de la app: la
 * feature educativa no conoce el sidebar ni la barra inferior. Lo unico que le
 * pide prestado es `logoutLead()`, y por su index publico (regla 4).
 *
 * `LeadSession` solo trae `leadId` y `expiraEn`. No hay nombre real que
 * mostrar, asi que la etiqueta es neutra: inventar un "Hola, Juan" seria
 * mentirle al usuario.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronDown, LogOut, User } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useEffect, useId, useRef, useState, type ReactElement } from 'react';
import { logoutLead } from '@features/lead-education';
import { queryKeys } from '@shared/api/query-keys';
import { cn } from '@shared/lib/cn';

/** Entrada del flujo del cliente (`app/routes/index.tsx`). */
const RUTA_CLIENTE = '/cliente';

export type UserMenuVariant = 'sidebar' | 'flotante';

export interface UserMenuProps {
  /** Etiqueta del disparador. Prop y no fetch: la sesion no trae nombre y no se pide uno nuevo al API. */
  nombre?: string | undefined;
  /** `sidebar` abre hacia arriba (el disparador esta pegado al borde inferior); `flotante` hacia abajo. */
  variant?: UserMenuVariant;
  className?: string | undefined;
}

export function UserMenu({
  nombre = 'Mi cuenta',
  variant = 'sidebar',
  className,
}: UserMenuProps): ReactElement {
  const [abierto, setAbierto] = useState(false);
  const contenedorRef = useRef<HTMLDivElement | null>(null);
  const disparadorRef = useRef<HTMLButtonElement | null>(null);
  const primerItemRef = useRef<HTMLButtonElement | null>(null);
  const menuId = useId();
  const queryClient = useQueryClient();
  const reducir = useReducedMotion() ?? false;

  const cierre = useMutation({
    mutationFn: () => logoutLead(),
    // `onSettled` y no `onSuccess`: si el POST se cae por red, la cookie puede
    // haber muerto igual en el servidor. Dejar al usuario dentro de una sesion
    // que quiso cerrar es peor que sacarlo de mas.
    onSettled: () => {
      // La cookie es httpOnly: el unico que sabe si la sesion sigue viva es el
      // servidor, asi que la copia cacheada se tira en vez de invalidarse (un
      // refetch inmediato solo agrega un 401 en el camino de salida). La
      // navegacion dura ademas es la unica forma de soltar el `leadId` que
      // `client-flow.page` guarda en `useState`, fuera del alcance del cache.
      queryClient.removeQueries({ queryKey: queryKeys.education.session() });
      window.location.assign(RUTA_CLIENTE);
    },
  });

  useEffect(() => {
    if (!abierto) return;

    function alClickAfuera(evento: MouseEvent): void {
      if (contenedorRef.current !== null && !contenedorRef.current.contains(evento.target as Node)) {
        setAbierto(false);
      }
    }

    function alEscape(evento: KeyboardEvent): void {
      if (evento.key !== 'Escape') return;
      setAbierto(false);
      // Sin esto el foco queda huerfano en el <body> y quien navega con teclado
      // vuelve al principio del documento (WCAG 2.4.3).
      disparadorRef.current?.focus();
    }

    document.addEventListener('mousedown', alClickAfuera);
    document.addEventListener('keydown', alEscape);
    return () => {
      document.removeEventListener('mousedown', alClickAfuera);
      document.removeEventListener('keydown', alEscape);
    };
  }, [abierto]);

  useEffect(() => {
    if (abierto) primerItemRef.current?.focus();
  }, [abierto]);

  const esSidebar = variant === 'sidebar';

  return (
    <div ref={contenedorRef} className={cn('relative', esSidebar && 'w-full', className)}>
      <button
        ref={disparadorRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={abierto}
        aria-controls={menuId}
        {...(esSidebar ? {} : { 'aria-label': nombre })}
        onClick={() => {
          setAbierto((previo) => !previo);
        }}
        className={cn(
          'focus-ring flex items-center border border-border bg-surface text-text transition-colors',
          esSidebar
            ? 'w-full gap-2.5 rounded-pill py-1.5 pr-2 pl-1.5 text-left hover:bg-surface-3'
            : 'size-11 justify-center rounded-full shadow-card hover:bg-surface-3',
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            'flex shrink-0 items-center justify-center rounded-full bg-accent-100 text-accent-700',
            esSidebar ? 'size-8' : 'size-7',
          )}
        >
          <User className="size-4" strokeWidth={2.2} />
        </span>

        {esSidebar && (
          <>
            <span className="min-w-0 flex-1 truncate text-sm font-semibold">{nombre}</span>
            <ChevronDown
              aria-hidden="true"
              className={cn(
                'size-4 shrink-0 text-text-subtle transition-transform',
                abierto && 'rotate-180',
              )}
            />
          </>
        )}
      </button>

      <AnimatePresence>
        {abierto && (
          <motion.div
            initial={reducir ? false : { opacity: 0, y: esSidebar ? 6 : -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: esSidebar ? 6 : -6 }}
            transition={{ duration: 0.16 }}
            className={cn(
              'absolute z-50 min-w-[12.5rem] rounded-card border border-border bg-surface p-1.5 shadow-pop',
              esSidebar ? 'bottom-full left-0 mb-2 w-full' : 'top-full right-0 mt-2',
            )}
          >
            <p className="px-2.5 pt-1 pb-2 text-xs font-semibold text-text-subtle">
              Sesión iniciada
            </p>

            <div id={menuId} role="menu" aria-label="Opciones de la cuenta">
              <button
                ref={primerItemRef}
                type="button"
                role="menuitem"
                disabled={cierre.isPending}
                onClick={() => {
                  cierre.mutate();
                }}
                className={cn(
                  'focus-ring flex w-full items-center gap-2.5 rounded-field px-2.5 py-2',
                  'text-left text-sm font-semibold text-text transition-colors',
                  'hover:bg-surface-3 disabled:cursor-progress disabled:opacity-60',
                )}
              >
                <LogOut aria-hidden="true" className="size-4 shrink-0 text-danger" />
                {cierre.isPending ? 'Cerrando sesión…' : 'Cerrar sesión'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
