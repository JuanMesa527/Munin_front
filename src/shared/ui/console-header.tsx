/**
 * Barra superior de la consola del closer (capa shared).
 *
 * La comparten F3 (dashboard) y F4 (ficha de llamada). Vive en `shared/ui` y no
 * en una feature porque la regla 4 prohibe que F4 importe internals de F3, y
 * duplicarla garantizaria que se desincronicen.
 *
 * El chip "demo · datos simulados" no es decorativo: el jurado tiene que saber
 * en todo momento que no esta viendo datos de personas reales.
 */

import type { ReactElement } from 'react';
import { cn } from '../lib/cn';

export interface ConsoleHeaderProps {
  closerName: string;
  /** Oculta el chip de demo cuando la consola habla con datos reales. */
  showDemoBadge?: boolean;
  className?: string;
}

/** `Sofía Marín` -> `SM`. Dos letras como maximo para que quepan en 32px. */
function initials(nombre: string): string {
  return nombre
    .split(' ')
    .map((palabra) => palabra.at(0) ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

/**
 * Marca del producto: cuatro cuadros en damero amarillo/azul. Es decorativa,
 * asi que va con `aria-hidden` para que el lector de pantalla no lea ruido.
 */
function BrandMark(): ReactElement {
  return (
    <span
      aria-hidden="true"
      className="grid grid-cols-[13px_13px] grid-rows-[13px_13px] gap-[2px]"
    >
      <span className="rounded-[2px] bg-console-signal" />
      <span className="rounded-[2px] bg-console-blue" />
      <span className="rounded-[2px] bg-console-blue" />
      <span className="rounded-[2px] bg-console-signal" />
    </span>
  );
}

export function ConsoleHeader({
  closerName,
  showDemoBadge = true,
  className,
}: ConsoleHeaderProps): ReactElement {
  return (
    <header
      className={cn(
        'sticky top-0 z-40 flex flex-wrap items-center justify-between gap-3',
        'bg-console-ink px-4 py-[14px] sm:px-8',
        className,
      )}
    >
      <div className="flex items-center gap-[14px]">
        <BrandMark />
        <span className="text-[15px] font-bold text-white">Perfilador de leads</span>
        <span className="rounded-full border border-console-body px-[10px] py-[5px] font-mono text-[11px] font-bold tracking-[0.14em] text-console-signal uppercase">
          Consola closer
        </span>
      </div>

      <div className="flex items-center gap-3">
        {showDemoBadge && (
          <span className="hidden font-mono text-[12px] text-console-mute sm:inline">
            demo · datos simulados
          </span>
        )}
        <span className="text-[14px] font-bold text-console-paper">{closerName}</span>
        <span
          aria-hidden="true"
          className="inline-flex size-8 items-center justify-center rounded-full bg-console-signal text-[13px] font-bold text-console-ink"
        >
          {initials(closerName)}
        </span>
      </div>
    </header>
  );
}
