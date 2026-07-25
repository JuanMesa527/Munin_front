/**
 * RED (tasks.md 3.10): los 8 estados de pantalla incl. `Skeleton`/`EmptyState`/
 * `Alert`; declinar -> reintentar en la misma sesion sin tocar la API; copia
 * "estimado" nunca "aprobado"; nunca se muestra `estrato` como factor.
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ConversationTurn } from '@contracts';
import type { ApiRequestError } from '@shared/api/http-client';
import type { UseIntakeConversationResult } from '../model';

const startMock = vi.fn();
const acceptConsentMock = vi.fn();
const declineConsentMock = vi.fn();
const retryConsentMock = vi.fn();
const sendTurnMock = vi.fn();
const useFixtureMock = vi.fn();
const useIntakeConversationMock = vi.fn<() => UseIntakeConversationResult>();

vi.mock('../model', () => ({
  useIntakeConversation: (): UseIntakeConversationResult => useIntakeConversationMock(),
}));

const AHORA = '2026-07-25T14:00:00.000Z';

function perfilBase(overrides: Partial<ConversationTurn['profile']> = {}): ConversationTurn['profile'] {
  return {
    id: 'lead-1',
    consentimiento: null,
    identidad: null,
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
    createdAt: AHORA,
    updatedAt: AHORA,
    ...overrides,
  };
}

function baseResult(overrides: Partial<UseIntakeConversationResult> = {}): UseIntakeConversationResult {
  return {
    phase: 'cargando',
    turn: null,
    messages: [],
    error: null,
    canUseFixture: false,
    usingFixture: false,
    isPending: false,
    start: startMock,
    acceptConsent: acceptConsentMock,
    declineConsent: declineConsentMock,
    retryConsent: retryConsentMock,
    sendTurn: sendTurnMock,
    useFixture: useFixtureMock,
    ...overrides,
  };
}

async function renderScreen(overrides: Partial<UseIntakeConversationResult> = {}): Promise<void> {
  useIntakeConversationMock.mockReturnValue(baseResult(overrides));
  const { LeadIntakeScreen } = await import('./lead-intake-screen');
  render(<LeadIntakeScreen />);
}

describe('LeadIntakeScreen', () => {
  beforeEach(() => {
    startMock.mockReset();
    acceptConsentMock.mockReset();
    declineConsentMock.mockReset();
    retryConsentMock.mockReset();
    sendTurnMock.mockReset();
    useFixtureMock.mockReset();
    useIntakeConversationMock.mockReset();
  });

  it('cargando: llama start() al montar y muestra Skeleton + indicador de escritura', async () => {
    await renderScreen({ phase: 'cargando' });

    expect(startMock).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('status', { name: /escribiendo/i })).toBeInTheDocument();
  });

  it('consent-pendiente: acepta y llama acceptConsent con el shape esperado', async () => {
    const user = userEvent.setup();
    await renderScreen({
      phase: 'consent-pendiente',
      turn: {
        profile: perfilBase(),
        mensajes: [],
        siguientePaso: { id: 'p0', slot: null, tipo: 'consentimiento', permiteTextoLibre: false, quickReplies: [] },
        progreso: 0,
        routing: null,
      },
    });

    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: /acepto y contin/i }));

    expect(acceptConsentMock).toHaveBeenCalledTimes(1);
    const input = acceptConsentMock.mock.calls[0]?.[0] as { otorgado: boolean; finalidades: string[] };
    expect(input.otorgado).toBe(true);
    expect(input.finalidades.length).toBeGreaterThan(0);
  });

  it('consent-pendiente: declinar llama declineConsent, nunca la API', async () => {
    const user = userEvent.setup();
    await renderScreen({ phase: 'consent-pendiente' });

    await user.click(screen.getByRole('button', { name: /no, prefiero no/i }));

    expect(declineConsentMock).toHaveBeenCalledTimes(1);
    expect(acceptConsentMock).not.toHaveBeenCalled();
  });

  it('consent-rechazado: tarjeta respetuosa con link a politica y reintento en la misma sesion', async () => {
    const user = userEvent.setup();
    await renderScreen({ phase: 'consent-rechazado' });

    expect(screen.getByRole('link', { name: /pol[ií]tica/i })).toHaveAttribute(
      'href',
      '/politica-de-datos',
    );

    await user.click(screen.getByRole('button', { name: /reconsiderar|volver a intentar|cambiar de opini/i }));
    expect(retryConsentMock).toHaveBeenCalledTimes(1);
  });

  it('conversando: renderiza el chat y nunca dice "aprobado" ni muestra estrato', async () => {
    const turn: ConversationTurn = {
      profile: perfilBase({
        consentimiento: {
          otorgado: true,
          versionPolitica: 'v1.0-2026-07',
          finalidades: ['perfilamiento_vivienda'],
          otorgadoEn: AHORA,
          canal: 'web-chat',
        },
      }),
      mensajes: [{ id: 'm1', texto: '¿Estás afiliado?', quickReplies: [], emisor: 'bot', enviadoEn: AHORA }],
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
    await renderScreen({ phase: 'conversando', turn, messages: turn.mensajes });

    expect(screen.getByText('¿Estás afiliado?')).toBeInTheDocument();
    expect(document.body.textContent.toLowerCase()).not.toContain('aprobado');
    expect(document.body.textContent.toLowerCase()).not.toContain('estrato');
  });

  it('completado-viable: renderiza el resultado con FactorBars', async () => {
    const turn: ConversationTurn = {
      profile: perfilBase({
        carril: 'viable',
        score: {
          valor: 80,
          factores: [
            { nombre: 'Afiliación', peso: 0.4, valor: 'Afiliado', contribucion: 20, intensidad: 100 },
          ],
          weightsVersion: 'v-test',
          calculadoEn: AHORA,
        },
      }),
      mensajes: [],
      siguientePaso: null,
      progreso: 1,
      routing: { carril: 'viable', razones: [], explicacion: 'Vas muy bien.', decididoEn: AHORA },
    };
    await renderScreen({ phase: 'completado-viable', turn });

    expect(screen.getByText('Vas muy bien.')).toBeInTheDocument();
    expect(screen.getByText(/por qué este puntaje/i)).toBeInTheDocument();
  });

  it('completado-sin-clasificar: mensaje honesto, sin score ni switch de fixtures', async () => {
    const turn: ConversationTurn = {
      profile: perfilBase(),
      mensajes: [{ id: 'm1', texto: 'No pudimos calcular tu puntaje.', quickReplies: [], emisor: 'bot', enviadoEn: AHORA }],
      siguientePaso: null,
      progreso: 1,
      routing: null,
    };
    await renderScreen({ phase: 'completado-sin-clasificar', turn });

    expect(screen.getByText('No pudimos calcular tu puntaje.')).toBeInTheDocument();
    expect(screen.queryByText(/por qué este puntaje/i)).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /ver ejemplo|datos de demostraci[oó]n|fixture/i }),
    ).not.toBeInTheDocument();
  });

  it('error de conectividad: Alert con el mensaje del backend y boton de datos de ejemplo', async () => {
    const user = userEvent.setup();
    const error: ApiRequestError = Object.assign(new Error('No pudimos conectarnos.'), {
      name: 'ApiRequestError',
      code: 'NETWORK_ERROR',
      fields: null,
    });
    await renderScreen({ phase: 'error', error, canUseFixture: true });

    expect(screen.getByText('No pudimos conectarnos.')).toBeInTheDocument();
    const boton = screen.getByRole('button', { name: /ver datos de ejemplo/i });
    await user.click(boton);
    expect(useFixtureMock).toHaveBeenCalledTimes(1);
  });

  it('error de validacion (no conectividad): sin boton de datos de ejemplo', async () => {
    const error: ApiRequestError = Object.assign(new Error('Dato inválido.'), {
      name: 'ApiRequestError',
      code: 'VALIDATION_ERROR',
      fields: null,
    });
    await renderScreen({ phase: 'error', error, canUseFixture: false });

    expect(screen.getByText('Dato inválido.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /ver datos de ejemplo/i })).not.toBeInTheDocument();
  });
});
