/**
 * I/O de F5 · call-simulation. Capa: api.
 *
 * Todo pasa por `@shared/api/http-client` y usa `API_ROUTES` del contrato,
 * como el resto del front: ningun componente hace `fetch` a mano.
 */

import type {
  CallDifficulty,
  CallScorecard,
  CallSimulationSession,
  CallTurn,
  PersonaContext,
  TranscriptionResult,
  UtteranceAudio,
} from '@contracts';
import { API_ROUTES } from '@contracts';
import { apiPost, unwrap } from '@shared/api/http-client';

export function startCall(
  leadId: string,
  dificultad: CallDifficulty,
  persona: PersonaContext,
): Promise<CallSimulationSession> {
  return unwrap(
    apiPost<CallSimulationSession>(API_ROUTES.closer.call.start, {
      leadId,
      dificultad,
      persona,
    }),
  );
}

export function sendCallTurn(callId: string, closerDijo: string): Promise<CallTurn> {
  return unwrap(apiPost<CallTurn>(API_ROUTES.closer.call.turn, { callId, closerDijo }));
}

export function endCall(callId: string): Promise<CallScorecard> {
  return unwrap(apiPost<CallScorecard>(API_ROUTES.closer.call.end, { callId }));
}

/**
 * Voz del closer -> texto. Va contra NUESTRO backend y no contra la Web Speech
 * API para que el dictado funcione en cualquier navegador.
 *
 * El `callId` NO avanza la llamada: sirve para que el backend guarde este tramo
 * de voz y pueda archivar la grabacion al colgar. El closer sigue revisando y
 * corrigiendo el texto antes de enviar el turno.
 */
export function transcribeUtterance(
  audio: UtteranceAudio,
  callId: string | null,
): Promise<TranscriptionResult> {
  return unwrap(
    apiPost<TranscriptionResult>(API_ROUTES.closer.call.transcribe, {
      ...audio,
      ...(callId === null ? {} : { callId }),
    }),
  );
}
