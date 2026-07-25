/**
 * Modal de graduación del carril de nutrición (capa ui, F2.2).
 *
 * Cuando el backend reclasifica el `journey` a `viable`, la transición a F2.1
 * (`LeadEnrichmentScreen`) ya no es instantánea/silenciosa: primero se celebra
 * acá (confetti con los 3 colores de marca + este modal) y recién cuando el
 * lead confirma se dispara `onGraduar` en `client-flow.page.tsx`.
 *
 * Usa el `Modal` del DS (a diferencia de `OnboardingWelcomeModal`, que es un
 * diálogo custom): esta pantalla es un aviso simple de un solo CTA, no un
 * hero con pasos — el `Modal` compartido alcanza y no duplica foco/Escape/portal.
 */

import { useEffect, type ReactElement } from 'react';
import confetti from 'canvas-confetti';
import { useReducedMotion } from 'motion/react';
import { PartyPopper } from 'lucide-react';
import { Button, Modal } from '@shared/ui';

export interface GraduationModalProps {
  open: boolean;
  onVerProyectos: () => void;
}

/** Amarillo, azul y verde de marca (`src/styles/index.css`) — nada fuera de la paleta. */
const COLORES_CONFETTI = ['#ffd000', '#0067a3', '#2e9e4f'];

export function GraduationModal({ open, onVerProyectos }: GraduationModalProps): ReactElement | null {
  const reducirMovimiento = useReducedMotion() ?? false;

  useEffect(() => {
    // Respeta `prefers-reduced-motion`, igual que el resto de las animaciones de F2.2.
    if (!open || reducirMovimiento) return;

    void confetti({
      particleCount: 140,
      spread: 80,
      startVelocity: 42,
      origin: { y: 0.6 },
      colors: COLORES_CONFETTI,
    });
  }, [open, reducirMovimiento]);

  if (!open) return null;

  return (
    <Modal
      open={open}
      onClose={onVerProyectos}
      title="¡Lo lograste!"
      size="sm"
      closeOnOverlay={false}
      footer={
        <Button variant="accent" fullWidth onClick={onVerProyectos}>
          Ver proyectos
        </Button>
      }
    >
      <div className="flex flex-col items-center gap-3 py-2 text-center">
        <span
          aria-hidden="true"
          className="flex size-14 items-center justify-center rounded-full bg-accent-100 text-accent-700"
        >
          <PartyPopper className="size-7" />
        </span>
        <p className="text-sm leading-relaxed text-text">
          Cerraste la brecha que te separaba de tu vivienda propia: ahorro, documentos y afiliación
          quedaron al día. Ahora te vamos a llevar a revisar los{' '}
          <strong>proyectos de vivienda actuales de Colsubsidio</strong> para que evalúes cuál se
          ajusta a tu plan.
        </p>
      </div>
    </Modal>
  );
}
