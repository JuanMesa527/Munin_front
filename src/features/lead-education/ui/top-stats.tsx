/**
 * Stats superiores de F2.2 (capa ui): XP + chip de identidad con menu de
 * cierre de sesion.
 *
 * El nombre/etiqueta viene del snapshot F1 (ciudad o "Tu camino"). Nunca se
 * inventa una persona ficticia.
 */

import { ChevronDown, LogOut, Star } from 'lucide-react';
import { useEffect, useRef, useState, type ReactElement } from 'react';
import { cn } from '@shared/lib/cn';

export interface TopStatsProps {
  puntosTotales: number;
  /** Etiqueta corta (ciudad o "Tu camino"). */
  etiqueta?: string;
  onLogout: () => void;
}

function formatXp(puntos: number): string {
  return puntos.toLocaleString('es-CO');
}

export function TopStats({
  puntosTotales,
  etiqueta = 'Tu camino',
  onLogout,
}: TopStatsProps): ReactElement {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const contenedorRef = useRef<HTMLDivElement>(null);

  const iniciales = etiqueta
    .split(/[\s,]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase() ?? '')
    .join('');

  // Cerrar con click afuera o Escape, igual que el resto de los menus del design system.
  useEffect(() => {
    if (!menuAbierto) return;

    function alClickFuera(evento: MouseEvent): void {
      if (!contenedorRef.current?.contains(evento.target as Node)) setMenuAbierto(false);
    }
    function alEscape(evento: KeyboardEvent): void {
      if (evento.key === 'Escape') setMenuAbierto(false);
    }

    document.addEventListener('mousedown', alClickFuera);
    document.addEventListener('keydown', alEscape);
    return () => {
      document.removeEventListener('mousedown', alClickFuera);
      document.removeEventListener('keydown', alEscape);
    };
  }, [menuAbierto]);

  return (
    <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
      <span className="inline-flex items-center gap-2 rounded-pill border border-border bg-surface px-3.5 py-2 text-sm font-semibold text-text shadow-card">
        <Star aria-hidden="true" className="size-4 fill-brand text-brand-700" />
        <span className="text-text-muted">XP</span>
        <span className="tabular-nums">{formatXp(puntosTotales)}</span>
      </span>

      <div ref={contenedorRef} className="relative">
        <button
          type="button"
          onClick={() => {
            setMenuAbierto((abierto) => !abierto);
          }}
          aria-expanded={menuAbierto}
          aria-haspopup="menu"
          aria-label={etiqueta}
          className="focus-ring inline-flex items-center gap-2.5 rounded-pill border border-border bg-surface py-1.5 pr-3 pl-1.5 text-left shadow-card"
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
              menuAbierto && 'rotate-180',
            )}
          />
        </button>

        {menuAbierto && (
          <div
            role="menu"
            className="animate-fade-in absolute top-full right-0 z-40 mt-2 w-52 overflow-hidden rounded-card border border-border bg-surface py-2 shadow-pop"
          >
            <p className="px-4 pb-2 text-xs text-text-subtle">Sesión iniciada</p>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setMenuAbierto(false);
                onLogout();
              }}
              className="focus-ring flex w-full items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-danger hover:bg-danger-soft"
            >
              <LogOut aria-hidden="true" className="size-4" />
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
