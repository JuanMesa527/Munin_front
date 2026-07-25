/**
 * Tooltip accesible (design system, capa shared).
 *
 * ACCESIBILIDAD (WCAG 1.4.13): aparece con hover Y con foco de teclado, se
 * cierra con Escape, y se asocia al disparador con `aria-describedby`. Nunca
 * contiene informacion critica ni controles: un tooltip que hay que "cazar"
 * con el mouse es inaccesible por definicion.
 */

import {
  cloneElement,
  useId,
  useState,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
} from 'react';
import { cn } from '../lib/cn';

export type TooltipSide = 'top' | 'bottom';

const POSICIONES: Record<TooltipSide, string> = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
};

/** Props que el tooltip inyecta al disparador. */
interface TriggerProps {
  'aria-describedby'?: string | undefined;
}

export interface TooltipProps {
  /** Texto corto. Si necesitas parrafos, usa un `<Modal>`. */
  content: ReactNode;
  /** Un unico elemento enfocable (boton, enlace, control). */
  children: ReactElement<TriggerProps>;
  side?: TooltipSide;
  className?: string | undefined;
}

export function Tooltip({
  content,
  children,
  side = 'top',
  className,
}: TooltipProps): ReactElement {
  const [visible, setVisible] = useState(false);
  const tooltipId = useId();

  const disparador = cloneElement(children, {
    'aria-describedby': visible ? tooltipId : undefined,
  });

  function onKeyDown(evento: KeyboardEvent<HTMLSpanElement>): void {
    if (evento.key === 'Escape' && visible) setVisible(false);
  }

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => {
        setVisible(true);
      }}
      onMouseLeave={() => {
        setVisible(false);
      }}
      // `focusin`/`focusout` burbujean, asi que el foco del hijo se detecta aqui.
      onFocus={() => {
        setVisible(true);
      }}
      onBlur={() => {
        setVisible(false);
      }}
      onKeyDown={onKeyDown}
    >
      {disparador}

      {visible && (
        <span
          role="tooltip"
          id={tooltipId}
          className={cn(
            'animate-fade-in pointer-events-none absolute z-40 w-max max-w-[15rem] rounded-field',
            'bg-text px-2 py-1 text-xs font-medium text-surface shadow-pop',
            POSICIONES[side],
            className,
          )}
        >
          {content}
        </span>
      )}
    </span>
  );
}
