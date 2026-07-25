/**
 * "Recorrido del lead" (F4).
 *
 * Muestra de donde viene esta persona. Importa por dos razones: si paso por
 * nutricion, el comercial esta hablando con alguien que trabajo meses para poder
 * comprar (y eso cambia el tono), y el hito de consentimiento deja a la vista que
 * hay autorizacion de tratamiento de datos antes de cualquier contacto.
 */

import type { ReactElement } from 'react';
import type { LeadTimelineEvent, TipoHito } from '@contracts';
import { BriefingCard, CardEyebrow } from './briefing-card';

/**
 * El color codifica el tipo de hito: verde el que cierra el embudo, amarillo el
 * carril de nutricion, azul el consentimiento.
 */
const COLOR_HITO: Record<TipoHito, string> = {
  ingreso: 'bg-console-edge',
  consentimiento: 'bg-console-blue',
  perfilamiento: 'bg-console-edge',
  nutricion: 'bg-console-signal',
  viable: 'bg-console-green',
};

export interface LeadJourneyProps {
  timeline: readonly LeadTimelineEvent[];
}

export function LeadJourney({ timeline }: LeadJourneyProps): ReactElement {
  return (
    <BriefingCard>
      <CardEyebrow className="mb-3.5">Recorrido del lead</CardEyebrow>

      <ol className="flex list-none flex-col">
        {timeline.map((evento, i) => {
          const ultimo = i === timeline.length - 1;
          return (
            <li key={`${evento.hito}-${evento.label}`} className="grid grid-cols-[22px_1fr] gap-3">
              <div className="flex flex-col items-center">
                <span
                  aria-hidden="true"
                  className={`mt-1 size-3 rounded-full ${COLOR_HITO[evento.hito]}`}
                />
                {!ultimo && <span aria-hidden="true" className="w-0.5 flex-1 bg-console-track" />}
              </div>
              <div className={ultimo ? '' : 'pb-[18px]'}>
                <div className="text-[14px] font-bold text-console-ink">{evento.label}</div>
                <div className="mt-[3px] font-mono text-[11px] text-console-mute">
                  {evento.fecha}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </BriefingCard>
  );
}
