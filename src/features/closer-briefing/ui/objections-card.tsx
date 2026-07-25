/**
 * "Si te dice esto…" (F4) — objeciones probables y como responderlas.
 *
 * Las respuestas estan escritas con el limite legal incorporado: ninguna promete
 * aprobacion de credito ni asignacion de subsidio, y varias lo dicen
 * explicitamente ("nunca lo presentes como aprobado"). Es el guardarrail donde
 * mas facil se sale un comercial con la venta cerca.
 */

import type { ReactElement } from 'react';
import type { ObjecionSugerida } from '@contracts';
import { BriefingCard, CardTitle } from './briefing-card';

export interface ObjectionsCardProps {
  objeciones: readonly ObjecionSugerida[];
}

export function ObjectionsCard({ objeciones }: ObjectionsCardProps): ReactElement | null {
  if (objeciones.length === 0) return null;

  return (
    <BriefingCard className="p-[26px]">
      <CardTitle className="mb-[18px]">Si te dice esto…</CardTitle>

      <ul className="grid list-none grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-3.5">
        {objeciones.map((objecion) => (
          <li
            key={objecion.pregunta}
            className="rounded-2xl border border-console-line p-[18px]"
          >
            <div className="mb-2.5 flex items-center gap-2">
              <span
                aria-hidden="true"
                className="inline-flex size-[22px] items-center justify-center rounded-md bg-console-red-soft text-[13px] font-extrabold text-console-red-deep"
              >
                !
              </span>
              <span className="text-[15px] font-bold text-console-ink">{objecion.pregunta}</span>
            </div>
            <p className="text-[14px] leading-[1.55] text-console-body">{objecion.respuesta}</p>
          </li>
        ))}
      </ul>
    </BriefingCard>
  );
}
