/**
 * Stats superiores de F2.2 (capa ui): XP + chip de identidad.
 *
 * El nombre/etiqueta viene del snapshot F1 (ciudad o "Tu camino"). Nunca se
 * inventa una persona ficticia.
 */

import { ChevronDown, Star } from 'lucide-react';
import type { ReactElement } from 'react';

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
  const iniciales = etiqueta
    .split(/[\s,]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
      <span className="inline-flex items-center gap-2 rounded-pill border border-border bg-surface px-3.5 py-2 text-sm font-semibold text-text shadow-card">
        <Star aria-hidden="true" className="size-4 fill-brand text-brand-700" />
        <span className="text-text-muted">XP</span>
        <span className="tabular-nums">{formatXp(puntosTotales)}</span>
      </span>

      <span
        className="inline-flex items-center gap-2.5 rounded-pill border border-border bg-surface py-1.5 pr-3 pl-1.5 text-left shadow-card"
        aria-label={etiqueta}
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
        <ChevronDown aria-hidden="true" className="hidden size-4 text-text-subtle sm:block" />
      </span>
    </div>
  );
}
