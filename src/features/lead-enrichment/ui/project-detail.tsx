/**
 * Detalle de un proyecto. Capa: ui.
 *
 * Es el "¿por que me estan mostrando esto?" completo: tipologias, amenidades,
 * que hay cerca, el desglose glass-box del match y el enlace al brochure
 * original. Nada de lo que se muestra aqui se calcula en el front.
 *
 * Se exporta en dos envoltorios sobre el MISMO contenido:
 *   - `ProjectDetailPanel` — columna fija en escritorio. El detalle esta
 *     siempre a la vista mientras se decide, que es lo que uno quiere en una
 *     pantalla grande: comparar sin abrir y cerrar nada.
 *   - `ProjectDetailModal` — hoja en movil, donde no hay ancho para la columna.
 */

import type { ReactElement, ReactNode } from 'react';
import type { ProjectMatchCard } from '@contracts';
import { FactorBars, Modal } from '@shared/ui';
import { PriceBand } from './price-band';

export interface ProjectDetailProps {
  tarjeta: ProjectMatchCard;
}

function Seccion({ titulo, children }: { titulo: string; children: ReactNode }): ReactElement {
  return (
    <section className="flex flex-col gap-3 border-t border-border pt-5">
      <h4 className="label-mono text-text-subtle">{titulo}</h4>
      {children}
    </section>
  );
}

/** Dato suelto en la retícula de ficha tecnica. */
function Dato({ etiqueta, valor }: { etiqueta: string; valor: ReactNode }): ReactElement {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="label-mono text-text-subtle">{etiqueta}</dt>
      <dd className="text-sm">{valor}</dd>
    </div>
  );
}

export function ProjectDetailContent({ tarjeta }: ProjectDetailProps): ReactElement {
  const { ficha, match, factores } = tarjeta;
  // Ver nota en `project-card`: el sector a veces ES la ciudad.
  const ubicacion =
    ficha.ubicacion.toLowerCase() === ficha.ciudad.toLowerCase()
      ? ficha.ciudad
      : `${ficha.ubicacion} · ${ficha.ciudad}`;

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col gap-3">
        <p className="label-mono text-accent">{ubicacion}</p>
        <h3 className="text-2xl">{ficha.nombre}</h3>
        <p className="text-sm leading-relaxed text-text-muted">{ficha.descripcion}</p>
      </header>

      {/* Bloque de precio sobre banda tenida: es el dato que mas se busca. */}
      <div className="flex flex-wrap items-end justify-between gap-4 rounded-card bg-surface-3 p-4">
        <PriceBand precio={ficha.precio} size="md" />
        <div className="text-right">
          <p className="text-3xl leading-none font-bold tabular-nums">
            {Math.round(match.similitud * 100)}
            <span className="text-lg">%</span>
          </p>
          <p className="label-mono mt-1 text-text-subtle">afinidad</p>
        </div>
      </div>

      {/* GLASS-BOX: el desglose con pesos y aportes (regla 21). */}
      <Seccion titulo="Por que te lo mostramos">
        <p className="text-sm text-text-muted">{match.razon}</p>
        <FactorBars factores={factores} />
      </Seccion>

      <Seccion titulo="Tipologias">
        <table className="w-full text-sm">
          <thead>
            <tr className="label-mono text-left text-text-subtle">
              <th className="pb-2 font-normal">Tipo</th>
              <th className="pb-2 text-right font-normal">Construida</th>
              <th className="pb-2 text-right font-normal">Privada</th>
              <th className="pb-2 text-right font-normal">Hab / Baño</th>
            </tr>
          </thead>
          <tbody>
            {ficha.tipologias.map((tipologia) => (
              <tr key={tipologia.nombre} className="border-t border-border">
                <td className="py-2 font-bold">{tipologia.nombre}</td>
                <td className="py-2 text-right">{tipologia.areaConstruida} m²</td>
                <td className="py-2 text-right text-text-muted">
                  {tipologia.areaPrivada === null ? '—' : `${String(tipologia.areaPrivada)} m²`}
                </td>
                <td className="py-2 text-right">
                  {tipologia.habitaciones} / {tipologia.banos}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Seccion>

      <Seccion titulo="Zonas sociales">
        {/* Lista con vinetas de guion en vez de badges: 13 amenidades como
            pastillas de colores es ruido, no informacion. */}
        <ul className="columns-2 gap-x-6 text-sm text-text-muted">
          {ficha.amenidades.map((amenidad) => (
            <li key={amenidad} className="break-inside-avoid py-0.5">
              {amenidad}
            </li>
          ))}
        </ul>
      </Seccion>

      {ficha.lugaresCercanos.length > 0 && (
        <Seccion titulo="Que hay cerca">
          <ul className="columns-2 gap-x-6 text-sm text-text-muted">
            {ficha.lugaresCercanos.map((lugar) => (
              <li key={lugar} className="break-inside-avoid py-0.5">
                {lugar}
              </li>
            ))}
          </ul>
        </Seccion>
      )}

      <Seccion titulo="El proyecto">
        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {ficha.unidades !== null && (
            <Dato etiqueta="Unidades" valor={<span className="tabular-nums">{ficha.unidades}</span>} />
          )}
          {ficha.torres !== null && (
            <Dato etiqueta="Torres" valor={<span className="tabular-nums">{ficha.torres}</span>} />
          )}
          {ficha.pisos !== null && <Dato etiqueta="Altura" valor={ficha.pisos} />}
          {ficha.entrega !== null && <Dato etiqueta="Entrega" valor={ficha.entrega} />}
          <Dato etiqueta="Tipo" valor={ficha.esVIS ? 'VIS' : 'No VIS'} />
          {ficha.certificacionEdge && <Dato etiqueta="Sostenibilidad" valor="Certificación EDGE" />}
          {ficha.salaDeVentas !== null && (
            <div className="col-span-2 sm:col-span-3">
              <Dato etiqueta="Sala de ventas" valor={ficha.salaDeVentas} />
            </div>
          )}
        </dl>
      </Seccion>

      {/* `noopener noreferrer` obligatorio: sin el, la pestana destino puede
          manipular la nuestra via `window.opener` (tabnabbing). */}
      <a
        href={ficha.brochureUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="focus-ring label-mono self-start border-b-2 border-brand-500 pb-0.5 text-text hover:border-accent hover:text-accent"
      >
        Ver brochure oficial ↗
      </a>
    </div>
  );
}

/** Columna fija de escritorio. */
export function ProjectDetailPanel({ tarjeta }: ProjectDetailProps): ReactElement {
  return (
    <aside
      // `key` fuerza el remonte al cambiar de proyecto: sin el, el scroll del
      // panel se queda donde estaba y el usuario cree que no paso nada.
      key={tarjeta.ficha.proyectoId}
      aria-label={`Detalle de ${tarjeta.ficha.nombre}`}
      className="animate-fade-in scrollbar-slim h-full overflow-y-auto border-l border-border pl-8"
    >
      <ProjectDetailContent tarjeta={tarjeta} />
    </aside>
  );
}

/** Hoja de movil. */
export function ProjectDetailModal({
  tarjeta,
  open,
  onClose,
}: {
  tarjeta: ProjectMatchCard | null;
  open: boolean;
  onClose: () => void;
}): ReactElement | null {
  if (tarjeta === null) return null;

  return (
    <Modal open={open} onClose={onClose} title={tarjeta.ficha.nombre} size="lg">
      <ProjectDetailContent tarjeta={tarjeta} />
    </Modal>
  );
}
