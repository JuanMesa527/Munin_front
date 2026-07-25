/**
 * Primitivos de reveal para F2.2 (capa ui).
 *
 * Envuelven `motion` con los presets de `model/motion` para que las pantallas
 * no reinventen delays/easings. Si `prefers-reduced-motion`, montan sin
 * animación (mismo layout).
 */

import { motion, useReducedMotion } from 'motion/react';
import type { ReactElement, ReactNode } from 'react';
import { variantesFade, variantesRise, variantesStagger } from '../model/motion';

export interface StaggerProps {
  children: ReactNode;
  className?: string | undefined;
  /** Usa `<main>` cuando envuelve toda la pantalla. */
  as?: 'div' | 'main';
  delay?: number;
}

export function Stagger({
  children,
  className,
  as = 'div',
  delay = 0,
}: StaggerProps): ReactElement {
  const reducir = useReducedMotion() ?? false;

  if (reducir) {
    return as === 'main' ? (
      <main className={className}>{children}</main>
    ) : (
      <div className={className}>{children}</div>
    );
  }

  const Comp = as === 'main' ? motion.main : motion.div;

  return (
    <Comp
      className={className}
      variants={variantesStagger}
      initial="oculto"
      animate="visible"
      transition={{ delayChildren: 0.05 + delay, staggerChildren: 0.07 }}
    >
      {children}
    </Comp>
  );
}

export interface RevealProps {
  children: ReactNode;
  className?: string | undefined;
  /** `fade` para texto denso; `rise` (default) para bloques. */
  variant?: 'rise' | 'fade';
}

export function Reveal({
  children,
  className,
  variant = 'rise',
}: RevealProps): ReactElement {
  const reducir = useReducedMotion() ?? false;
  const variantes = variant === 'fade' ? variantesFade : variantesRise;

  if (reducir) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div className={className} variants={variantes}>
      {children}
    </motion.div>
  );
}
