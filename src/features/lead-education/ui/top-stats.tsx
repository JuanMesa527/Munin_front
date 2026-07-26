/**
 * Stats superiores de F2.2 (capa ui): XP + chip de identidad con cierre de
 * sesion.
 *
 * El nombre/etiqueta viene del snapshot F1 (ciudad o "Tu camino"). Nunca se
 * inventa una persona ficticia.
 *
 * El cierre de sesion replica a proposito `app/shell/user-menu.tsx` (mismo
 * `logoutLead()`, mismo `onSettled`, misma navegacion dura a `/cliente`): son
 * dos disparadores para la misma accion y no pueden comportarse distinto.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronDown, LogOut, Star } from 'lucide-react';
import { useEffect, useId, useRef, useState, type ReactElement } from 'react';
import { queryKeys } from '@shared/api/query-keys';
import { cn } from '@shared/lib/cn';
import { logoutLead } from '../api/lead-auth';

/** Entrada del flujo del cliente (`app/routes/index.tsx`). */
const RUTA_CLIENTE = '/cliente';

export interface TopStatsProps {
  puntosTotales: number;
  /** Etiqueta corta (ciudad o "Tu camino"). */
  etiqueta?: string;
}

function formatXp(puntos: number): string {
  return puntos.toLocaleString('es-CO');
}

export function TopStats({
  puntosTotales,
  etiqueta = 'Tu camino',
}: TopStatsProps): ReactElement {
  const [abierto, setAbierto] = useState(false);
  const contenedorRef = useRef<HTMLDivElement>(null);
  const disparadorRef = useRef<HTMLButtonElement>(null);
  const primerItemRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();
  const queryClient = useQueryClient();

  const cierre = useMutation({
    mutationFn: () => logoutLead(),
    // `onSettled` y no `onSuccess`: si el POST se cae por red, la cookie puede
    // haber muerto igual en el servidor. Dejar al usuario dentro de una sesion
    // que quiso cerrar es peor que sacarlo de mas.
    onSettled: () => {
      queryClient.removeQueries({ queryKey: queryKeys.education.session() });
      window.location.assign(RUTA_CLIENTE);
    },
  });

  const iniciales = etiqueta
    .split(/[\s,]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase() ?? '')
    .join('');

  useEffect(() => {
    if (!abierto) return;

    function alClickAfuera(evento: MouseEvent): void {
      if (!contenedorRef.current?.contains(evento.target as Node)) setAbierto(false);
    }
    function alEscape(evento: KeyboardEvent): void {
      if (evento.key !== 'Escape') return;
      setAbierto(false);
      // Sin esto el foco queda huerfano en el <body> (WCAG 2.4.3).
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

  return (
    <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
      <span className="inline-flex items-center gap-2 rounded-pill border border-border bg-surface px-3.5 py-2 text-sm font-semibold text-text shadow-card">
        <Star aria-hidden="true" className="size-4 fill-brand text-brand-700" />
        <span className="text-text-muted">XP</span>
        <span className="tabular-nums">{formatXp(puntosTotales)}</span>
      </span>

      <div ref={contenedorRef} className="relative">
        <button
          ref={disparadorRef}
          type="button"
          aria-haspopup="menu"
          aria-expanded={abierto}
          aria-controls={menuId}
          aria-label={etiqueta}
          onClick={() => {
            setAbierto((previo) => !previo);
          }}
          className="focus-ring inline-flex items-center gap-2.5 rounded-pill border border-border bg-surface py-1.5 pr-3 pl-1.5 text-left shadow-card transition-colors hover:bg-surface-3"
        >
          <span
            aria-hidden="true"
            className="flex size-9 items-center justify-center rounded-full bg-accent-100 text-xs font-bold text-accent-700"
          >
            {iniciales || '?'}
          </span>
          <span className="hidden min-w-0 sm:block">
            <span className="block truncate text-sm font-semibold text-text">{etiqueta}</span>
            <span className="block text-[0.6875rem] text-text-subtle">Tu perfil</span>
          </span>
          <ChevronDown
            aria-hidden="true"
            className={cn(
              'hidden size-4 text-text-subtle transition-transform sm:block',
              abierto && 'rotate-180',
            )}
          />
        </button>

        {abierto && (
          <div
            className="animate-fade-in absolute top-full right-0 z-40 mt-2 w-52 rounded-card border border-border bg-surface p-1.5 shadow-pop"
          >
            <p className="px-2.5 pt-1 pb-2 text-xs font-semibold text-text-subtle">Sesión iniciada</p>

            <div id={menuId} role="menu" aria-label="Opciones de la cuenta">
              <button
                ref={primerItemRef}
                type="button"
                role="menuitem"
                disabled={cierre.isPending}
                onClick={() => {
                  cierre.mutate();
                }}
                className="focus-ring flex w-full items-center gap-2.5 rounded-field px-2.5 py-2 text-left text-sm font-semibold text-text transition-colors hover:bg-surface-3 disabled:cursor-progress disabled:opacity-60"
              >
                <LogOut aria-hidden="true" className="size-4 shrink-0 text-danger" />
                {cierre.isPending ? 'Cerrando sesión…' : 'Cerrar sesión'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
