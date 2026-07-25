/**
 * "Guion de la llamada" (F4).
 *
 * Checklist que el comercial marca mientras habla. Los puntos NO los elige un
 * modelo: los ordena el motor a partir del perfil (intereses, capacidad, match y
 * elegibilidad al subsidio), y por eso siempre incluyen los dos recordatorios
 * legales — hablar de capacidad estimada y no prometer subsidio.
 *
 * Cada punto es un <button> con `aria-pressed`, no un div con onClick: el closer
 * lo usa con el teclado mientras sostiene el telefono.
 */

import type { CSSProperties, ReactElement } from 'react';
import type { TalkingPoint } from '@contracts';
import { cn } from '@shared/lib/cn';
import { CardEyebrow } from './briefing-card';
import type { TalkingPointsState } from '../model/use-talking-points';

export interface CallScriptProps {
  puntos: readonly TalkingPoint[];
  estado: TalkingPointsState;
}

function anchoDe(porcentaje: number): CSSProperties {
  return { width: `${String(porcentaje)}%` };
}

export function CallScript({ puntos, estado }: CallScriptProps): ReactElement {
  return (
    <section className="rounded-[20px] bg-console-blue p-[26px] text-white">
      <CardEyebrow className="!text-console-blue-soft">Guion de la llamada</CardEyebrow>
      <p className="mt-1.5 mb-5 text-[14px] leading-[1.5] text-console-blue-soft">
        Marca cada punto mientras avanzas.
      </p>

      <ul className="flex list-none flex-col gap-3.5">
        {puntos.map((punto, i) => {
          const cubierto = estado.cubiertos.has(i);
          return (
            <li key={punto.titulo}>
              <button
                type="button"
                aria-pressed={cubierto}
                onClick={() => {
                  estado.toggle(i);
                }}
                className="focus-ring flex w-full cursor-pointer items-start gap-3 text-left"
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    'inline-flex size-6 flex-none items-center justify-center rounded-[7px] border-2 text-[13px] font-extrabold',
                    cubierto
                      ? 'border-console-signal bg-console-signal text-console-ink'
                      : 'border-white/45 bg-transparent text-white',
                  )}
                >
                  {cubierto ? '✓' : i + 1}
                </span>
                <span className={cn('transition-opacity', cubierto && 'opacity-50')}>
                  <span className="block text-[15px] leading-[1.35] font-bold">
                    {punto.titulo}
                  </span>
                  <span className="mt-[3px] block text-[13px] leading-[1.5] text-console-blue-soft">
                    {punto.detalle}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <div
        className="mt-[22px] h-1.5 overflow-hidden rounded-full bg-white/25"
        role="progressbar"
        aria-valuenow={estado.hechos}
        aria-valuemin={0}
        aria-valuemax={estado.total}
        aria-label="Puntos del guion cubiertos"
      >
        <div
          className="h-full rounded-full bg-console-signal transition-[width] duration-250 ease-out"
          style={anchoDe(estado.porcentaje)}
        />
      </div>
      <div className="mt-2 font-mono text-[11px] text-console-blue-soft">
        {estado.hechos} DE {estado.total} CUBIERTOS
      </div>
    </section>
  );
}
