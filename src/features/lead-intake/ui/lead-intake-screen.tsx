/**
 * Pantalla anfitriona de F1 (capa ui) — tasks.md 3.11.
 *
 * Anfitrion de la maquina de estados de 8 pantallas de design.md, todas
 * derivadas de `ConversationTurn` por `model/`: este componente no calcula
 * `carril`/score/capacidad, solo elige QUE sub-vista mostrar segun `phase`.
 * El consentimiento es el primer paso real: todo lo demas queda detras de
 * `ConsentNotice` hasta que se otorga.
 */

import { useEffect, useState, type ReactElement } from 'react';
import {
  Alert,
  Button,
  ConsentNotice,
  EmptyState,
  POLITICA_VERSION_DEFECTO,
  RUTA_POLITICA,
  Skeleton,
  TypingIndicator,
} from '@shared/ui';
import type { FinalidadTratamiento } from '@contracts';
import { useIntakeConversation } from '../model';
import { ChatShell } from './chat-shell';
import { IntakeOutcome } from './intake-outcome';

/**
 * PROPUESTA AL EQUIPO: `ConsentNotice` no exporta su lista de finalidades por
 * defecto (solo `POLITICA_VERSION_DEFECTO`/`RUTA_POLITICA`), asi que F1 la
 * repite aqui para poder mandarla en `submitConsent`. Exportar
 * `FINALIDADES_POR_DEFECTO` desde `shared/ui/consent-notice.tsx` evitaria
 * esta duplicacion — es la misma union cerrada de 3 valores en los dos
 * lugares, no un campo inventado.
 */
const FINALIDADES: readonly FinalidadTratamiento[] = [
  'perfilamiento_vivienda',
  'contacto_comercial',
  'educacion_financiera',
];

const CANAL = 'web-chat';

/**
 * Marco tipo telefono (boceto Design.pdf): la app es una columna centrada,
 * fondo crema alrededor, tarjeta blanca con esquinas redondeadas y sombra. En
 * movil ocupa toda la pantalla; en desktop flota como una tarjeta de mensajeria.
 */
function PhoneFrame({ children }: { children: ReactElement }): ReactElement {
  return (
    <div className="flex min-h-dvh justify-center bg-surface-2 sm:p-4">
      <main className="flex h-dvh w-full max-w-[460px] flex-col overflow-hidden bg-surface shadow-card sm:h-[calc(100dvh-2rem)] sm:rounded-card">
        {children}
      </main>
    </div>
  );
}

/** Contenedor scrollable para las fases que no son el chat (que gestiona su propio scroll). */
function Panel({ children }: { children: ReactElement }): ReactElement {
  return <div className="flex-1 overflow-y-auto scrollbar-slim p-4">{children}</div>;
}

export interface LeadIntakeScreenProps {
  /**
   * Se dispara UNA vez cuando el perfilamiento termina en carril `viable`, con
   * el `leadId` para que `app/` (client-flow) pase el control a F2.1. F1 no
   * conoce a F2.1: solo avisa "este lead es viable" y quien orquesta decide.
   */
  onViable?: (leadId: string) => void;
}

export function LeadIntakeScreen({ onViable }: LeadIntakeScreenProps = {}): ReactElement {
  const {
    phase,
    turn,
    messages,
    error,
    canUseFixture,
    isPending,
    start,
    acceptConsent,
    declineConsent,
    retryConsent,
    sendTurn,
    useFixture,
  } = useIntakeConversation();
  const [consentimientoMarcado, setConsentimientoMarcado] = useState(false);

  // Autogestionado (EQUIPO.md regla de UX): el jurado no debe hacer nada para
  // que arranque la conversacion.
  useEffect(() => {
    start();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- solo al montar
  }, []);

  // Handoff F1 -> F2.1: al cerrar en `viable`, avisa a `app/` con el leadId.
  useEffect(() => {
    if (phase === 'completado-viable' && turn !== null) {
      onViable?.(turn.profile.id);
    }
  }, [phase, turn, onViable]);

  if (phase === 'cargando') {
    return (
      <PhoneFrame>
        <Panel>
          <div aria-busy="true" className="flex flex-col gap-3">
            <Skeleton variant="text" lines={2} />
            <Skeleton variant="block" className="h-40" />
            <ul className="flex flex-col gap-2">
              <TypingIndicator />
            </ul>
          </div>
        </Panel>
      </PhoneFrame>
    );
  }

  if (phase === 'error') {
    return (
      <PhoneFrame>
        <Panel>
          <div className="flex flex-col gap-3">
            <Alert tone="danger" title="No pudimos continuar">
              {error?.message ?? 'Ocurrió un error inesperado. Intenta de nuevo.'}
            </Alert>
            {canUseFixture && (
              <Button variant="secondary" onClick={useFixture}>
                Ver datos de ejemplo
              </Button>
            )}
          </div>
        </Panel>
      </PhoneFrame>
    );
  }

  if (phase === 'consent-pendiente') {
    return (
      <PhoneFrame>
        <Panel>
          <div>
            <ConsentNotice
              aceptado={consentimientoMarcado}
              onChange={setConsentimientoMarcado}
              disabled={isPending}
              onContinue={() => {
                acceptConsent({
                  otorgado: true,
                  versionPolitica: POLITICA_VERSION_DEFECTO,
                  finalidades: [...FINALIDADES],
                  canal: CANAL,
                });
              }}
            />
            <div className="mt-3 flex justify-center">
              <Button variant="ghost" size="sm" disabled={isPending} onClick={declineConsent}>
                No, prefiero no continuar
              </Button>
            </div>
          </div>
        </Panel>
      </PhoneFrame>
    );
  }

  if (phase === 'consent-rechazado') {
    return (
      <PhoneFrame>
        <Panel>
          <EmptyState
            title="Entendido, no vamos a tratar tus datos"
            description="Puedes leer la política de tratamiento de datos cuando quieras, y volver a intentarlo en cualquier momento sin salir de esta página."
            action={
              <div className="flex flex-col items-center gap-2">
                <Button variant="primary" onClick={retryConsent}>
                  Volver a intentarlo
                </Button>
                <a
                  href={RUTA_POLITICA}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="focus-ring rounded-sm text-sm font-medium text-brand-700 underline underline-offset-2"
                >
                  Leer la política de tratamiento de datos
                </a>
              </div>
            }
          />
        </Panel>
      </PhoneFrame>
    );
  }

  if (phase === 'conversando') {
    if (turn === null) return <></>;
    return (
      <PhoneFrame>
        <ChatShell
          messages={messages}
          step={turn.siguientePaso}
          progreso={turn.progreso}
          isSending={isPending}
          onQuickReply={(value) => {
            // La burbuja muestra el `label` del chip ("Sí"), no el `value` ("true").
            const etiqueta =
              turn.siguientePaso?.quickReplies.find((q) => q.value === value)?.label ?? value;
            sendTurn({ texto: null, quickReplyValue: value, displayText: etiqueta });
          }}
          onFreeText={(texto) => {
            sendTurn({ texto, quickReplyValue: null });
          }}
          className="flex-1"
        />
      </PhoneFrame>
    );
  }

  // completado-viable | completado-no-viable | completado-sin-clasificar
  if (turn === null) return <></>;
  return (
    <PhoneFrame>
      <Panel>
        <IntakeOutcome turn={turn} />
      </Panel>
    </PhoneFrame>
  );
}
