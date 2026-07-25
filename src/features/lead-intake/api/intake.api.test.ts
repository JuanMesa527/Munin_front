/**
 * RED (tasks.md 3.1): `startIntake`/`submitConsent`/`submitTurn` deben llamar
 * `unwrap(apiPost(API_ROUTES.intake.*, body))` — nunca `fetch` directo, nunca
 * una URL inventada.
 */
import { describe, expect, it, vi } from 'vitest';
import { API_ROUTES } from '@contracts';
import type { ConversationTurn } from '@contracts';
import type * as HttpClientModule from '@shared/api/http-client';

const apiPostMock = vi.fn();

vi.mock('@shared/api/http-client', async () => {
  const actual = await vi.importActual<typeof HttpClientModule>('@shared/api/http-client');
  return {
    ...actual,
    apiPost: (...args: unknown[]): unknown => apiPostMock(...args),
  };
});

const TURNO_FICTICIO: ConversationTurn = {
  profile: {
    id: 'lead-test-1',
    consentimiento: null,
    nombre: null,
    email: null,
    telefono: null,
    edad: null,
    estadoCivil: null,
    esAfiliado: null,
    rangoSalarial: null,
    segmento: null,
    personasACargo: null,
    ciudad: null,
    segmentoFamiliar: null,
    ahorroDeclarado: null,
    capacidadAhorroMensual: null,
    slotsLlenos: [],
    capacidad: null,
    score: null,
    proyectos: [],
    carril: null,
    createdAt: '2026-07-25T10:00:00.000Z',
    updatedAt: '2026-07-25T10:00:00.000Z',
  },
  mensajes: [],
  siguientePaso: {
    id: 'paso-consentimiento',
    slot: null,
    tipo: 'consentimiento',
    permiteTextoLibre: false,
    quickReplies: [],
  },
  progreso: 0,
  routing: null,
};

describe('intake.api', () => {
  it('startIntake llama unwrap(apiPost(API_ROUTES.intake.start)) sin body', async () => {
    apiPostMock.mockResolvedValueOnce({ ok: true, data: TURNO_FICTICIO });
    const { startIntake } = await import('./intake.api');

    const resultado = await startIntake();

    expect(apiPostMock).toHaveBeenCalledWith(API_ROUTES.intake.start);
    expect(resultado).toEqual(TURNO_FICTICIO);
  });

  it('submitConsent llama unwrap(apiPost(API_ROUTES.intake.consent, input))', async () => {
    apiPostMock.mockResolvedValueOnce({ ok: true, data: TURNO_FICTICIO });
    const { submitConsent } = await import('./intake.api');

    const input = {
      otorgado: true,
      versionPolitica: 'v1.0-2026-07',
      finalidades: ['perfilamiento_vivienda'] as const,
      canal: 'web-chat',
    };
    const resultado = await submitConsent({ ...input, finalidades: [...input.finalidades] });

    expect(apiPostMock).toHaveBeenCalledWith(API_ROUTES.intake.consent, {
      ...input,
      finalidades: [...input.finalidades],
    });
    expect(resultado).toEqual(TURNO_FICTICIO);
  });

  it('submitTurn llama unwrap(apiPost(API_ROUTES.intake.turn, input))', async () => {
    apiPostMock.mockResolvedValueOnce({ ok: true, data: TURNO_FICTICIO });
    const { submitTurn } = await import('./intake.api');

    const input = { leadId: 'lead-test-1', texto: null, quickReplyValue: 'si' };
    const resultado = await submitTurn(input);

    expect(apiPostMock).toHaveBeenCalledWith(API_ROUTES.intake.turn, input);
    expect(resultado).toEqual(TURNO_FICTICIO);
  });

  it('propaga el error tipado cuando el backend responde ok:false', async () => {
    apiPostMock.mockResolvedValueOnce({
      ok: false,
      error: { code: 'VALIDATION_ERROR', message: 'Dato invalido', fields: null },
    });
    const { submitTurn } = await import('./intake.api');

    await expect(
      submitTurn({ leadId: 'lead-test-1', texto: 'hola', quickReplyValue: null }),
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
  });
});
