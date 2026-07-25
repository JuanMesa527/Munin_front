/**
 * "Tu nivel actual" (capa ui, F2.2). Tarjeta blanca del mock con nivel,
 * mensaje y enlace a logros.
 */

import { ArrowRight, Trophy } from 'lucide-react';
import type { ReactElement } from 'react';
import type { Badge as BadgeType } from '@contracts';
import { Card } from '@shared/ui';
import { iconoDeBadge } from '../model/badge-icons';

export interface NivelCardProps {
  progreso: number;
  badges: readonly BadgeType[];
}

type Nivel = 'Principiante' | 'Intermedio' | 'Avanzado';

function nivelDe(progreso: number): Nivel {
  if (progreso >= 0.66) return 'Avanzado';
  if (progreso >= 0.33) return 'Intermedio';
  return 'Principiante';
}

function mensajeDe(nivel: Nivel): string {
  if (nivel === 'Avanzado') return 'Estás muy cerca. ¡Un último empujón!';
  if (nivel === 'Intermedio') return 'Sigue así, vas por buen camino.';
  return 'Cada lección suma. ¡Tú puedes!';
}

export function NivelCard({ progreso, badges }: NivelCardProps): ReactElement {
  const nivel = nivelDe(progreso);
  const desbloqueados = badges.filter((badge) => badge.desbloqueadoEn !== null).length;

  return (
    <Card id="logros" className="flex h-full min-h-[14rem] flex-col justify-between shadow-card">
      <div>
        <p className="text-sm font-semibold text-text-muted">Tu nivel actual</p>
        <p className="mt-3 font-display text-3xl font-bold text-accent-700">
          {nivel}
        </p>
        <p className="mt-2 text-sm text-text-muted">{mensajeDe(nivel)}</p>
      </div>

      <div className="mt-6 flex items-center justify-between gap-3 border-t border-border pt-4">
        <div className="flex items-center gap-1.5">
          {badges.length > 0 ? (
            badges.map((badge) => {
              const desbloqueado = badge.desbloqueadoEn !== null;
              const Icono = iconoDeBadge(badge.icono);
              return (
                <span
                  key={badge.id}
                  title={desbloqueado ? badge.nombre : `${badge.nombre} (bloqueado)`}
                  className="inline-flex"
                  style={{
                    opacity: desbloqueado ? 1 : 0.3,
                    filter: desbloqueado ? 'none' : 'grayscale(1)',
                  }}
                >
                  <Icono aria-hidden="true" className="size-5 text-brand-700" />
                </span>
              );
            })
          ) : (
            <Trophy aria-hidden="true" className="size-5 text-brand-700" />
          )}
          <span className="text-xs text-text-subtle">{desbloqueados} logros</span>
        </div>

        <a
          href="#logros"
          className="focus-ring inline-flex items-center gap-1 text-sm font-semibold text-accent-700 hover:underline"
        >
          Ver mis logros
          <ArrowRight aria-hidden="true" className="size-4" />
        </a>
      </div>
    </Card>
  );
}
