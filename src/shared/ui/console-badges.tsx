/**
 * Insignias de la consola del closer (capa shared).
 *
 * Las comparten F3 y F4, con variante clara (tarjeta blanca) y oscura (cabecera
 * de la ficha). Viven aqui porque F4 no puede importar internals de F3.
 *
 * La insignia de afiliacion no es decorativa: la regla 90/10 obliga a que ~90%
 * de las ventas vayan a afiliados, asi que el estado de afiliacion es el primer
 * dato que el comercial tiene que ver de un lead.
 */

import type { ReactElement } from 'react';
import { cn } from '../lib/cn';

export type ConsoleBadgeTone = 'light' | 'dark';

const BASE =
  'inline-flex items-center rounded-full px-[10px] py-[5px] font-mono text-[10px] font-bold';

export interface AffiliationBadgeProps {
  esAfiliado: boolean;
  tone?: ConsoleBadgeTone;
}

export function AffiliationBadge({
  esAfiliado,
  tone = 'light',
}: AffiliationBadgeProps): ReactElement {
  const claro = tone === 'light';

  const estilo = esAfiliado
    ? claro
      ? 'bg-console-green-soft text-console-green-deep'
      : 'bg-console-green-deep text-console-green-soft'
    : claro
      ? 'bg-console-track text-console-body'
      : 'bg-console-body text-console-edge';

  return (
    <span className={cn(BASE, estilo)}>
      {esAfiliado ? 'AFILIADO' : 'NO AFILIADO · 90/10'}
    </span>
  );
}

export interface NurturedBadgeProps {
  tone?: ConsoleBadgeTone;
  /** F3 usa la version corta; F4 la larga, que tiene espacio. */
  label?: string;
}

/**
 * Marca al lead que entro como no viable y se recupero por el carril de
 * nutricion (F2.2). Para el comercial es la senal de intencion mas fuerte de
 * toda la lista: esta persona trabajo meses para poder comprar.
 */
export function NurturedBadge({ tone = 'light', label }: NurturedBadgeProps): ReactElement {
  const claro = tone === 'light';

  return (
    <span
      className={cn(
        BASE,
        claro
          ? 'bg-console-signal-soft text-console-signal-deep'
          : 'bg-console-signal-deep text-console-signal-soft',
      )}
    >
      {label ?? '↑ NUTRIDO'}
    </span>
  );
}
