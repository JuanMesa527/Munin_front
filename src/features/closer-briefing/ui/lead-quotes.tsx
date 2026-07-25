/**
 * "Lo que ya nos contó" (F4).
 *
 * Existe para resolver el problema que origina todo el reto: que el comercial no
 * vuelva a preguntar lo que el lead ya respondio en el chat. La cita textual le
 * devuelve al closer las palabras exactas del cliente, que es lo que hace que la
 * llamada no se sienta un formulario.
 */

import type { ReactElement } from 'react';
import { BriefingCard, CardTitle } from './briefing-card';

export interface LeadQuotesProps {
  intereses: readonly string[];
  cita: string | null;
}

export function LeadQuotes({ intereses, cita }: LeadQuotesProps): ReactElement {
  return (
    <BriefingCard className="p-[26px]">
      <CardTitle className="mb-1.5">Lo que ya nos contó</CardTitle>
      <p className="mb-[18px] text-[14px] text-console-body">
        No vuelvas a preguntar esto: el lead ya lo respondió en el chat.
      </p>

      {intereses.length > 0 && (
        <ul className="mb-[22px] flex list-none flex-wrap gap-[9px]">
          {intereses.map((interes) => (
            <li
              key={interes}
              className="rounded-full bg-console-signal-soft px-3.5 py-2 font-mono text-[12px] font-bold text-console-signal-deep"
            >
              {interes}
            </li>
          ))}
        </ul>
      )}

      {cita !== null && cita.length > 0 && (
        <figure className="rounded-r-xl border-l-[3px] border-console-signal bg-console-paper px-[18px] py-4">
          <figcaption className="mb-2 font-mono text-[10px] font-bold tracking-[0.12em] text-console-mute uppercase">
            En sus palabras
          </figcaption>
          <blockquote className="text-[16px] leading-[1.55] text-console-ink italic">
            “{cita}”
          </blockquote>
        </figure>
      )}
    </BriefingCard>
  );
}
