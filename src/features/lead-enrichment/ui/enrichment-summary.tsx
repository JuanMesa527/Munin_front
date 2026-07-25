/**
 * Cierre de F2.1. Capa: ui.
 *
 * Cumple dos funciones a la vez:
 *  - le devuelve al usuario lo que eligio, para que sienta que el ejercicio
 *    sirvio de algo;
 *  - materializa el derecho de RECTIFICACION del titular (Ley 1581 de 2012):
 *    ve exactamente que inferimos de el y de donde salio.
 *
 * Por eso los intereses se muestran junto a la frase que explica que fueron
 * DEDUCIDOS de sus decisiones. Un dato inferido que se presenta como declarado
 * es un dato que el titular no puede corregir porque ni sabe que existe.
 */

import type { ReactElement } from 'react';
import type { EnrichmentSummary as Resumen } from '@contracts';
import { EmptyState } from '@shared/ui';
import { formatCOPCompact } from '@shared/lib/format-money';

export interface EnrichmentSummaryProps {
  resumen: Resumen;
}

export function EnrichmentSummaryView({ resumen }: EnrichmentSummaryProps): ReactElement {
  const { lead, guardados } = resumen;

  return (
    <div className="flex flex-col gap-12">
      <header className="grid gap-8 lg:grid-cols-[minmax(0,560px)_1fr] lg:gap-20">
        <div className="flex flex-col gap-4">
          <p className="label-mono text-accent">Listo</p>
          <h2 className="text-3xl lg:text-4xl">
            {guardados.length === 0
              ? 'No guardaste ningún proyecto'
              : `Guardaste ${String(guardados.length)} ${guardados.length === 1 ? 'proyecto' : 'proyectos'}`}
          </h2>
          <p className="text-base text-text-muted">
            Un asesor de Colsubsidio va a contactarte con esta información a la mano.
          </p>
        </div>

        {/* Bloque de tinta, como las secciones oscuras del sistema: separa el
            dato duro del cuerpo del texto sin necesidad de una tarjeta mas. */}
        <div className="flex flex-col justify-between gap-6 bg-[#0d0d0d] p-6 text-white sm:flex-row sm:items-end lg:p-8">
          <div>
            <p className="label-mono text-white/60">Intención de compra</p>
            <p className="mt-2 text-5xl leading-none font-bold tabular-nums text-brand-500">
              {lead.intentScore}
            </p>
          </div>
          <p className="max-w-[26ch] text-xs leading-relaxed text-white/70">
            Calculado con tus decisiones — cuántas revisaste, cuántas guardaste y qué tan
            selectivo fuiste. No hay modelo opaco detrás.
          </p>
        </div>
      </header>

      <section className="flex flex-col gap-4 border-t border-border pt-8">
        <h3 className="label-mono text-text-subtle">Lo que deducimos que te importa</h3>
        {lead.intereses.length === 0 ? (
          <p className="text-sm text-text-muted">
            Todavía no hay señal suficiente para deducir intereses.
          </p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {lead.intereses.map((interes) => (
              <li
                key={interes}
                className="border border-border-strong px-3 py-1.5 text-sm font-bold"
              >
                {interes}
              </li>
            ))}
          </ul>
        )}
        <p className="max-w-[70ch] text-xs text-text-subtle">
          Deducido de las zonas sociales de los proyectos que guardaste, no de algo que nos
          hayas declarado. Si algo no te representa, díselo al asesor y lo corregimos.
        </p>
      </section>

      {guardados.length === 0 ? (
        <EmptyState
          title="Ningún proyecto guardado"
          description="Puedes volver a recorrer la lista cuando quieras. También podemos avisarte cuando entren proyectos nuevos."
        />
      ) : (
        <section className="flex flex-col gap-5 border-t border-border pt-8">
          <h3 className="label-mono text-text-subtle">Tus proyectos</h3>
          <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {guardados.map((ficha) => (
              <li key={ficha.proyectoId} className="flex flex-col gap-3">
                <img
                  src={ficha.imagen}
                  alt=""
                  className="aspect-[4/3] w-full rounded-card object-cover"
                />
                <div className="flex flex-col gap-1">
                  <p className="label-mono truncate text-accent">
                    {ficha.ubicacion.toLowerCase() === ficha.ciudad.toLowerCase()
                      ? ficha.ciudad
                      : `${ficha.ubicacion} · ${ficha.ciudad}`}
                  </p>
                  <p className="truncate text-lg font-bold">{ficha.nombre}</p>
                  <p className="text-sm tabular-nums">
                    {ficha.precio.hasta === null
                      ? `desde ${formatCOPCompact(ficha.precio.desde)}`
                      : `${formatCOPCompact(ficha.precio.desde)} – ${formatCOPCompact(ficha.precio.hasta)}`}
                    <span className="label-mono ml-2 text-text-subtle">
                      {ficha.precio.esEstimado ? 'estimado' : 'publicado'}
                    </span>
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
