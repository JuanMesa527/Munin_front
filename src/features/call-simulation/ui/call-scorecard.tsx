/**
 * Veredicto de la llamada simulada (F5): responde si la ficha de Munin hace
 * facil cerrar. Solo RENDERIZA lo que ya calculo `computeVerdict` en el
 * backend — nunca recalcula `outcome` ni `puntaje` aqui (spec
 * call-simulation-overlay, "Scorecard Never Fabricates Outcome Data Client-Side").
 *
 * DOS NUMEROS QUE NO SON EL MISMO, y esa fue una confusion real: el dial es el
 * PUNTAJE DEL CLOSER (media ponderada de interes 55% + guion 25% + objeciones
 * 20%) y `interesFinal` es el termometro DEL LEAD. Ver un "54" al lado de
 * "interes final de 70/100" sin explicacion parece un bug. Por eso el desglose
 * (`FactorBars`) va inmediatamente debajo del dial y no escondido al final:
 * es la respuesta a la primera pregunta que hace quien lo mira.
 *
 * LIGHT-FIRST: la consola del closer es papel crema con tinta casi negra
 * (`styles/index.css`, "Consola del closer"). El veredicto se lee y se comenta
 * con el jefe; no es la sobrecapa inmersiva de la llamada en vivo.
 */

import type { ReactElement } from 'react';
import { Line, LineChart, ResponsiveContainer, YAxis } from 'recharts';
import type { BriefingSheet, CallHighlight, CallOutcome, CallScorecard } from '@contracts';
import { FactorBars, ScoreDial } from '@shared/ui';
import { cn } from '@shared/lib/cn';

export interface CallScorecardViewProps {
  scorecard: CallScorecard;
  briefing: BriefingSheet;
}

const ETIQUETA_OUTCOME: Record<CallOutcome, string> = {
  agenda_visita: 'Cerró: agendó visita',
  lo_piensa: 'Lo está pensando',
  no_cierra: 'No cerró',
  colgo: 'Colgó antes de empezar',
};

const TONO_OUTCOME: Record<CallOutcome, string> = {
  agenda_visita: 'text-console-green-deep',
  lo_piensa: 'text-console-signal-text',
  no_cierra: 'text-console-red-deep',
  colgo: 'text-console-mute',
};

/**
 * Cada tipo de highlight se lee distinto: un acierto se celebra, un error se
 * corrige y un incumplimiento se ataja. El color y el icono lo dicen antes de
 * que el closer lea el texto.
 */
const ESTILO_HIGHLIGHT: Record<
  CallHighlight['tipo'],
  { etiqueta: string; icono: string; borde: string; fondo: string; texto: string }
> = {
  momento_clave: {
    etiqueta: 'Momento clave',
    icono: '▲',
    borde: 'border-console-green/40',
    fondo: 'bg-console-green-soft',
    texto: 'text-console-green-deep',
  },
  momento_perdido: {
    etiqueta: 'Se estancó',
    icono: '▼',
    borde: 'border-console-line',
    fondo: 'bg-console-track',
    texto: 'text-console-body',
  },
  acierto: {
    etiqueta: 'Lo hiciste bien',
    icono: '✓',
    borde: 'border-console-green/40',
    fondo: 'bg-console-green-soft',
    texto: 'text-console-green-deep',
  },
  error: {
    etiqueta: 'Error costoso',
    icono: '!',
    borde: 'border-console-red/40',
    fondo: 'bg-console-red-soft',
    texto: 'text-console-red-deep',
  },
  objecion_sin_resolver: {
    etiqueta: 'Quedó sin responder',
    icono: '?',
    borde: 'border-console-signal/50',
    fondo: 'bg-console-signal-soft',
    texto: 'text-console-signal-text',
  },
  cumplimiento: {
    etiqueta: 'Cumplimiento',
    icono: '⚑',
    borde: 'border-console-red/40',
    fondo: 'bg-console-red-soft',
    texto: 'text-console-red-deep',
  },
};

interface PuntoCurva {
  turno: number;
  interes: number;
}

function curvaData(curva: readonly number[]): PuntoCurva[] {
  return curva.map((interes, indice) => ({ turno: indice, interes }));
}

const TARJETA = 'rounded-[16px] border border-console-line bg-console-surface p-4';
const ROTULO = 'mb-2 font-mono text-[11px] tracking-[0.1em] text-console-mute uppercase';

function HighlightCard({ highlight }: { highlight: CallHighlight }): ReactElement {
  const estilo = ESTILO_HIGHLIGHT[highlight.tipo];

  return (
    <li className={cn('rounded-[14px] border p-3.5', estilo.borde, estilo.fondo)}>
      <div className="mb-1.5 flex items-center gap-2">
        <span aria-hidden="true" className={cn('text-[12px] font-bold', estilo.texto)}>
          {estilo.icono}
        </span>
        <span
          className={cn(
            'font-mono text-[10px] font-bold tracking-[0.12em] uppercase',
            estilo.texto,
          )}
        >
          {estilo.etiqueta}
        </span>
        {highlight.turno !== null && (
          <span className="font-mono text-[10px] text-console-mute">turno {highlight.turno}</span>
        )}
      </div>

      <p className="text-[14px] font-bold text-console-ink">{highlight.titulo}</p>
      <p className="mt-1 text-[13px] leading-snug text-console-body">{highlight.detalle}</p>

      {/* La cita es lo que hace verificable el hallazgo: el backend ya descarto
          las que el modelo no encontro en la transcripcion real. */}
      {highlight.cita !== null && (
        <p className="mt-2 border-l-2 border-current/30 pl-2.5 text-[13px] leading-snug text-console-body italic">
          «{highlight.cita}»
        </p>
      )}

      {highlight.sugerencia !== null && (
        <p className="mt-2 text-[13px] leading-snug text-console-ink">
          <span className="font-bold">La próxima: </span>
          {highlight.sugerencia}
        </p>
      )}
    </li>
  );
}

export function CallScorecardView({ scorecard, briefing }: CallScorecardViewProps): ReactElement {
  const { talkingPoints } = briefing;
  const { highlights } = scorecard;

  return (
    <div className="h-full overflow-y-auto bg-console-paper">
      <div className="mx-auto flex max-w-[760px] flex-col gap-5 px-5 py-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <ScoreDial score={scorecard.puntaje} />
          <div>
            <p className={cn('text-[22px] font-bold', TONO_OUTCOME[scorecard.outcome])}>
              {ETIQUETA_OUTCOME[scorecard.outcome]}
            </p>
            <p className="mt-1 text-[14px] text-console-body">{scorecard.explicacion}</p>
          </div>
        </div>

        {/* Va ARRIBA a proposito: sin esto el dial y el interes final parecen
            contradecirse. Es lo primero que hay que poder responder. */}
        {scorecard.factores.length > 0 && (
          <section className={TARJETA}>
            <FactorBars factores={scorecard.factores} title="De dónde sale tu puntaje" />
          </section>
        )}

        {highlights !== null && (
          <section className={TARJETA}>
            <p className={ROTULO}>Análisis de la llamada</p>
            <p className="mb-3 text-[14px] leading-snug text-console-ink">{highlights.resumen}</p>

            {highlights.items.length > 0 && (
              <ul className="flex flex-col gap-2.5">
                {highlights.items.map((highlight, indice) => (
                  <HighlightCard
                    key={`${highlight.tipo}-${String(indice)}`}
                    highlight={highlight}
                  />
                ))}
              </ul>
            )}

            <p className="mt-3 font-mono text-[10px] tracking-[0.08em] text-console-mute uppercase">
              Redactado por {highlights.generadoPor}
            </p>
          </section>
        )}

        {scorecard.curvaInteres.length > 1 && (
          <section className={TARJETA}>
            <p className={ROTULO}>Interés durante la llamada</p>
            <div className="h-[80px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={curvaData(scorecard.curvaInteres)}>
                  <YAxis domain={[0, 100]} hide />
                  <Line
                    type="monotone"
                    dataKey="interes"
                    stroke="var(--color-console-signal-text)"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <section className={TARJETA}>
            <p className={ROTULO}>Guion cubierto</p>
            {talkingPoints.length === 0 ? (
              <p className="text-[13px] text-console-mute">Esta ficha no traía guion sugerido.</p>
            ) : (
              <ul className="flex flex-col gap-1.5 text-[13px]">
                {talkingPoints.map((punto, indice) => {
                  const usado = scorecard.talkingPointsUsados.includes(indice);
                  return (
                    <li key={punto.titulo} className="flex items-start gap-2">
                      <span
                        aria-hidden="true"
                        className={usado ? 'text-console-green-deep' : 'text-console-mute'}
                      >
                        {usado ? '✓' : '○'}
                      </span>
                      <span className={usado ? 'text-console-ink' : 'text-console-mute'}>
                        {punto.titulo}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section className={TARJETA}>
            <p className={ROTULO}>Objeciones</p>
            {scorecard.objecionesResueltas.length === 0 &&
            scorecard.objecionesVivas.length === 0 ? (
              <p className="text-[13px] text-console-mute">
                No surgieron objeciones en esta llamada.
              </p>
            ) : (
              <ul className="flex flex-col gap-1.5 text-[13px]">
                {scorecard.objecionesResueltas.map((pregunta) => (
                  <li key={pregunta} className="flex items-start gap-2 text-console-ink">
                    <span aria-hidden="true" className="text-console-green-deep">
                      ✓
                    </span>
                    <span>{pregunta}</span>
                  </li>
                ))}
                {scorecard.objecionesVivas.map((pregunta) => (
                  <li key={pregunta} className="flex items-start gap-2 text-console-red-deep">
                    <span aria-hidden="true">!</span>
                    <span>{pregunta}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {scorecard.alertas.length > 0 && (
          <section className="rounded-[16px] border border-console-red/40 bg-console-red-soft p-4">
            <p className="mb-2 font-mono text-[11px] tracking-[0.1em] text-console-red-deep uppercase">
              Alertas de cumplimiento
            </p>
            <ul className="flex flex-col gap-1.5 text-[13px] text-console-ink">
              {scorecard.alertas.map((alerta) => (
                <li key={alerta}>{alerta}</li>
              ))}
            </ul>
          </section>
        )}

        <p className="text-center font-mono text-[11px] tracking-[0.1em] text-console-mute">
          {scorecard.turnos} turnos · {scorecard.duracionSegundos}s
        </p>
      </div>
    </div>
  );
}
