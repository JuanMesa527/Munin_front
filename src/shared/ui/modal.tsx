/**
 * Modal accesible (design system, capa shared).
 *
 * ACCESIBILIDAD (WCAG 2.1.2 "sin trampa de teclado" y 2.4.3 "orden de foco"):
 *  - `role="dialog"` + `aria-modal` + titulo asociado.
 *  - El foco entra al abrir, queda ATRAPADO mientras esta abierto y vuelve al
 *    elemento que lo abrio al cerrar.
 *  - Escape siempre cierra.
 *  - Se renderiza en un portal para que ningun `overflow: hidden` de un panel
 *    lo recorte.
 */

import { useEffect, useId, useRef, type ReactElement, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '../lib/cn';

const SELECTOR_FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

const ANCHOS = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
} as const;

export type ModalSize = keyof typeof ANCHOS;

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string | undefined;
  children?: ReactNode;
  footer?: ReactNode;
  size?: ModalSize;
  /** Cerrar al hacer click fuera. Se apaga cuando perder el estado duele. */
  closeOnOverlay?: boolean;
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  closeOnOverlay = true,
}: ModalProps): ReactElement | null {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const titleId = useId();
  const descriptionId = `${titleId}-desc`;

  useEffect(() => {
    if (!open) return;

    const panel = panelRef.current;
    const previamenteEnfocado =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    // El primer control util recibe el foco; si no hay ninguno, el panel mismo.
    const focusables = (): HTMLElement[] =>
      panel === null ? [] : Array.from(panel.querySelectorAll<HTMLElement>(SELECTOR_FOCUSABLE));

    const inicial = focusables().at(0);
    (inicial ?? panel)?.focus();

    function onKeyDown(evento: KeyboardEvent): void {
      if (evento.key === 'Escape') {
        evento.stopPropagation();
        onClose();
        return;
      }

      if (evento.key !== 'Tab') return;

      const lista = focusables();
      const primero = lista.at(0);
      const ultimo = lista.at(-1);

      if (primero === undefined || ultimo === undefined) {
        // Sin nada enfocable dentro, el Tab no debe salirse del dialogo.
        evento.preventDefault();
        panel?.focus();
        return;
      }

      if (!evento.shiftKey && document.activeElement === ultimo) {
        evento.preventDefault();
        primero.focus();
      } else if (evento.shiftKey && document.activeElement === primero) {
        evento.preventDefault();
        ultimo.focus();
      }
    }

    document.addEventListener('keydown', onKeyDown, true);

    // Bloquear el scroll del fondo evita que el contenido "se mueva" detras.
    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown, true);
      document.body.style.overflow = overflowPrevio;
      previamenteEnfocado?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      {/* Fondo: decorativo y no enfocable. El cierre por click es una comodidad,
          el camino accesible es Escape o el boton de cerrar. */}
      <div
        aria-hidden="true"
        onClick={closeOnOverlay ? onClose : undefined}
        className="animate-fade-in absolute inset-0 bg-overlay backdrop-blur-[2px]"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description !== undefined ? descriptionId : undefined}
        tabIndex={-1}
        className={cn(
          'animate-rise relative flex w-full flex-col rounded-t-card border border-border bg-surface shadow-pop',
          'max-h-[90dvh] sm:rounded-card',
          ANCHOS[size],
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-border p-4">
          <div className="min-w-0">
            <h2 id={titleId} className="text-base font-semibold text-text">
              {title}
            </h2>
            {description !== undefined && (
              <p id={descriptionId} className="mt-1 text-sm text-text-muted">
                {description}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="focus-ring -mt-1 -mr-1 inline-flex size-8 shrink-0 items-center justify-center rounded-field text-text-muted hover:bg-surface-3 hover:text-text"
          >
            <X aria-hidden="true" className="size-4" />
          </button>
        </div>

        <div className="scrollbar-slim min-h-0 flex-1 overflow-y-auto p-4 text-sm text-text">
          {children}
        </div>

        {footer !== undefined && (
          <div className="flex items-center justify-end gap-2 border-t border-border p-4">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
