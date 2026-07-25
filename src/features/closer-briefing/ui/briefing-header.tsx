/**
 * Cabecera de la ficha de llamada (F4).
 *
 * Es lo unico que el comercial mira mientras suena el timbre: quien es, cuanto
 * puntua, si es afiliado, y los controles de la llamada. Va en fondo oscuro para
 * separarla del cuerpo de la ficha y para que el cronometro se lea de reojo.
 *
 * Los controles de llamada son MOCK: no hay telefonia integrada en el alcance.
 */

import type { ReactElement } from 'react';
import { Link } from 'react-router';
import type { EnrichedLead } from '@contracts';
import { AffiliationBadge, NurturedBadge, ScoreDial } from '@shared/ui';
import { describeLead } from '@shared/lib/describe-lead';
import { cn } from '@shared/lib/cn';
import type { CallTimerState } from '../model/use-call-timer';

export interface BriefingHeaderProps {
  lead: EnrichedLead;
  timer: CallTimerState;
}

export function BriefingHeader({ lead, timer }: BriefingHeaderProps): ReactElement {
  const score = lead.score?.valor ?? 0;

  return (
    <div className="bg-console-ink px-4 pt-[26px] pb-[30px] text-console-paper sm:px-8">
      <div className="mx-auto max-w-[1280px]">
        <Link
          to="/closer"
          className="focus-ring mb-[22px] inline-block rounded-full border border-console-body px-[14px] py-2 font-mono text-[11px] font-bold tracking-[0.12em] text-console-edge uppercase transition-colors hover:border-console-signal hover:text-console-signal"
        >
          ← Volver al listado
        </Link>

        <div className="flex flex-wrap items-center justify-between gap-7">
          <div className="flex items-center gap-5">
            <ScoreDial score={score} tone="dark" />

            <div>
              <p className="mb-2 font-mono text-[11px] font-bold tracking-[0.16em] text-console-signal uppercase">
                ▸ F4 · Ficha para la llamada
              </p>
              <h1 className="mb-2.5 text-[clamp(1.75rem,4.5vw,40px)] leading-none font-bold tracking-[-0.03em]">
                {lead.identidad?.nombre ?? 'Lead sin nombre'}
              </h1>
              <div className="flex flex-wrap items-center gap-[9px]">
                <AffiliationBadge esAfiliado={lead.esAfiliado ?? false} tone="dark" />
                {lead.timeline.some((h) => h.hito === 'nutricion') && (
                  <NurturedBadge tone="dark" label="↑ VIENE DE NUTRICIÓN" />
                )}
                <span className="text-[14px] text-console-edge">{describeLead(lead)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-[18px] rounded-[20px] bg-console-ink-2 px-[22px] py-[18px]">
            <div className="flex flex-col gap-[3px]">
              <span className="font-mono text-[10px] tracking-[0.12em] text-console-mute uppercase">
                {timer.activa ? 'En llamada' : 'Llamada no iniciada'}
              </span>
              <span
                aria-live="off"
                className={cn(
                  'font-mono text-[24px] font-bold tabular-nums',
                  timer.activa ? 'text-console-signal' : 'text-console-mute',
                )}
              >
                {timer.tiempo}
              </span>
            </div>

            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={timer.toggle}
                className={cn(
                  'focus-ring cursor-pointer rounded-full px-[26px] py-[14px] text-[15px] font-bold transition-colors',
                  timer.activa
                    ? 'bg-console-red text-white'
                    : 'bg-console-signal text-console-ink',
                )}
              >
                {timer.activa ? 'Colgar' : 'Iniciar llamada'}
              </button>
              <button
                type="button"
                className="focus-ring cursor-pointer rounded-full border-[1.5px] border-console-body px-5 py-[14px] text-[15px] font-bold text-console-edge transition-colors hover:border-console-signal hover:text-console-signal"
              >
                Silenciar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
