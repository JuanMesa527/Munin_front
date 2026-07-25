/**
 * Panel de contexto del prospecto, visible DURANTE la llamada simulada (F5).
 *
 * Es la ficha F4 comprimida a una columna que se lee de reojo mientras se
 * habla: quien es, cuanto puede pagar, que proyecto ofrecerle, con que frase
 * abrir y como responder la objecion que va a llegar. Sin esto el entrenador
 * evalua memoria, no tecnica de cierre.
 *
 * REGLA DE PRIORIDAD: lo accionable arriba (alertas → talking points →
 * objeciones), lo descriptivo abajo. En una llamada nadie hace scroll a buscar
 * la respuesta a una objecion que ya le dijeron.
 *
 * SIN PII AMPLIADA: se muestra exactamente lo que ya trae el `BriefingSheet`
 * (nombre de pila, telefono enmascarado). El panel no revela contacto — eso
 * sigue siendo de `revealContact` en F4, y en una simulacion no aplica.
 */

import { useState, type ReactElement, type ReactNode } from 'react';
import type { BriefingSheet } from '@contracts';
import { cn } from '@shared/lib/cn';
import { describeLead, describeSegmento } from '@shared/lib/describe-lead';
import { formatCOP, formatCOPCompact, SIN_DATO } from '@shared/lib/format-money';

export interface CallContextPanelProps {
  briefing: BriefingSheet;
}

/** Cuantos proyectos caben sin que el panel deje de ser escaneable. */
const MAX_PROYECTOS = 3;
const MAX_TALKING_POINTS = 4;

function Seccion({ titulo, children }: { titulo: string; children: ReactNode }): ReactElement {
  return (
    <section className="border-t border-console-line px-4 py-3.5 first:border-t-0">
      <h3 className="mb-2.5 font-mono text-[10px] font-bold tracking-[0.14em] text-console-mute uppercase">
        {titulo}
      </h3>
      {children}
    </section>
  );
}

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string }): ReactElement {
  return (
    <div className="flex items-baseline justify-between gap-3 py-[3px]">
      <span className="text-[12px] text-console-mute">{etiqueta}</span>
      <span className="text-right text-[13px] font-bold text-console-ink tabular-nums">
        {valor}
      </span>
    </div>
  );
}

export function CallContextPanel({ briefing }: CallContextPanelProps): ReactElement {
  const { lead } = briefing;
  const score = lead.score?.valor ?? 0;
  const [objecionAbierta, setObjecionAbierta] = useState<number | null>(0);

  const talkingPoints = [...briefing.talkingPoints]
    .sort((a, b) => a.prioridad - b.prioridad)
    .slice(0, MAX_TALKING_POINTS);

  const proyectos = [...lead.proyectos]
    .sort((a, b) => b.similitud - a.similitud)
    .slice(0, MAX_PROYECTOS);

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-console-paper">
      {/* Identidad: lo primero que hay que tener en la boca, no en la pantalla. */}
      <div className="border-b border-console-line bg-console-surface px-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-[17px] leading-tight font-bold text-console-ink">
              {lead.identidad?.nombre ?? 'Lead sin nombre'}
            </p>
            <p className="mt-1 text-[12px] text-console-body">{describeLead(lead) || SIN_DATO}</p>
          </div>
          <div className="flex size-11 shrink-0 flex-col items-center justify-center rounded-full border-2 border-console-signal bg-console-signal-soft">
            <span className="text-[15px] leading-none font-bold text-console-signal-text tabular-nums">
              {score}
            </span>
          </div>
        </div>

        <p className="mt-2.5 text-[12px] leading-snug text-console-body">
          {describeSegmento({
            esAfiliado: lead.esAfiliado ?? false,
            segmento: lead.segmento,
            rangoSalarial: lead.rangoSalarial,
          })}
        </p>

        {briefing.resumenScore.length > 0 && (
          <p className="mt-2 border-l-2 border-console-signal pl-2.5 text-[12px] leading-snug text-console-body">
            {briefing.resumenScore}
          </p>
        )}
      </div>

      {briefing.alertas.length > 0 && (
        <Seccion titulo="Alertas">
          <ul className="flex flex-col gap-1.5">
            {briefing.alertas.map((alerta) => (
              <li
                key={alerta}
                className="rounded-lg border border-console-red/40 bg-console-red-soft px-2.5 py-1.5 text-[12px] leading-snug text-console-ink"
              >
                {alerta}
              </li>
            ))}
          </ul>
        </Seccion>
      )}

      {talkingPoints.length > 0 && (
        <Seccion titulo="Por dónde atacar">
          <ul className="flex flex-col gap-2.5">
            {talkingPoints.map((punto) => (
              <li key={punto.titulo}>
                <p className="text-[12.5px] font-bold text-console-ink">{punto.titulo}</p>
                <p className="mt-0.5 text-[12px] leading-snug text-console-body">{punto.detalle}</p>
              </li>
            ))}
          </ul>
        </Seccion>
      )}

      {briefing.objeciones.length > 0 && (
        <Seccion titulo="Si te dice…">
          <ul className="flex flex-col gap-1.5">
            {briefing.objeciones.map((objecion, indice) => {
              const abierta = objecionAbierta === indice;
              return (
                <li key={objecion.pregunta}>
                  <button
                    type="button"
                    aria-expanded={abierta}
                    onClick={() => {
                      setObjecionAbierta(abierta ? null : indice);
                    }}
                    className={cn(
                      'focus-ring flex w-full items-start gap-2 rounded-lg px-2.5 py-2 text-left transition-colors',
                      abierta ? 'bg-console-signal-soft' : 'hover:bg-console-track',
                    )}
                  >
                    <span aria-hidden="true" className="mt-px text-[11px] text-console-signal-text">
                      {abierta ? '▾' : '▸'}
                    </span>
                    <span className="text-[12.5px] leading-snug text-console-ink italic">
                      «{objecion.pregunta}»
                    </span>
                  </button>
                  {abierta && (
                    <p className="mt-1 ml-[26px] border-l-2 border-console-signal pl-2.5 text-[12px] leading-snug text-console-body">
                      {objecion.respuesta}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        </Seccion>
      )}

      <Seccion titulo="Capacidad">
        <Dato etiqueta="Cuota sostenible" valor={formatCOP(lead.capacidad?.cuotaMensualEstimada)} />
        <Dato
          etiqueta="Techo de vivienda"
          valor={formatCOPCompact(lead.capacidad?.precioMaximoEstimado)}
        />
        <Dato etiqueta="Ahorro declarado" valor={formatCOPCompact(lead.ahorroDeclarado)} />
        <Dato etiqueta="Subsidio estimado" valor={formatCOPCompact(lead.subsidioEstimado)} />
        <p className="mt-2 text-[11px] leading-snug text-console-mute">
          Estimado sin bureau. No prometas aprobación de crédito ni de subsidio.
        </p>
      </Seccion>

      {proyectos.length > 0 && (
        <Seccion titulo="Qué ofrecerle">
          <ul className="flex flex-col gap-2">
            {proyectos.map((proyecto) => (
              <li
                key={proyecto.proyectoId}
                className="rounded-lg border border-console-line bg-console-surface px-2.5 py-2"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-[12.5px] font-bold text-console-ink">
                    {proyecto.nombre}
                  </span>
                  <span className="font-mono text-[11px] text-console-signal-text tabular-nums">
                    {formatCOPCompact(proyecto.precioDesde)}
                  </span>
                </div>
                <p className="text-[11px] text-console-mute">
                  {proyecto.tipologia} · {proyecto.etapa}
                </p>
                <p className="mt-1 text-[11.5px] leading-snug text-console-body">
                  {proyecto.razon}
                </p>
              </li>
            ))}
          </ul>
        </Seccion>
      )}

      {(lead.citaTextual !== null || lead.motivacion !== null) && (
        <Seccion titulo="Sus palabras">
          {lead.citaTextual !== null && (
            <p className="text-[12.5px] leading-snug text-console-ink italic">
              «{lead.citaTextual}»
            </p>
          )}
          {lead.motivacion !== null && (
            <p className="mt-1.5 text-[12px] leading-snug text-console-body">
              Motivación: {lead.motivacion}
            </p>
          )}
        </Seccion>
      )}

      <Seccion titulo="Contexto">
        <Dato etiqueta="Hogar" valor={lead.hogar ?? SIN_DATO} />
        <Dato etiqueta="Zona preferida" valor={lead.zonaPreferida ?? SIN_DATO} />
        <Dato etiqueta="Timing de compra" valor={lead.timingCompra ?? SIN_DATO} />
        <Dato etiqueta="Intención" valor={`${String(lead.intentScore)}/100`} />
        {lead.intereses.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {lead.intereses.map((interes) => (
              <span
                key={interes}
                className="rounded-pill border border-console-edge px-2 py-0.5 text-[11px] text-console-body"
              >
                {interes}
              </span>
            ))}
          </div>
        )}
      </Seccion>
    </div>
  );
}
