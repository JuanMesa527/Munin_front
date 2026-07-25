/**
 * Presets de motion para F2.2 (capa model).
 *
 * Una sola curva y duraciones cortas: presencia y jerarquía, no ruido.
 * `MotionConfig reducedMotion="user"` en app/providers ya apaga o reduce
 * estas animaciones cuando el SO lo pide.
 */

import type { Transition, Variants } from 'motion/react';

/** Ease del DS (`--ease-out-soft`). */
export const EASE_OUT_SOFT: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const TRANSICION_RAPIDA: Transition = {
  duration: 0.22,
  ease: EASE_OUT_SOFT,
};

export const TRANSICION_ENTRADA: Transition = {
  duration: 0.32,
  ease: EASE_OUT_SOFT,
};

export const TRANSICION_STAGGER: Transition = {
  staggerChildren: 0.06,
  delayChildren: 0.04,
};

/** Contenedor que orquesta hijos con stagger. */
export const variantesStagger: Variants = {
  oculto: {},
  visible: {
    transition: TRANSICION_STAGGER,
  },
};

/** Fade + rise corto: bloques de pantalla, cards, pasos. */
export const variantesRise: Variants = {
  oculto: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: TRANSICION_ENTRADA,
  },
};

/** Solo fade: texto denso o barras de progreso. */
export const variantesFade: Variants = {
  oculto: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: TRANSICION_RAPIDA,
  },
};

/** Cambio de vista en el shell (entrada). */
export const variantesVista: Variants = {
  inicial: { opacity: 0, y: 10 },
  entrar: {
    opacity: 1,
    y: 0,
    transition: TRANSICION_ENTRADA,
  },
  salir: {
    opacity: 0,
    y: -6,
    transition: { duration: 0.18, ease: EASE_OUT_SOFT },
  },
};
