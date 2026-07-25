/**
 * Callout "Tu caso" dentro del lector de lecciones (capa ui, F2.2).
 *
 * Conecta la lección genérica con los números reales del plan del lead —
 * pero SOLO en las lecciones donde el `NurturePlan` ya trae el dato exacto
 * que hace falta. Nunca fabrica una cifra que el contrato no provee: sin
 * mapeo para el `contenidoId`, no renderiza nada.
 *
 * LEGAL: mismo vocabulario "estimado" que `plan-sfv-card.tsx` (Ley 1266 de
 * 2008 — no consultamos centrales de riesgo, nunca prometemos aprobación).
 */

import type { ReactElement } from 'react';
import type { NurturePlan } from '@contracts';
import { formatCOP } from '@shared/lib/format-money';

export interface TuCasoCalloutProps {
  plan: NurturePlan;
  contenidoId: string;
}

type Renderizador = (plan: NurturePlan) => ReactElement;

function ContenidoSfv({ plan }: { plan: NurturePlan }): ReactElement {
  if (!plan.aplicaSubsidio) {
    return <p>No aplica para tu hogar según tu perfil declarado.</p>;
  }
  return (
    <p>
      Tu subsidio estimado es de <strong>{formatCOP(plan.subsidioEstimado)}</strong>.
    </p>
  );
}

function ContenidoPlan({ plan }: { plan: NurturePlan }): ReactElement {
  return (
    <p>
      El precio de tu vivienda objetivo es <strong>{formatCOP(plan.precioObjetivo)}</strong>, tu
      subsidio estimado es <strong>{formatCOP(plan.subsidioEstimado)}</strong>, y lo que te falta
      cubrir (estimado) es <strong>{formatCOP(plan.gap)}</strong>.
    </p>
  );
}

function ContenidoGapYMeses({ plan }: { plan: NurturePlan }): ReactElement {
  return (
    <p>
      Con tu ahorro declarado, te falta <strong>{formatCOP(plan.gap)}</strong> y, estimado, te
      tomaría{' '}
      <strong>
        {plan.mesesParaCalificar > 0 ? `${String(plan.mesesParaCalificar)} meses` : 'ya lo lograste'}
      </strong>{' '}
      llegar a tu meta.
    </p>
  );
}

const RENDERIZADOR_POR_CONTENIDO: Record<string, Renderizador> = {
  'cont-financiar-que-es-sfv': (plan) => <ContenidoSfv plan={plan} />,
  'cont-financiar-plan': (plan) => <ContenidoPlan plan={plan} />,
  'cont-financiar-cuota-vs-ingreso': (plan) => <ContenidoGapYMeses plan={plan} />,
  'cont-capacidad-simulacion': (plan) => <ContenidoGapYMeses plan={plan} />,
};

export function TuCasoCallout({ plan, contenidoId }: TuCasoCalloutProps): ReactElement | null {
  const renderizar = RENDERIZADOR_POR_CONTENIDO[contenidoId];
  if (renderizar === undefined) return null;

  return (
    <aside className="mt-4 rounded-card border border-accent-200 bg-accent-50 p-4 text-sm text-accent-900">
      <p className="mb-1.5 text-xs font-bold tracking-wide text-accent-700 uppercase">Tu caso</p>
      {renderizar(plan)}
      <p className="mt-2 text-xs text-accent-700/80">
        Es un <strong>estimado</strong>, no una aprobación: la caja decide el otorgamiento final.
      </p>
    </aside>
  );
}
