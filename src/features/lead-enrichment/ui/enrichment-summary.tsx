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

import { useState, type ReactElement } from 'react';
import type {
  DiaContacto,
  EnrichmentSummary as Resumen,
  FranjaContacto,
  PreferenciaContacto,
} from '@contracts';
import { DIAS_CONTACTO, FRANJAS_CONTACTO } from '@contracts';
import { Button, EmptyState } from '@shared/ui';
import { formatCOPCompact } from '@shared/lib/format-money';

const NOMBRE_DIA: Readonly<Record<DiaContacto, string>> = {
  L: 'Lun',
  M: 'Mar',
  X: 'Mié',
  J: 'Jue',
  V: 'Vie',
  S: 'Sáb',
};

function alternar<T>(lista: readonly T[], valor: T): T[] {
  return lista.includes(valor) ? lista.filter((x) => x !== valor) : [...lista, valor];
}

export interface EnrichmentSummaryProps {
  resumen: Resumen;
  /** Manda la franja elegida. Ausente = la pantalla se muestra en solo lectura. */
  onGuardarHorario?: ((preferencia: PreferenciaContacto) => void) | undefined;
  guardando?: boolean | undefined;
}

export function EnrichmentSummaryView({
  resumen,
  onGuardarHorario,
  guardando = false,
}: EnrichmentSummaryProps): ReactElement {
  const { lead, guardados } = resumen;
  const [dias, setDias] = useState<DiaContacto[]>([]);
  const [franjas, setFranjas] = useState<FranjaContacto[]>([]);
  const yaRespondio = lead.contacto !== null;
  const puedeEnviar = dias.length > 0 && franjas.length > 0 && !guardando;

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
            Un comercial de Colsubsidio se va a contactar contigo pronto, con esta
            información a la mano.
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

      {/* El proximo paso se repite al pie a proposito: la pantalla scrollea, y
          arriba la frase compite con el titulo y con el puntaje. Aqui, donde
          el usuario termina de leer, es donde de verdad se pregunta "¿y ahora
          que?". */}
      <aside className="flex flex-col gap-2 border-t border-border pt-8">
        <p className="label-mono text-text-subtle">Que sigue</p>
        <p className="text-lg font-bold">Un comercial se contactará contigo pronto.</p>
        <p className="max-w-[70ch] text-sm text-text-muted">
          Va a llamarte con lo que guardaste y con lo que dedujimos de ti a la vista, así
          que no tienes que repetir nada. Si algo cambió o no te representa, díselo y lo
          corregimos.
        </p>

        {/* "Pronto" a secas deja al closer adivinando la hora. Preguntarlo aqui
            —donde el usuario ya sabe que le van a llamar— convierte la franja en
            un dato DECLARADO. Sin esta respuesta la ficha dice "Sin franja
            preferida": preferimos el vacio honesto a un horario supuesto. */}
        {yaRespondio ? (
          <p className="mt-4 text-sm font-bold">
            Listo: te llamamos en la franja de {lead.contacto?.mejorHorario}.
          </p>
        ) : (
          <fieldset className="mt-4 flex flex-col gap-4 border-0 p-0">
            <legend className="text-base font-bold">¿Cuándo te queda mejor que te llamemos?</legend>

            <div className="flex flex-col gap-2">
              <span className="label-mono text-text-subtle">Días</span>
              <div className="flex flex-wrap gap-2" role="group" aria-label="Días preferidos">
                {DIAS_CONTACTO.map((dia) => (
                  <button
                    key={dia}
                    type="button"
                    aria-pressed={dias.includes(dia)}
                    onClick={() => {
                      setDias((previos) => alternar(previos, dia));
                    }}
                    className={`border px-3 py-1.5 text-sm font-bold ${
                      dias.includes(dia)
                        ? 'border-accent bg-accent text-white'
                        : 'border-border-strong'
                    }`}
                  >
                    {NOMBRE_DIA[dia]}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="label-mono text-text-subtle">Franja</span>
              <div className="flex flex-wrap gap-2" role="group" aria-label="Franjas preferidas">
                {FRANJAS_CONTACTO.map((franja) => (
                  <button
                    key={franja}
                    type="button"
                    aria-pressed={franjas.includes(franja)}
                    onClick={() => {
                      setFranjas((previas) => alternar(previas, franja));
                    }}
                    className={`border px-3 py-1.5 text-sm font-bold capitalize ${
                      franjas.includes(franja)
                        ? 'border-accent bg-accent text-white'
                        : 'border-border-strong'
                    }`}
                  >
                    {franja}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                type="button"
                disabled={!puedeEnviar}
                onClick={() => {
                  onGuardarHorario?.({ dias, franjas });
                }}
              >
                {guardando ? 'Guardando…' : 'Guardar mi horario'}
              </Button>
              <span className="text-xs text-text-subtle">
                Es opcional: si prefieres, te llamamos cuando podamos.
              </span>
            </div>
          </fieldset>
        )}
      </aside>
    </div>
  );
}
