/**
 * Fila de lead de la cola (F3).
 *
 * Cinco columnas: score, quien es, capacidad, mejor match y la accion. El orden
 * no es casual: es la secuencia en la que un comercial decide si llama ahora o
 * despues.
 *
 * "Preparar llamada" es un <Link>, no un <button>: el closer abre fichas en
 * pestanas nuevas todo el dia, y un boton con navigate() rompe el clic central,
 * el ctrl+clic y el "abrir en pestana nueva".
 */

import type { ReactElement } from 'react';
import { Link } from 'react-router';
import type { ViableLeadListItem } from '@contracts';
import { AffiliationBadge, NurturedBadge, ScoreDial } from '@shared/ui';
import { leerAfinidad } from '@shared/lib/afinidad';
import { describeLead } from '@shared/lib/describe-lead';
import { formatCOP, formatCOPCompact } from '@shared/lib/format-money';

export interface LeadRowProps {
  lead: ViableLeadListItem;
}

const GRID = 'md:grid-cols-[76px_1.5fr_1fr_1.2fr_auto]';

export function LeadRow({ lead }: LeadRowProps): ReactElement {
  const proyecto = lead.proyectoTop;
  const afinidad = proyecto === null ? null : leerAfinidad(proyecto);

  return (
    <div
      className={`animate-console-rise grid grid-cols-1 items-center gap-5 rounded-[18px] border border-console-line bg-console-surface px-6 py-5 shadow-console-card transition-shadow duration-200 hover:border-console-ink hover:shadow-console-card-hover ${GRID}`}
    >
      <ScoreDial score={lead.score} tone="light" />

      <div className="flex min-w-0 flex-col gap-[7px]">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="text-[18px] font-bold tracking-[-0.01em] text-console-ink">
            {lead.nombre}
          </span>
          <AffiliationBadge esAfiliado={lead.esAfiliado} />
          {lead.vieneDeNutricion && <NurturedBadge />}
        </div>
        <span className="text-[14px] text-console-body">{describeLead(lead)}</span>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-[19px] font-bold tracking-[-0.02em] tabular-nums text-console-ink">
          {formatCOP(lead.capacidadEstimada)}
        </span>
        <span className="font-mono text-[11px] text-console-mute">
          CUOTA EST. {formatCOPCompact(lead.cuotaEstimada)}/MES
        </span>
      </div>

      <div className="flex min-w-0 flex-col gap-1">
        {proyecto === null || afinidad === null ? (
          <span className="text-[14px] text-console-mute">Sin proyectos afines aún</span>
        ) : (
          <>
            <span className="text-[15px] font-bold text-console-ink">
              {proyecto.nombre} · {proyecto.etapa}
            </span>
            {/* El closer lee esta linea en voz alta al marcar. Si el porcentaje
                no esta calculado o el proyecto no cabe en la capacidad, tiene
                que enterarse ACA -- no despues, con el cliente al telefono. */}
            <span className="text-[13px] text-console-mute" title={afinidad.explicacion}>
              {String(afinidad.porcentaje)}% de afinidad
              {afinidad.rotulo === null ? '' : ` (${afinidad.rotulo})`} · {proyecto.tipologia}
            </span>
            {afinidad.advertenciaCapacidad !== null && (
              <span className="font-mono text-[11px] text-console-red-deep">
                ⚠ {afinidad.advertenciaCapacidad.toUpperCase()}
              </span>
            )}
          </>
        )}
      </div>

      <Link
        to={`/closer/leads/${lead.leadId}`}
        className="focus-ring inline-flex items-center justify-center gap-[9px] rounded-full bg-console-signal px-6 py-[14px] text-[15px] font-bold whitespace-nowrap text-console-ink transition-colors hover:bg-console-ink hover:text-console-signal"
      >
        <span aria-hidden="true" className="inline-block size-[9px] rounded-full bg-current" />
        Preparar llamada
        <span className="sr-only"> con {lead.nombre}</span>
      </Link>
    </div>
  );
}
