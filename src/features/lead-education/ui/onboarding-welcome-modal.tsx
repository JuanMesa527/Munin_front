/**
 * Modal de bienvenida al entrar a F2.2 (capa ui).
 *
 * Diálogo propio (portal + foco atrapado): el `Modal` del DS fuerza cabecera
 * con título pequeño y pie con borde, y eso pelea con un onboarding de
 * bienvenida. Aquí se controla la composición completa — hero de marca,
 * mensaje cálido, pasos numerados y un solo CTA — sin inventar tokens.
 *
 * Copy legal: no promete subsidio ni crédito aprobado.
 */

import { useEffect, useId, useRef, type ReactElement } from 'react';
import { createPortal } from 'react-dom';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight, X } from 'lucide-react';
import { Button } from '@shared/ui';
import { cn } from '@shared/lib/cn';
import { EASE_OUT_SOFT, variantesRise, variantesStagger } from '../model/motion';

export interface OnboardingWelcomeModalProps {
  open: boolean;
  onClose: () => void;
}

const SELECTOR_FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

const PASOS = [
  {
    n: '01',
    titulo: 'Diagnóstico claro',
    texto: 'Vemos qué te falta hoy y qué ya tienes a favor — sin rodeos.',
  },
  {
    n: '02',
    titulo: 'Plan a tu medida',
    texto: 'Ahorro, documentos y tiempos ordenados en un camino concreto.',
  },
  {
    n: '03',
    titulo: 'Avance medible',
    texto: 'Cada meta te acerca al momento de comprar con tranquilidad.',
  },
] as const;

export function OnboardingWelcomeModal({
  open,
  onClose,
}: OnboardingWelcomeModalProps): ReactElement | null {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const titleId = useId();
  const descId = `${titleId}-desc`;
  const reducirMovimiento = useReducedMotion() ?? false;

  useEffect(() => {
    if (!open) return;

    const panel = panelRef.current;
    const previo =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

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
    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown, true);
      document.body.style.overflow = overflowPrevio;
      previo?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 bg-overlay backdrop-blur-[3px]"
        initial={reducirMovimiento ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.22 }}
      />

      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        tabIndex={-1}
        className={cn(
          'relative flex w-full max-w-lg flex-col overflow-hidden',
          'max-h-[92dvh] rounded-t-card bg-surface shadow-pop sm:max-w-2xl sm:rounded-card lg:max-w-3xl',
          'outline-none',
        )}
        initial={reducirMovimiento ? false : { opacity: 0, y: 32, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.34, ease: EASE_OUT_SOFT }}
      >
        <div className="relative shrink-0 overflow-hidden bg-accent-600 px-6 pt-6 pb-8 text-white sm:px-10 sm:pt-9 sm:pb-11">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-30"
            style={{
              background:
                'radial-gradient(ellipse 80% 70% at 100% 0%, #74b8e0 0%, transparent 55%), radial-gradient(ellipse 60% 50% at 0% 100%, #03253c 0%, transparent 50%)',
            }}
          />
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute -right-8 -bottom-10 size-40 rounded-full bg-brand/25 blur-2xl sm:size-56"
            initial={reducirMovimiento ? false : { opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.12, ease: EASE_OUT_SOFT }}
          />

          <div className="relative flex items-start justify-between gap-4">
            <motion.div
              className="min-w-0 max-w-xl"
              initial={reducirMovimiento ? false : 'oculto'}
              animate="visible"
              variants={variantesStagger}
            >
              <motion.p
                variants={variantesRise}
                className="font-mono text-[0.6875rem] font-medium tracking-[0.14em] text-white/75 uppercase sm:text-xs"
              >
                Camino a mi hogar
              </motion.p>
              <motion.h2
                id={titleId}
                variants={variantesRise}
                className="mt-3 font-display text-2xl leading-tight font-bold tracking-tight text-white sm:mt-4 sm:text-3xl lg:text-[2.125rem]"
              >
                Tu sueño de vivienda propia no se detiene aquí
              </motion.h2>
            </motion.div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="focus-ring -mt-1 -mr-1 inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            >
              <X aria-hidden="true" className="size-4" strokeWidth={2.25} />
            </button>
          </div>
        </div>

        <motion.div
          className="scrollbar-slim min-h-0 flex-1 overflow-y-auto px-6 py-6 sm:px-10 sm:py-8"
          initial={reducirMovimiento ? false : 'oculto'}
          animate="visible"
          variants={variantesStagger}
        >
          <motion.div className="sm:max-w-2xl" variants={variantesRise}>
            <p id={descId} className="text-[0.9375rem] leading-relaxed text-text-muted sm:text-base">
              Por ahora te falta un poco para avanzar con un asesor. Este espacio
              es para cerrar esa brecha: con un plan claro de ahorro, documentos y
              tiempos a tu ritmo.
            </p>
          </motion.div>

          <motion.ol
            className="mt-7 grid gap-0 sm:mt-9 sm:grid-cols-3 sm:gap-6"
            aria-label="Cómo te acompañamos"
            variants={variantesStagger}
          >
            {PASOS.map((paso, indice) => (
              <motion.li
                key={paso.n}
                variants={variantesRise}
                className={cn(
                  'flex gap-4 py-3.5 sm:flex-col sm:gap-3 sm:border-b-0 sm:py-0',
                  indice < PASOS.length - 1 && 'border-b border-border sm:border-b-0',
                )}
              >
                <span
                  aria-hidden="true"
                  className="font-display w-8 shrink-0 pt-0.5 text-sm font-bold tabular-nums text-accent-600 sm:w-auto sm:text-lg"
                >
                  {paso.n}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-text sm:text-base">{paso.titulo}</p>
                  <p className="mt-0.5 text-sm leading-relaxed text-text-muted">{paso.texto}</p>
                </div>
              </motion.li>
            ))}
          </motion.ol>
        </motion.div>

        <motion.div
          className="shrink-0 border-t border-border bg-surface px-6 py-4 sm:px-10 sm:py-5"
          initial={reducirMovimiento ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, delay: 0.28, ease: EASE_OUT_SOFT }}
        >
          <div className="sm:flex sm:items-center sm:justify-between sm:gap-6">
            <p className="mb-3 text-center font-mono text-[0.6875rem] tracking-wide text-text-subtle sm:mb-0 sm:text-left sm:text-xs">
              La vivienda propia se construye. Empezamos hoy.
            </p>
            <Button
              variant="accent"
              size="lg"
              className="w-full sm:w-auto sm:min-w-[14rem]"
              iconRight={<ArrowRight aria-hidden="true" className="size-4" />}
              onClick={onClose}
            >
              Empezar mi camino
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </div>,
    document.body,
  );
}
