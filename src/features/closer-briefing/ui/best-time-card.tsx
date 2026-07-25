/**
 * "Mejor momento para llamar" (F4).
 *
 * El histograma sale de cuando el lead respondio de verdad en el chat, no de una
 * preferencia declarada. Por eso el subtitulo explica el POR QUE: un dato sin su
 * razon no cambia la conducta del comercial.
 */

import type { CSSProperties, ReactElement } from 'react';
import type { ContactabilidadDia, EnrichedLead } from '@contracts';
import { BriefingCard, CardEyebrow } from './briefing-card';

/** Alto maximo de la barra, en px. Igual que en el diseno aprobado. */
const ALTO_MAX = 56;
const ALTO_MIN = 8;

function altoDe(intensidad: number): CSSProperties {
  return { height: `${String(Math.max(ALTO_MIN, Math.round((intensidad / 100) * ALTO_MAX)))}px` };
}

/**
 * La mejor franja se marca en verde y las cercanas en amarillo: el comercial
 * tiene que poder elegir un plan B sin leer numeros.
 */
function colorDe(intensidad: number): string {
  if (intensidad >= 100) return 'bg-console-green';
  if (intensidad > 60) return 'bg-console-signal';
  return 'bg-console-track';
}

export interface BestTimeCardProps {
  lead: EnrichedLead;
}

export function BestTimeCard({ lead }: BestTimeCardProps): ReactElement {
  const semana: readonly ContactabilidadDia[] = lead.contactabilidad;

  return (
    <BriefingCard>
      <CardEyebrow className="mb-3.5">Mejor momento para llamar</CardEyebrow>

      <div className="mb-4 flex items-center gap-3">
        <span
          aria-hidden="true"
          className="flex size-11 items-center justify-center rounded-xl bg-console-green-soft"
        >
          <span className="size-4 rounded-full bg-console-green" />
        </span>
        <div>
          <div className="text-[17px] font-bold text-console-ink">
            {lead.contacto?.mejorHorario ?? 'Sin franja preferida'}
          </div>
          <div className="text-[13px] text-console-mute">{lead.horarioRazon ?? ''}</div>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-[5px]">
        {semana.map((dia) => (
          <div key={dia.dia} className="text-center">
            <div
              className={`mb-1.5 rounded-[5px] ${colorDe(dia.intensidad)}`}
              style={altoDe(dia.intensidad)}
              role="img"
              aria-label={`${dia.dia}: ${String(dia.intensidad)}% de respuesta`}
            />
            <span className="font-mono text-[10px] text-console-mute">{dia.dia}</span>
          </div>
        ))}
      </div>
    </BriefingCard>
  );
}
