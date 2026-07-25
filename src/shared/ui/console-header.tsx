/**
 * Barra superior de la consola del closer (capa shared).
 *
 * La comparten F3 (dashboard) y F4 (ficha de llamada). Vive en `shared/ui` y no
 * en una feature porque la regla 4 prohibe que F4 importe internals de F3, y
 * duplicarla garantizaria que se desincronicen.
 */

import type { ReactElement } from 'react';
import { cn } from '../lib/cn';

export interface ConsoleHeaderProps {
  closerName: string;
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

const COLSUBSIDIO_LOGO =
  'https://www.colsubsidio.com/campusvirtual/login-custom/img/colsubsidio1.png';

function BrandMark(): ReactElement {
  return (
    <img
      src={COLSUBSIDIO_LOGO}
      alt="Colsubsidio"
      className="h-6 w-auto"
    />
  );
}

export function ConsoleHeader({
  closerName,
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
