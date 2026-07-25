/**
 * MotionConfig de la app (capa app) — tasks.md 4.2.
 *
 * `reducedMotion="user"` (EQUIPO.md: "toda animacion respeta
 * prefers-reduced-motion"): motion detecta la preferencia del sistema
 * operativo y desactiva/reduce animaciones automaticamente, sin que cada
 * componente tenga que consultar el media query por su cuenta.
 */

import { MotionConfig } from 'motion/react';
import type { ReactElement, ReactNode } from 'react';

export interface AppMotionProviderProps {
  children: ReactNode;
}

export function AppMotionProvider({ children }: AppMotionProviderProps): ReactElement {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
