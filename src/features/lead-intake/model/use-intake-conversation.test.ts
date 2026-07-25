/**
 * RED (tasks.md 3.3): transiciones del reducer a traves de los 8 estados de
 * pantalla; el ultimo turno queda cacheado en
 * `queryKeys.intake.conversation(leadId)`; nunca se toca `localStorage` /
 * `sessionStorage`.
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { createElement, type ReactElement, type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ConversationTurn } from '@contracts';
import { queryKeys } from '@shared/api/query-keys';

const startIntakeMock = vi.fn();
const submitConsentMock = vi.fn();
const submitTurnMock = vi.fn();

vi.mock('../api', () => ({
  startIntake: (...args: unknown[]): unknown => startIntakeMock(...args),
  submitConsent: (...args: unknown[]): unknown => submitConsentMock(...args),
  submitTurn: (...args: unknown[]): unknown => submitTurnMock(...args),
}));

const AHORA = '2026-07-25T14:00:00.000Z';

function perfilBase(overrides: Partial<ConversationTurn['profile']> = {}): ConversationTurn['profile'] {
  return {
    id: 'lead-1',
    consentimiento: null,
    identidad: null,
    nombre: null,
    email: null,
    telefono: null,
    edad: null,
    estadoCivil: null,
    ocupacion: null,
    esAfiliado: null,
    rangoSalarial: null,
    segmento: null,
    personasACargo: null,
    ciudad: null,
    segmentoFamiliar: null,
    ahorroDeclarado: null,
    capacidadAhorroMensual: null,
  tieneVivienda: null,
  vinculacionLaboral: null,
  horizonteCompra: null,
    slotsLlenos: [],
    capacidad: null,
    score: null,
    proyectos: [],
    carril: null,
    createdAt: AHORA,
    updatedAt: AHORA,
    ...overrides,
  };
}

const TURNO_CONSENT_PENDIENTE: ConversationTurn = {
  profile: perfilBase(),
  mensajes: [],
  siguientePaso: { id: 'p0', slot: null, tipo: 'consentimiento', permiteTextoLibre: false, quickReplies: [] },
  progreso: 0,
  routing: null,
};

const TURNO_CONVERSANDO: ConversationTurn = {
  profile: perfilBase({
    consentimiento: {
      otorgado: true,
      versionPolitica: 'v1.0-2026-07',
      finalidades: ['perfilamiento_vivienda'],
      otorgadoEn: AHORA,
      canal: 'web-chat',
    },
  }),
  mensajes: [{ id: 'm1', texto: 'hola', quickReplies: [], emisor: 'bot', enviadoEn: AHORA }],
  siguientePaso: {
    id: 'p1',
    slot: 'afiliacion',
    tipo: 'pregunta',
    permiteTextoLibre: true,
    quickReplies: [{ label: 'Sí', value: 'true' }],
  },
  progreso: 0.2,
  routing: null,
};

const CONSENTIMIENTO_OTORGADO = {
  otorgado: true,
  versionPolitica: 'v1.0-2026-07',
  finalidades: ['perfilamiento_vivienda'] as const,
  otorgadoEn: AHORA,
  canal: 'web-chat',
};

function turnoTerminal(carril: 'viable' | 'no_viable'): ConversationTurn {
  return {
    profile: perfilBase({ consentimiento: { ...CONSENTIMIENTO_OTORGADO, finalidades: [...CONSENTIMIENTO_OTORGADO.finalidades] }, carril }),
    mensajes: [],
    siguientePaso: null,
    progreso: 1,
    routing: { carril, razones: [], explicacion: 'listo', decididoEn: AHORA },
  };
}

const TURNO_SIN_CLASIFICAR: ConversationTurn = {
  profile: perfilBase({
    consentimiento: { ...CONSENTIMIENTO_OTORGADO, finalidades: [...CONSENTIMIENTO_OTORGADO.finalidades] },
  }),
  mensajes: [],
  siguientePaso: null,
  progreso: 1,
  routing: null,
};

function crearWrapper(): {
  Wrapper: (props: { children: ReactNode }) => ReactElement;
  queryClient: QueryClient;
} {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  function Wrapper({ children }: { children: ReactNode }): ReactElement {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  }
  return { Wrapper, queryClient };
}

describe('useIntakeConversation', () => {
  beforeEach(() => {
    startIntakeMock.mockReset();
    submitConsentMock.mockReset();
    submitTurnMock.mockReset();
  });

  it('arranca en fase cargando y pasa a consent-pendiente tras el start', async () => {
    startIntakeMock.mockResolvedValueOnce(TURNO_CONSENT_PENDIENTE);
    const { useIntakeConversation } = await import('./use-intake-conversation');
    const { result } = renderHook(() => useIntakeConversation(), { wrapper: crearWrapper().Wrapper });

    expect(result.current.phase).toBe('cargando');

    act(() => {
      result.current.start();
    });

    await waitFor(() => {
      expect(result.current.phase).toBe('consent-pendiente');
    });
  });

  it('declinar el consentimiento no llama a la API y pasa a consent-rechazado', async () => {
    startIntakeMock.mockResolvedValueOnce(TURNO_CONSENT_PENDIENTE);
    const { useIntakeConversation } = await import('./use-intake-conversation');
    const { result } = renderHook(() => useIntakeConversation(), { wrapper: crearWrapper().Wrapper });

    act(() => {
      result.current.start();
    });
    await waitFor(() => {
      expect(result.current.phase).toBe('consent-pendiente');
    });

    act(() => {
      result.current.declineConsent();
    });

    expect(result.current.phase).toBe('consent-rechazado');
    expect(submitConsentMock).not.toHaveBeenCalled();
  });

  it('retryConsent vuelve a consent-pendiente en la misma sesion, sin llamar a la API', async () => {
    startIntakeMock.mockResolvedValueOnce(TURNO_CONSENT_PENDIENTE);
    const { useIntakeConversation } = await import('./use-intake-conversation');
    const { result } = renderHook(() => useIntakeConversation(), { wrapper: crearWrapper().Wrapper });

    act(() => {
      result.current.start();
    });
    await waitFor(() => {
      expect(result.current.phase).toBe('consent-pendiente');
    });

    act(() => {
      result.current.declineConsent();
    });
    expect(result.current.phase).toBe('consent-rechazado');

    act(() => {
      result.current.retryConsent();
    });
    expect(result.current.phase).toBe('consent-pendiente');
    expect(submitConsentMock).not.toHaveBeenCalled();
  });

  it('aceptar el consentimiento pasa a conversando y cachea el turno en queryKeys.intake.conversation', async () => {
    startIntakeMock.mockResolvedValueOnce(TURNO_CONSENT_PENDIENTE);
    submitConsentMock.mockResolvedValueOnce(TURNO_CONVERSANDO);
    const { Wrapper, queryClient } = crearWrapper();
    const { useIntakeConversation } = await import('./use-intake-conversation');
    const { result } = renderHook(() => useIntakeConversation(), { wrapper: Wrapper });

    act(() => {
      result.current.start();
    });
    await waitFor(() => {
      expect(result.current.phase).toBe('consent-pendiente');
    });

    act(() => {
      result.current.acceptConsent({
        otorgado: true,
        versionPolitica: 'v1.0-2026-07',
        finalidades: ['perfilamiento_vivienda'],
        canal: 'web-chat',
      });
    });

    await waitFor(() => {
      expect(result.current.phase).toBe('conversando');
    });
    expect(result.current.turn).toEqual(TURNO_CONVERSANDO);
    expect(queryClient.getQueryData(queryKeys.intake.conversation(TURNO_CONVERSANDO.profile.id))).toEqual(
      TURNO_CONVERSANDO,
    );
  });

  it.each([
    ['viable', 'completado-viable'],
    ['no_viable', 'completado-no-viable'],
  ] as const)('turno terminal con carril %s pasa a %s', async (carril, faseEsperada) => {
    startIntakeMock.mockResolvedValueOnce(TURNO_CONVERSANDO);
    submitTurnMock.mockResolvedValueOnce(turnoTerminal(carril));
    const { useIntakeConversation } = await import('./use-intake-conversation');
    const { result } = renderHook(() => useIntakeConversation(), { wrapper: crearWrapper().Wrapper });

    act(() => {
      result.current.start();
    });
    await waitFor(() => {
      expect(result.current.phase).toBe('conversando');
    });

    act(() => {
      result.current.sendTurn({ texto: null, quickReplyValue: 'true' });
    });

    await waitFor(() => {
      expect(result.current.phase).toBe(faseEsperada);
    });
  });

  it('routing: null en un turno terminal pasa a completado-sin-clasificar (sin fixture)', async () => {
    startIntakeMock.mockResolvedValueOnce(TURNO_CONVERSANDO);
    submitTurnMock.mockResolvedValueOnce(TURNO_SIN_CLASIFICAR);
    const { useIntakeConversation } = await import('./use-intake-conversation');
    const { result } = renderHook(() => useIntakeConversation(), { wrapper: crearWrapper().Wrapper });

    act(() => {
      result.current.start();
    });
    await waitFor(() => {
      expect(result.current.phase).toBe('conversando');
    });

    act(() => {
      result.current.sendTurn({ texto: null, quickReplyValue: 'true' });
    });

    await waitFor(() => {
      expect(result.current.phase).toBe('completado-sin-clasificar');
    });
    expect(result.current.canUseFixture).toBe(false);
  });

  it('un error de red pasa a fase error y habilita el fallback de fixtures', async () => {
    startIntakeMock.mockRejectedValueOnce(
      Object.assign(new Error('offline'), { name: 'ApiRequestError', code: 'NETWORK_ERROR' }),
    );
    const { useIntakeConversation } = await import('./use-intake-conversation');
    const { result } = renderHook(() => useIntakeConversation(), { wrapper: crearWrapper().Wrapper });

    act(() => {
      result.current.start();
    });

    await waitFor(() => {
      expect(result.current.phase).toBe('error');
    });
    expect(result.current.canUseFixture).toBe(true);
  });

  it('un error que no es de conectividad no habilita el fallback de fixtures', async () => {
    startIntakeMock.mockRejectedValueOnce(
      Object.assign(new Error('validacion'), { name: 'ApiRequestError', code: 'VALIDATION_ERROR' }),
    );
    const { useIntakeConversation } = await import('./use-intake-conversation');
    const { result } = renderHook(() => useIntakeConversation(), { wrapper: crearWrapper().Wrapper });

    act(() => {
      result.current.start();
    });

    await waitFor(() => {
      expect(result.current.phase).toBe('error');
    });
    expect(result.current.canUseFixture).toBe(false);
  });

  it('nunca toca localStorage ni sessionStorage', async () => {
    const setLocal = vi.spyOn(Storage.prototype, 'setItem');
    startIntakeMock.mockResolvedValueOnce(TURNO_CONSENT_PENDIENTE);
    submitConsentMock.mockResolvedValueOnce(TURNO_CONVERSANDO);
    const { useIntakeConversation } = await import('./use-intake-conversation');
    const { result } = renderHook(() => useIntakeConversation(), { wrapper: crearWrapper().Wrapper });

    act(() => {
      result.current.start();
    });
    await waitFor(() => {
      expect(result.current.phase).toBe('consent-pendiente');
    });
    act(() => {
      result.current.acceptConsent({
        otorgado: true,
        versionPolitica: 'v1.0-2026-07',
        finalidades: ['perfilamiento_vivienda'],
        canal: 'web-chat',
      });
    });
    await waitFor(() => {
      expect(result.current.phase).toBe('conversando');
    });

    expect(setLocal).not.toHaveBeenCalled();
    setLocal.mockRestore();
  });
});
