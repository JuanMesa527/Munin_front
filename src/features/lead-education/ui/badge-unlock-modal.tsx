/**
 * Celebracion de un badge desbloqueado (capa ui, F2.2).
 *
 * Usa Motion para entrada del icono (pop suave) además del keyframe CSS
 * `animate-pop`. `MotionConfig` en `app/providers` respeta reduced-motion.
 */

import { motion, useReducedMotion } from 'motion/react';
import type { ReactElement } from 'react';
import type { Badge as BadgeType } from '@contracts';
import { Button, Modal } from '@shared/ui';
import { EASE_OUT_SOFT } from '../model/motion';
import { iconoDeBadge } from '../model/badge-icons';

export interface BadgeUnlockModalProps {
  badge: BadgeType | null;
  onClose: () => void;
}

/**
 * Funcion (no un componente con nombre en PascalCase) a proposito: asignar
 * `iconoDeBadge(...)` a una variable capitalizada dentro del render dispara
 * `react-hooks/static-components` (React no puede probar que el componente es
 * estable entre renders). Envolver la creacion del elemento en una funcion
 * minuscula evita el falso positivo sin perder el lookup dinamico.
 */
function iconoBadgeDesbloqueado(icono: string): ReactElement {
  const Icono = iconoDeBadge(icono);
  return <Icono className="animate-pop size-12" />;
}

export function BadgeUnlockModal({ badge, onClose }: BadgeUnlockModalProps): ReactElement | null {
  const reducir = useReducedMotion() ?? false;

  if (badge === null) return null;

  return (
    <Modal
      open
      onClose={onClose}
      title="¡Nuevo logro!"
      footer={<Button onClick={onClose}>Seguir mi camino</Button>}
    >
      <div className="flex flex-col items-center gap-3 py-2 text-center">
        <motion.span
          aria-hidden="true"
          className="flex size-20 items-center justify-center rounded-full bg-brand-100 text-brand-800"
          initial={reducir ? false : { opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 380, damping: 18 }}
        >
          {iconoBadgeDesbloqueado(badge.icono)}
        </motion.span>
        <motion.p
          className="text-lg font-semibold text-text"
          initial={reducir ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, delay: 0.08, ease: EASE_OUT_SOFT }}
        >
          {badge.nombre}
        </motion.p>
        <motion.p
          className="text-sm text-text-muted"
          initial={reducir ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, delay: 0.14, ease: EASE_OUT_SOFT }}
        >
          {badge.descripcion}
        </motion.p>
      </div>
    </Modal>
  );
}
