/**
 * Banda de precio de un proyecto. Capa: ui.
 *
 * REGLA LEGAL, NO ESTETICA: 15 de los 16 brochures no publican precio, asi que
 * la banda se deriva del tope VIS. Cuando `precio.esEstimado` es `true` este
 * componente ESTA OBLIGADO a rotularlo y a dejar el metodo a un click de
 * distancia. Colsubsidio es una entidad Vigilada Supersubsidio: un numero que
 * se lea como oferta comercial y no lo sea es un problema legal, no un detalle
 * de copy.
 *
 * Por eso el rotulo no es una prop opcional: sale de `esEstimado` y no se puede
 * apagar desde afuera.
 */

import type { ReactElement } from 'react';
import type { PriceBand as Banda } from '@contracts';
import { Tooltip } from '@shared/ui';
import { formatCOPCompact } from '@shared/lib/format-money';
import { cn } from '@shared/lib/cn';

export interface PriceBandProps {
  precio: Banda;
  /** `sm` para la tarjeta del mazo, `md` para el detalle. */
  size?: 'sm' | 'md';
  className?: string;
}

export function PriceBand({ precio, size = 'sm', className }: PriceBandProps): ReactElement {
  const rango =
    precio.hasta === null
      ? `desde ${formatCOPCompact(precio.desde)}`
      : `${formatCOPCompact(precio.desde)} – ${formatCOPCompact(precio.hasta)}`;

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <span
        className={cn(
          'font-bold tabular-nums tracking-tight',
          size === 'sm' ? 'text-xl' : 'text-2xl',
        )}
      >
        {rango}
      </span>

      {precio.esEstimado ? (
        // El disparador es un `<button>` y no un `<span>` para que el metodo
        // tambien sea alcanzable con teclado: quien navega con Tab tiene el
        // mismo derecho a saber de donde salio la cifra.
        <Tooltip content={precio.metodo}>
          <button
            type="button"
            className="focus-ring label-mono inline-flex w-fit items-center gap-1 rounded-pill border border-warning-border bg-warning-soft px-2 py-0.5 text-warning"
          >
            <span aria-hidden="true">≈</span>
            {/* `dotted` invita a consultar el metodo en vez de tragarse el numero. */}
            <span className="underline decoration-dotted underline-offset-2">
              Precio estimado
            </span>
          </button>
        </Tooltip>
      ) : (
        <span className="label-mono inline-flex w-fit items-center gap-1 rounded-pill border border-success-border bg-success-soft px-2 py-0.5 text-success">
          Precio publicado
        </span>
      )}
    </div>
  );
}
