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
import { cn } from '@shared/lib/cn';
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
 * Frame full-bleed de F1: chrome de borde a borde, sin columna tipo telefono
 * ni margenes laterales. El contenido de lectura (consent, outcome) se centra
 * con max-w-3xl; el chat gestiona su propio ancho interno.
 */
function ChatFrame({
  children,
  tone = 'plain',
}: {
  children: ReactElement;
  /** `cream` = fondo suave para pantallas de lectura (consent/outcome). */
  tone?: 'plain' | 'cream';
}): ReactElement {
  return (
    <div
      className={cn(
        'flex min-h-dvh w-full flex-col',
        tone === 'cream' ? 'bg-surface-3' : 'bg-surface',
      )}
    >
      <main className="flex h-dvh w-full flex-col overflow-hidden">{children}</main>
    </div>
  );
}

/** Contenedor scrollable para las fases que no son el chat (que gestiona su propio scroll). */
function Panel({ children }: { children: ReactElement }): ReactElement {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center overflow-y-auto scrollbar-slim px-4 py-5 sm:px-6 sm:py-6">
      {children}
    </div>
  );
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
      <ChatFrame>
        <Panel>
          <div aria-busy="true" className="flex flex-col gap-3">
            <Skeleton variant="text" lines={2} />
            <Skeleton variant="block" className="h-40" />
            <ul className="flex flex-col gap-2">
              <li>
                <TypingIndicator />
              </li>
            </ul>
          </div>
        </Panel>
      </ChatFrame>
    );
  }

  if (phase === 'error') {
    return (
      <ChatFrame>
        <Panel>
          <div className="flex flex-col gap-3">
            <Alert tone="danger" title="No pudimos continuar">
              {error?.message ?? 'Ocurrió un error inesperado. Intenta de nuevo.'}
            </Alert>
            {canUseFixture && (
              <Button variant="secondary" onClick={useFixture}>
                Continuar con perfil de respaldo
              </Button>
            )}
          </div>
        </Panel>
      </ChatFrame>
    );
  }

  if (phase === 'consent-pendiente') {
    return (
      <ChatFrame tone="cream">
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
            <div className="mt-4 flex justify-center">
              <Button variant="ghost" size="sm" disabled={isPending} onClick={declineConsent}>
                No, prefiero no continuar
              </Button>
            </div>
          </div>
        </Panel>
      </ChatFrame>
    );
  }

  if (phase === 'consent-rechazado') {
    return (
      <ChatFrame tone="cream">
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
      </ChatFrame>
    );
  }

  if (phase === 'conversando') {
    if (turn === null) return <></>;
    return (
      <ChatFrame>
        <ChatShell
          messages={messages}
          step={turn.siguientePaso}
          progreso={turn.progreso}
          profile={turn.profile}
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
      </ChatFrame>
    );
  }

  // completado-viable | completado-no-viable | completado-sin-clasificar
  if (turn === null) return <></>;
  return (
    <ChatFrame>
      <Panel>
        <IntakeOutcome turn={turn} />
      </Panel>
    </ChatFrame>
  );
}
