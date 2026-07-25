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

export function LeadIntakeScreen(): ReactElement {
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

  if (phase === 'cargando') {
    return (
      <div aria-busy="true" className="flex h-full flex-col gap-3 p-4">
        <Skeleton variant="text" lines={2} />
        <Skeleton variant="block" className="h-40" />
        <ul className="flex flex-col gap-2">
          <TypingIndicator />
        </ul>
      </div>
    );
  }

  if (phase === 'error') {
    return (
      <div className="flex h-full flex-col gap-3 p-4">
        <Alert tone="danger" title="No pudimos continuar">
          {error?.message ?? 'Ocurrió un error inesperado. Intenta de nuevo.'}
        </Alert>
        {canUseFixture && (
          <Button variant="secondary" onClick={useFixture}>
            Ver datos de ejemplo
          </Button>
        )}
      </div>
    );
  }

  if (phase === 'consent-pendiente') {
    return (
      <div className="p-4">
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
    );
  }

  if (phase === 'consent-rechazado') {
    return (
      <div className="p-4">
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
                className="focus-ring rounded-sm text-sm font-medium text-brand-700 underline underline-offset-2 dark:text-brand-300"
              >
                Leer la política de tratamiento de datos
              </a>
            </div>
          }
        />
      </div>
    );
  }

  if (phase === 'conversando') {
    if (turn === null) return <></>;
    return (
      <ChatShell
        messages={messages}
        step={turn.siguientePaso}
        progreso={turn.progreso}
        isSending={isPending}
        onQuickReply={(value) => {
          sendTurn({ texto: null, quickReplyValue: value });
        }}
        onFreeText={(texto) => {
          sendTurn({ texto, quickReplyValue: null });
        }}
      />
    );
  }

  // completado-viable | completado-no-viable | completado-sin-clasificar
  if (turn === null) return <></>;
  return (
    <div className="p-4">
      <IntakeOutcome turn={turn} />
    </div>
  );
}
