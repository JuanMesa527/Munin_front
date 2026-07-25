/**
 * RED (tasks.md 3.6): `completado-sin-clasificar` (routing:null) solo muestra
 * el mensaje honesto de cierre — nunca `FactorBars`/score, y nunca un switch
 * de fixtures, ni siquiera cuando el turno viene de un backend real.
 */
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { ConversationTurn } from '@contracts';
import { IntakeOutcome } from './intake-outcome';

const AHORA = '2026-07-25T14:00:00.000Z';

function perfilBase(overrides: Partial<ConversationTurn['profile']> = {}): ConversationTurn['profile'] {
  return {
    id: 'lead-1',
    consentimiento: {
      otorgado: true,
      versionPolitica: 'v1.0-2026-07',
      finalidades: ['perfilamiento_vivienda'],
      otorgadoEn: AHORA,
      canal: 'web-chat',
    },
    identidad: null,
    nombre: 'María Demo',
    email: 'maria.demo@example.com',
    telefono: '3001234567',
    edad: 27,
    estadoCivil: 'Soltero/a',
    ocupacion: 'Independiente',
    esAfiliado: true,
    rangoSalarial: '4-6 SMMLV',
    segmento: null,
    personasACargo: null,
    ciudad: 'Bogotá',
    segmentoFamiliar: 'Pareja con hijos',
    ahorroDeclarado: 30_000_000,
    capacidadAhorroMensual: 900_000,
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

describe('IntakeOutcome', () => {
  it('routing:null (DATA_UNAVAILABLE real) solo muestra el mensaje honesto de cierre', () => {
    const turn: ConversationTurn = {
      profile: perfilBase(),
      mensajes: [
        { id: 'm1', texto: 'No logramos calcular tu puntaje con los datos disponibles.', quickReplies: [], emisor: 'bot', enviadoEn: AHORA },
      ],
      siguientePaso: null,
      progreso: 1,
      routing: null,
    };

    render(<IntakeOutcome turn={turn} />);

    expect(
      screen.getByText('No logramos calcular tu puntaje con los datos disponibles.'),
    ).toBeInTheDocument();
    expect(screen.queryByText(/por qué este puntaje/i)).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /ver ejemplo|datos de demostraci[oó]n|fixture/i }),
    ).not.toBeInTheDocument();
  });

  it('completado-viable muestra explicacion, razon del proyecto y FactorBars', () => {
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
        proyectos: [
          {
            proyectoId: 'p1',
            similitud: 0.9,
            razon: 'Calza con tu ciudad y tu ahorro.',
            nombre: 'Proyecto 1',
            etapa: 'Etapa 1',
            precioDesde: 180_000_000,
            tipologia: 'VIS · 3 hab',
            confianza: 1,
            datosFaltantes: [],
            cabeEnCapacidad: true,
          },
        ],
      }),
      mensajes: [],
      siguientePaso: null,
      progreso: 1,
      routing: {
        carril: 'viable',
        razones: [],
        explicacion: 'Tu perfil cumple los criterios de viabilidad.',
        decididoEn: AHORA,
      },
    };

    render(<IntakeOutcome turn={turn} />);

    expect(screen.getByText('Tu perfil cumple los criterios de viabilidad.')).toBeInTheDocument();
    expect(screen.getByText('Calza con tu ciudad y tu ahorro.')).toBeInTheDocument();
    expect(screen.getByText(/por qué este puntaje/i)).toBeInTheDocument();
    expect(screen.getByText('Afiliación')).toBeInTheDocument();
  });

  it('completado-no-viable usa tono "todavía no", nunca "no calificas"', () => {
    const turn: ConversationTurn = {
      profile: perfilBase({
        carril: 'no_viable',
        score: {
          valor: 30,
          factores: [
            { nombre: 'Ahorro declarado', peso: 0.3, valor: 'Bajo', contribucion: -5, intensidad: 15 },
          ],
          weightsVersion: 'v-test',
          calculadoEn: AHORA,
        },
      }),
      mensajes: [],
      siguientePaso: null,
      progreso: 1,
      routing: {
        carril: 'no_viable',
        razones: ['ahorro_insuficiente'],
        explicacion: 'Todavía no cumples con el ahorro mínimo, pero puedes seguir avanzando.',
        decididoEn: AHORA,
      },
    };

    const { container } = render(<IntakeOutcome turn={turn} />);

    expect(screen.getAllByText(/todavía no/i).length).toBeGreaterThan(0);
    expect(container.textContent.toLowerCase()).not.toContain('no calificas');
  });

  it('nunca renderiza FactorBars cuando profile.score es null', () => {
    const turn: ConversationTurn = {
      profile: perfilBase({ carril: 'viable', score: null }),
      mensajes: [],
      siguientePaso: null,
      progreso: 1,
      routing: { carril: 'viable', razones: [], explicacion: 'Vas bien.', decididoEn: AHORA },
    };

    render(<IntakeOutcome turn={turn} />);

    expect(screen.queryByText(/por qué este puntaje/i)).not.toBeInTheDocument();
  });
});
