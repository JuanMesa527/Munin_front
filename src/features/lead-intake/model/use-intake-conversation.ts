/**
 * Estado de la conversacion de F1 (capa model) — tasks.md 3.4.
 *
 * `useReducer` guarda mensajes + ultimo turno + fase; 3 `useMutation` de
 * TanStack Query llaman `api/` y alimentan el reducer con `dispatch`. El
 * ultimo turno se cachea bajo `queryKeys.intake.conversation(leadId)` solo
 * para que TanStack pueda deduplicar/inspeccionar — el estado real vive en
 * el reducer, no en el cache (regla: nada de `localStorage`/`sessionStorage`
 * para datos del lead, y esto tampoco lo es: el cache de TanStack vive en
 * memoria del proceso, se pierde al recargar).
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useReducer } from 'react';
import type { ChatMessage, ConversationTurn } from '@contracts';
import { queryKeys } from '@shared/api/query-keys';
import type { ApiRequestError } from '@shared/api/http-client';
import { startIntake, submitConsent, submitTurn, type SubmitConsentInput } from '../api';
import { FIXTURE_TURNS } from './lead-intake.fixtures';

export type IntakePhase =
  | 'cargando'
  | 'consent-pendiente'
  | 'consent-rechazado'
  | 'conversando'
  | 'completado-viable'
  | 'completado-no-viable'
  | 'completado-sin-clasificar'
  | 'error';

interface IntakeState {
  readonly turn: ConversationTurn | null;
  readonly messages: readonly ChatMessage[];
  readonly consentDeclined: boolean;
  readonly error: ApiRequestError | null;
  readonly usingFixture: boolean;
  readonly fixtureIndex: number;
  readonly phase: IntakePhase;
}

type Action =
  | { type: 'request/pending' }
  | { type: 'request/success'; turn: ConversationTurn }
  | { type: 'request/error'; error: ApiRequestError }
  | { type: 'consent/declined' }
  | { type: 'consent/retry' }
  | { type: 'turn/userMessage'; message: ChatMessage }
  | { type: 'fixture/start' }
  | { type: 'fixture/advance'; message?: ChatMessage };

const INITIAL_STATE: IntakeState = {
  turn: null,
  messages: [],
  consentDeclined: false,
  error: null,
  usingFixture: false,
  fixtureIndex: 0,
  phase: 'cargando',
};

/**
 * Deriva la fase de pantalla a partir del turno — tabla de estados de
 * design.md, sin logica de negocio: solo lee lo que el backend ya decidio.
 */
function derivePhase(input: {
  turn: ConversationTurn | null;
  consentDeclined: boolean;
  error: ApiRequestError | null;
}): IntakePhase {
  if (input.error !== null) return 'error';
  if (input.turn === null) return 'cargando';
  if (input.turn.profile.consentimiento === null) {
    return input.consentDeclined ? 'consent-rechazado' : 'consent-pendiente';
  }
  if (input.turn.siguientePaso !== null) return 'conversando';
  if (input.turn.routing === null) return 'completado-sin-clasificar';
  return input.turn.routing.carril === 'viable' ? 'completado-viable' : 'completado-no-viable';
}

function reducer(state: IntakeState, action: Action): IntakeState {
  switch (action.type) {
    case 'request/pending':
      return { ...state, error: null, phase: state.turn === null ? 'cargando' : state.phase };

    case 'request/success': {
      const messages = [...state.messages, ...action.turn.mensajes];
      return {
        ...state,
        turn: action.turn,
        messages,
        error: null,
        consentDeclined: false,
        phase: derivePhase({ turn: action.turn, consentDeclined: false, error: null }),
      };
    }

    case 'request/error':
      return {
        ...state,
        error: action.error,
        phase: derivePhase({ turn: state.turn, consentDeclined: state.consentDeclined, error: action.error }),
      };

    case 'consent/declined':
      return {
        ...state,
        consentDeclined: true,
        phase: derivePhase({ turn: state.turn, consentDeclined: true, error: null }),
      };

    case 'consent/retry':
      return {
        ...state,
        consentDeclined: false,
        phase: derivePhase({ turn: state.turn, consentDeclined: false, error: null }),
      };

    case 'turn/userMessage':
      return { ...state, messages: [...state.messages, action.message], error: null };

    case 'fixture/start': {
      const turn = FIXTURE_TURNS[0];
      if (turn === undefined) return state;
      return {
        ...state,
        usingFixture: true,
        fixtureIndex: 0,
        turn,
        messages: [...state.messages, ...turn.mensajes],
        error: null,
        consentDeclined: false,
        phase: derivePhase({ turn, consentDeclined: false, error: null }),
      };
    }

    case 'fixture/advance': {
      const siguienteIndice = Math.min(state.fixtureIndex + 1, FIXTURE_TURNS.length - 1);
      const turn = FIXTURE_TURNS[siguienteIndice];
      if (turn === undefined) return state;
      const conMensajeUsuario = action.message !== undefined ? [...state.messages, action.message] : state.messages;
      return {
        ...state,
        fixtureIndex: siguienteIndice,
        turn,
        messages: [...conMensajeUsuario, ...turn.mensajes],
        error: null,
        phase: derivePhase({ turn, consentDeclined: false, error: null }),
      };
    }

    default:
      return state;
  }
}

function esErrorDeConectividad(error: ApiRequestError | null): boolean {
  return error !== null && (error.code === 'NETWORK_ERROR' || error.code === 'TIMEOUT_ERROR');
}

function crearMensajeUsuario(texto: string): ChatMessage {
  return {
    id: `local-${String(Date.now())}-${Math.random().toString(36).slice(2, 8)}`,
    texto,
    emisor: 'usuario',
    enviadoEn: new Date().toISOString(),
  };
}

export interface UseIntakeConversationResult {
  phase: IntakePhase;
  turn: ConversationTurn | null;
  messages: readonly ChatMessage[];
  error: ApiRequestError | null;
  /** Solo `true` cuando el error es de conectividad (D9): unico momento en que se ofrece el fixture. */
  canUseFixture: boolean;
  usingFixture: boolean;
  isPending: boolean;
  start: () => void;
  acceptConsent: (input: SubmitConsentInput) => void;
  declineConsent: () => void;
  retryConsent: () => void;
  sendTurn: (input: {
    texto: string | null;
    quickReplyValue: string | null;
    /** Texto a mostrar en la burbuja del usuario. Para un chip, su `label`
     * (p. ej. "Sí"), no el `value` crudo ("true"). No se envia al backend. */
    displayText?: string;
  }) => void;
  useFixture: () => void;
}

export function useIntakeConversation(): UseIntakeConversationResult {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const queryClient = useQueryClient();

  const cacheTurn = useCallback(
    (turn: ConversationTurn) => {
      queryClient.setQueryData(queryKeys.intake.conversation(turn.profile.id), turn);
    },
    [queryClient],
  );

  const startMutation = useMutation<ConversationTurn, ApiRequestError>({
    mutationFn: startIntake,
    onMutate: () => {
      dispatch({ type: 'request/pending' });
    },
    onSuccess: (turn) => {
      dispatch({ type: 'request/success', turn });
      cacheTurn(turn);
    },
    onError: (error) => {
      dispatch({ type: 'request/error', error });
    },
  });

  const consentMutation = useMutation<ConversationTurn, ApiRequestError, SubmitConsentInput>({
    mutationFn: submitConsent,
    onMutate: () => {
      dispatch({ type: 'request/pending' });
    },
    onSuccess: (turn) => {
      dispatch({ type: 'request/success', turn });
      cacheTurn(turn);
    },
    onError: (error) => {
      dispatch({ type: 'request/error', error });
    },
  });

  const turnMutation = useMutation<
    ConversationTurn,
    ApiRequestError,
    { leadId: string; texto: string | null; quickReplyValue: string | null }
  >({
    mutationFn: submitTurn,
    onMutate: () => {
      dispatch({ type: 'request/pending' });
    },
    onSuccess: (turn) => {
      dispatch({ type: 'request/success', turn });
      cacheTurn(turn);
    },
    onError: (error) => {
      dispatch({ type: 'request/error', error });
    },
  });

  const start = useCallback(() => {
    startMutation.mutate();
  }, [startMutation]);

  const acceptConsent = useCallback(
    (input: SubmitConsentInput) => {
      if (state.usingFixture) {
        dispatch({ type: 'fixture/advance' });
        return;
      }
      consentMutation.mutate(input);
    },
    [consentMutation, state.usingFixture],
  );

  const declineConsent = useCallback(() => {
    dispatch({ type: 'consent/declined' });
  }, []);

  const retryConsent = useCallback(() => {
    dispatch({ type: 'consent/retry' });
  }, []);

  const sendTurn = useCallback(
    (input: { texto: string | null; quickReplyValue: string | null; displayText?: string }) => {
      // `displayText` solo alimenta la burbuja; NUNCA viaja al backend.
      const { displayText, ...payload } = input;
      const etiqueta = displayText ?? payload.texto ?? payload.quickReplyValue ?? '';
      const mensajeUsuario = etiqueta.length > 0 ? crearMensajeUsuario(etiqueta) : undefined;

      if (state.usingFixture) {
        dispatch({ type: 'fixture/advance', ...(mensajeUsuario !== undefined ? { message: mensajeUsuario } : {}) });
        return;
      }
      if (state.turn === null) return;
      if (mensajeUsuario !== undefined) dispatch({ type: 'turn/userMessage', message: mensajeUsuario });
      turnMutation.mutate({ leadId: state.turn.profile.id, ...payload });
    },
    [state.turn, state.usingFixture, turnMutation],
  );

  const useFixture = useCallback(() => {
    dispatch({ type: 'fixture/start' });
  }, []);

  return {
    phase: state.phase,
    turn: state.turn,
    messages: state.messages,
    error: state.error,
    canUseFixture: esErrorDeConectividad(state.error),
    usingFixture: state.usingFixture,
    isPending: startMutation.isPending || consentMutation.isPending || turnMutation.isPending,
    start,
    acceptConsent,
    declineConsent,
    retryConsent,
    sendTurn,
    useFixture,
  };
}
