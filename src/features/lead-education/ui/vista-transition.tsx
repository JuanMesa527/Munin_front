/**
 * Transición entre pestañas del shell F2.2 (capa ui).
 *
 * `AnimatePresence` + key por vista: al cambiar Inicio/Camino/Logros/… el
 * panel entra con un rise corto. El shell (nav) queda quieto a propósito.
 */

import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import type { ReactElement, ReactNode } from 'react';
import { variantesVista } from '../model/motion';

export interface VistaTransitionProps {
  /** Identidad de la vista activa (`inicio`, `camino`, …). */
  vistaKey: string;
  children: ReactNode;
}

export function VistaTransition({ vistaKey, children }: VistaTransitionProps): ReactElement {
  const reducir = useReducedMotion() ?? false;

  if (reducir) {
    return <div className="min-h-0 min-w-0">{children}</div>;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={vistaKey}
        className="min-h-0 min-w-0"
        variants={variantesVista}
        initial="inicial"
        animate="entrar"
        exit="salir"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
