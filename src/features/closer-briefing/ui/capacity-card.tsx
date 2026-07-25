/**
 * Capacidad estimada del lead (F4).
 *
 * LA LETRA PEQUENA DE ESTA TARJETA NO ES OPCIONAL: dice explicitamente que es
 * una estimacion con datos declarados, que NO es una aprobacion de credito y que
 * NO se consultaron centrales de riesgo. Consultar centrales exige autorizacion
 * previa y expresa del titular (Ley 1266 de 2008) y esta fuera del alcance;
 * prometer un credito que el banco no aprobo seria un riesgo real para la caja.
 * Si alguien borra ese parrafo, la pantalla deja de ser defendible.
 */

import type { ReactElement } from 'react';
import type { EnrichedLead } from '@contracts';
import { formatCOP, formatCOPCompact } from '@shared/lib/format-money';

interface MiniTileProps {
  label: string;
  value: string;
}

function MiniTile({ label, value }: MiniTileProps): ReactElement {
  return (
    <div className="rounded-xl bg-console-ink/8 px-[14px] py-3">
      <div className="font-mono text-[10px] tracking-[0.1em] text-console-signal-deep">
        {label}
      </div>
      <div className="mt-[3px] text-[17px] font-bold tabular-nums">{value}</div>
    </div>
  );
}

export interface CapacityCardProps {
  lead: EnrichedLead;
}

export function CapacityCard({ lead }: CapacityCardProps): ReactElement {
  const ingresos =
    lead.ingresosSmmlv === null
      ? '—'
      : `${lead.ingresosSmmlv.toLocaleString('es-CO', { maximumFractionDigits: 1 })} SMMLV`;

  return (
    <section className="rounded-[20px] bg-console-signal p-6 text-console-ink">
      <div className="mb-2.5 font-mono text-[11px] font-bold tracking-[0.12em] text-console-signal-deep uppercase">
        Capacidad estimada
      </div>
      <div className="text-[38px] leading-none font-bold tracking-[-0.03em] tabular-nums">
        {formatCOP(lead.capacidad?.precioMaximoEstimado ?? null)}
      </div>
      <p className="mt-2 mb-[18px] text-[12px] leading-[1.45] text-console-body">
        Estimada con los datos que el lead declaró. No es una aprobación de crédito ni consulta de
        centrales de riesgo.
      </p>

      <div className="grid grid-cols-2 gap-3">
        <MiniTile
          label="CUOTA/MES"
          value={formatCOPCompact(lead.capacidad?.cuotaMensualEstimada ?? null)}
        />
        <MiniTile label="AHORRO" value={formatCOPCompact(lead.ahorroDeclarado)} />
        {/* El subsidio estimado NO se muestra aqui: en una llamada comercial un
            monto de subsidio en pantalla se convierte en promesa, y el SFV lo
            asigna la caja, no nosotros. El calculo sigue existiendo para el plan
            de nutricion de F2.2, que es donde el usuario lo lee como meta. */}
        <MiniTile label="INGRESOS" value={ingresos} />
      </div>
    </section>
  );
}
