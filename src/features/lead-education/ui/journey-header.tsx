/**
 * "Tu progreso general" (capa ui, F2.2). Tarjeta compacta del mock: barra
 * amarilla + porcentaje grande + mensaje motivacional.
 */

import type { ReactElement } from 'react';
import { Card, ProgressBar } from '@shared/ui';

export interface JourneyHeaderProps {
  progreso: number;
}

function mensajeDe(progreso: number): string {
  if (progreso >= 1) return '¡Completaste tu camino!';
  if (progreso >= 0.5) return '¡Vas muy bien! Sigue así';
  if (progreso > 0) return 'Cada paso cuenta. ¡Sigue así!';
  return 'Este es el comienzo de tu camino.';
}

export function JourneyHeader({ progreso }: JourneyHeaderProps): ReactElement {
  const porcentaje = Math.round(Math.min(Math.max(progreso, 0), 1) * 100);

  return (
    <Card
      id="progreso-general"
      padding="md"
      className="w-full max-w-sm shrink-0 shadow-card sm:min-w-[17rem]"
    >
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <span className="text-sm font-semibold text-text">Tu progreso general</span>
        <span className="font-display text-2xl font-bold tabular-nums text-accent-700">
          {porcentaje}%
        </span>
      </div>
      <ProgressBar value={progreso} max={1} tone="brand" size="lg" ariaLabel="Progreso general" />
      <p className="mt-2.5 text-sm text-text-muted">{mensajeDe(progreso)}</p>
    </Card>
  );
}
