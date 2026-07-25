/**
 * Cabecera de la ficha de llamada (F4).
 *
 * Es lo unico que el comercial mira mientras suena el timbre: quien es, cuanto
 * puntua, si es afiliado, y el CTA para entrenar la llamada. Va en fondo oscuro
 * para separarla del cuerpo de la ficha.
 *
 * F5: "Iniciar llamada" abre el selector de dificultad y despues la sobrecapa
 * de la llamada simulada (`@features/call-simulation`) — un entrenador de
 * cierre por voz contra un lead de IA armado con el perfil real. NO es
 * telefonia real: no se marca ningun numero, `revealContact` sigue intacto.
 */

import { useState, type ReactElement } from 'react';
import { Link } from 'react-router';
import type { BriefingSheet, CallDifficulty } from '@contracts';
import { AffiliationBadge, NurturedBadge, ScoreDial } from '@shared/ui';
import { describeLead } from '@shared/lib/describe-lead';
import { CallOverlay, DifficultyPicker } from '@features/call-simulation';

export interface BriefingHeaderProps {
  briefing: BriefingSheet;
}

export function BriefingHeader({ briefing }: BriefingHeaderProps): ReactElement {
  const { lead } = briefing;
  const score = lead.score?.valor ?? 0;

  const [pickerAbierto, setPickerAbierto] = useState(false);
  const [dificultadActiva, setDificultadActiva] = useState<CallDifficulty | null>(null);

  function elegirDificultad(dificultad: CallDifficulty): void {
    setPickerAbierto(false);
    setDificultadActiva(dificultad);
  }

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
                Ficha para la llamada
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
                Entrenador de cierre
              </span>
              <span className="text-[13px] text-console-edge">Practica antes de marcar de verdad</span>
            </div>

            <button
              type="button"
              onClick={() => {
                setPickerAbierto(true);
              }}
              className="focus-ring cursor-pointer rounded-full bg-console-signal px-[26px] py-[14px] text-[15px] font-bold text-console-ink transition-colors hover:bg-console-signal-dim"
            >
              Iniciar llamada
            </button>
          </div>
        </div>
      </div>

      <DifficultyPicker
        open={pickerAbierto}
        onClose={() => {
          setPickerAbierto(false);
        }}
        onSelect={elegirDificultad}
      />

      {dificultadActiva !== null && (
        <CallOverlay
          briefing={briefing}
          dificultad={dificultadActiva}
          onClose={() => {
            setDificultadActiva(null);
          }}
        />
      )}
    </div>
  );
}
