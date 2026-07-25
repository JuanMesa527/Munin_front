/**
 * "Proyectos afines" (F4).
 *
 * Cada match viene con su razon en lenguaje natural para que el comercial la lea
 * TAL CUAL en la llamada. Esa razon sale del matching contra el buyer persona
 * real del proyecto: el LLM puede redactarla, pero el orden y la seleccion los
 * decide el motor (regla 20).
 */

import type { ReactElement } from 'react';
import type { ProjectMatch } from '@contracts';
import { cn } from '@shared/lib/cn';
import { formatCOP } from '@shared/lib/format-money';
import { BriefingCard, CardTitle } from './briefing-card';

interface MatchCardProps {
  proyecto: ProjectMatch;
  /** El mejor match se resalta: es el que se menciona primero. */
  destacado: boolean;
}

function MatchCard({ proyecto, destacado }: MatchCardProps): ReactElement {
  return (
    <li
      className={cn(
        'grid grid-cols-[1fr_auto] items-center gap-4 rounded-2xl border border-console-line px-5 py-[18px]',
        destacado ? 'bg-console-signal-soft' : 'bg-console-surface',
      )}
    >
      <div className="min-w-0">
        <div className="mb-1.5 flex flex-wrap items-center gap-2.5">
          <span className="text-[17px] font-bold text-console-ink">{proyecto.nombre}</span>
          <span className="rounded-full bg-console-track px-[9px] py-1 font-mono text-[10px] font-bold text-console-body">
            {proyecto.etapa}
          </span>
        </div>
        <p className="mb-2 text-[14px] leading-[1.5] text-console-body">{proyecto.razon}</p>
        <span className="font-mono text-[12px] text-console-mute">
          DESDE {formatCOP(proyecto.precioDesde)} · {proyecto.tipologia}
        </span>
      </div>

      <div className="text-center">
        <div className="text-[28px] leading-none font-bold tracking-[-0.02em] tabular-nums text-console-ink">
          {Math.round(proyecto.similitud * 100)}%
        </div>
        <div className="mt-1 font-mono text-[10px] tracking-[0.1em] text-console-mute">
          AFINIDAD
        </div>
      </div>
    </li>
  );
}

export interface ProjectMatchesProps {
  proyectos: readonly ProjectMatch[];
}

export function ProjectMatches({ proyectos }: ProjectMatchesProps): ReactElement {
  return (
    <BriefingCard className="p-[26px]">
      <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-3">
        <CardTitle>Proyectos afines</CardTitle>
        <span className="font-mono text-[11px] text-console-mute">ORDENADOS POR AFINIDAD</span>
      </div>
      <p className="mb-5 text-[14px] text-console-body">
        Cada match trae su razón: úsala tal cual en la llamada.
      </p>

      {proyectos.length === 0 ? (
        <p className="text-[14px] text-console-mute">
          Todavía no hay proyectos afines para este perfil.
        </p>
      ) : (
        <ul className="flex list-none flex-col gap-3.5">
          {proyectos.map((proyecto, i) => (
            <MatchCard key={proyecto.proyectoId} proyecto={proyecto} destacado={i === 0} />
          ))}
        </ul>
      )}
    </BriefingCard>
  );
}
