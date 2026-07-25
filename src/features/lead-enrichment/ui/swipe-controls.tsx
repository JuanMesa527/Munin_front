/**
 * Botonera del mazo. Capa: ui.
 *
 * No es un adorno del gesto: es la via PRINCIPAL para quien no puede o no
 * quiere arrastrar (teclado, lector de pantalla, motricidad reducida). El
 * arrastre es el atajo, no al reves.
 */

import { Heart, Star, X } from 'lucide-react';
import type { ReactElement } from 'react';
import type { SwipeAction } from '@contracts';
import { cn } from '@shared/lib/cn';

export interface SwipeControlsProps {
  onDecidir: (accion: SwipeAction) => void;
  disabled?: boolean;
}

interface Control {
  accion: SwipeAction;
  etiqueta: string;
  atajo: string;
  icono: ReactElement;
  clases: string;
}

const CONTROLES: Control[] = [
  {
    accion: 'pass',
    etiqueta: 'No me sirve',
    atajo: '←',
    icono: <X aria-hidden="true" className="size-6" />,
    clases: 'border-danger-border bg-surface text-danger hover:bg-danger-soft',
  },
  {
    accion: 'favorito',
    etiqueta: 'Me encanta',
    atajo: '↑',
    icono: <Star aria-hidden="true" className="size-6" />,
    clases: 'border-transparent bg-brand-500 text-[#0d0d0d] hover:bg-brand-600',
  },
  {
    accion: 'like',
    etiqueta: 'Me sirve',
    atajo: '→',
    icono: <Heart aria-hidden="true" className="size-6" />,
    clases: 'border-success-border bg-surface text-success hover:bg-success-soft',
  },
];

export function SwipeControls({ onDecidir, disabled = false }: SwipeControlsProps): ReactElement {
  return (
    <div className="flex items-start justify-center gap-4">
      {CONTROLES.map((control) => (
        <div key={control.accion} className="flex flex-col items-center gap-1.5">
          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              onDecidir(control.accion);
            }}
            // El nombre accesible lleva tambien el atajo: quien usa lector de
            // pantalla se entera de que existe el teclado sin tener que verlo.
            aria-label={`${control.etiqueta} (tecla ${control.atajo})`}
            aria-keyshortcuts={control.accion === 'favorito' ? 'ArrowUp' : undefined}
            className={cn(
              'focus-ring flex size-14 items-center justify-center rounded-pill border-2 shadow-sm',
              'transition-transform duration-150 active:scale-90',
              'disabled:pointer-events-none disabled:opacity-40',
              control.clases,
            )}
          >
            {control.icono}
          </button>
          <span aria-hidden="true" className="label-mono text-[0.625rem] text-text-subtle">
            {control.atajo}
          </span>
        </div>
      ))}
    </div>
  );
}
