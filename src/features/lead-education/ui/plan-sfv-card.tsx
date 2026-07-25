/**
 * Tarjeta del plan de nutricion basado en el SFV (capa ui, F2.2).
 *
 * LEGAL: todo el vocabulario es "estimado". Nunca "aprobado" — no prometemos
 * subsidio ni credito (EQUIPO.md §8/§9). El SFV lo otorga la caja, no nosotros.
 */

import type { ReactElement } from 'react';
import type { NurturePlan } from '@contracts';
import { Card, CardContent, CardHeader, CardTitle } from '@shared/ui';
import { formatCOP } from '@shared/lib/format-money';
import { formatSmmlv } from '@shared/lib/format-smmlv';

export interface PlanSfvCardProps {
  plan: NurturePlan;
}

export function PlanSfvCard({ plan }: PlanSfvCardProps): ReactElement {
  return (
    <Card accent="accent">
      <CardHeader>
        <CardTitle>Tu plan estimado</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
          <Dato etiqueta="Precio objetivo" valor={formatCOP(plan.precioObjetivo)} />
          <Dato
            etiqueta="Subsidio estimado"
            valor={plan.aplicaSubsidio ? formatCOP(plan.subsidioEstimado) : 'No aplica'}
          />
          <Dato etiqueta="Te falta (estimado)" valor={formatCOP(plan.gap)} />
          <Dato
            etiqueta="Meses para calificar"
            valor={plan.mesesParaCalificar > 0 ? `${String(plan.mesesParaCalificar)} meses` : '¡Ya la cerraste!'}
          />
        </dl>

        {plan.aplicaSubsidio && (
          <p className="mt-4 text-xs text-text-subtle">
            Tu hogar podría aspirar al Subsidio Familiar de Vivienda ({formatSmmlv(plan.subsidioEstimado)}{' '}
            equivalentes). Es un <strong>estimado</strong>: la caja decide el otorgamiento final.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string }): ReactElement {
  return (
    <div>
      <dt className="label-mono text-[0.625rem]">{etiqueta}</dt>
      <dd className="mt-0.5 text-base font-semibold tabular-nums text-text">{valor}</dd>
    </div>
  );
}
