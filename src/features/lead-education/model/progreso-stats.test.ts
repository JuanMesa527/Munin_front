import { describe, expect, it } from 'vitest';
import type { EducationJourney, Meta, NurturePlan } from '@contracts';
import { evolucionAprendizaje } from './progreso-stats';

const NOW = '2026-07-25T00:00:00.000Z';

const PLAN: NurturePlan = {
  precioObjetivo: 146_115_000,
  subsidioEstimado: 32_470_000,
  cuotaInicialObjetivo: 29_223_000,
  gap: 105_645_000,
  mesesParaCalificar: 151,
  proyectoObjetivoId: 'vis-referencia',
  aplicaSubsidio: true,
};

function meta(overrides: Partial<Meta> & { id: string }): Meta {
  return {
    titulo: overrides.id,
    descripcion: overrides.id,
    tipo: 'educacion',
    objetivo: 1,
    alcanzado: 0,
    completada: false,
    puntos: 30,
    badgeId: null,
    ...overrides,
  };
}

function journeyBase(overrides: Partial<EducationJourney> = {}): EducationJourney {
  return {
    leadId: 'lead-test',
    plan: PLAN,
    metas: [],
    progreso: 0,
    puntosTotales: 0,
    badges: [],
    reclasificadoAViable: false,
    razonesIngreso: ['ahorro_insuficiente'],
    actualizadoEn: NOW,
    ...overrides,
  };
}

describe('evolucionAprendizaje', () => {
  it('sin metas completadas devuelve [] en vez de fabricar una curva', () => {
    const journey = journeyBase({
      metas: [meta({ id: 'm1' }), meta({ id: 'm2' })],
    });
    expect(evolucionAprendizaje(journey)).toEqual([]);
  });

  it('con exactamente 1 meta completada con fecha real devuelve [] (insuficiente para trazar curva)', () => {
    const journey = journeyBase({
      metas: [
        meta({ id: 'm1', completada: true, alcanzado: 1, completadaEn: '2026-07-25T10:00:00.000Z' }),
        meta({ id: 'm2' }),
      ],
    });
    expect(evolucionAprendizaje(journey)).toEqual([]);
  });

  it('con 2+ metas completadas con fecha real, deriva los puntos de esas fechas reales, ordenados cronológicamente', () => {
    const journey = journeyBase({
      metas: [
        meta({ id: 'm1', completada: true, alcanzado: 1, completadaEn: '2026-07-20T09:00:00.000Z' }),
        meta({ id: 'm2', completada: true, alcanzado: 1, completadaEn: '2026-07-18T09:00:00.000Z' }),
        meta({ id: 'm3' }),
        meta({ id: 'm4' }),
      ],
    });

    const puntos = evolucionAprendizaje(journey);

    expect(puntos).toHaveLength(2);
    // Orden cronológico ascendente: m2 (18/07) antes que m1 (20/07), pese a venir después en `metas`.
    expect(puntos[0]?.etiqueta).toBe(
      new Date('2026-07-18T09:00:00.000Z').toLocaleDateString('es-CO', { day: '2-digit', month: 'short' }),
    );
    expect(puntos[1]?.etiqueta).toBe(
      new Date('2026-07-20T09:00:00.000Z').toLocaleDateString('es-CO', { day: '2-digit', month: 'short' }),
    );
    // 1 de 4 metas-que-cuentan completada hasta el primer punto, luego 2 de 4.
    expect(puntos[0]?.porcentaje).toBe(25);
    expect(puntos[1]?.porcentaje).toBe(50);
  });

  it('ignora metas opcionales (adenda A12) tanto para el total como para el numerador', () => {
    const journey = journeyBase({
      metas: [
        meta({ id: 'm1', completada: true, alcanzado: 1, completadaEn: '2026-07-18T09:00:00.000Z' }),
        meta({ id: 'm2', completada: true, alcanzado: 1, completadaEn: '2026-07-20T09:00:00.000Z' }),
        meta({ id: 'm-opcional', opcional: true, completada: true, alcanzado: 1, completadaEn: '2026-07-19T09:00:00.000Z' }),
      ],
    });

    const puntos = evolucionAprendizaje(journey);

    // Solo m1 y m2 cuentan: 1/2 -> 50%, 2/2 -> 100%. La opcional no aparece ni suma al total.
    expect(puntos).toHaveLength(2);
    expect(puntos[0]?.porcentaje).toBe(50);
    expect(puntos[1]?.porcentaje).toBe(100);
  });

  it('ignora metas completadas sin `completadaEn` (datos previos a la adenda A15) para construir los puntos, pero las cuenta en el total', () => {
    const journey = journeyBase({
      metas: [
        meta({ id: 'm-sin-fecha', completada: true, alcanzado: 1 }),
        meta({ id: 'm1', completada: true, alcanzado: 1, completadaEn: '2026-07-18T09:00:00.000Z' }),
        meta({ id: 'm2', completada: true, alcanzado: 1, completadaEn: '2026-07-20T09:00:00.000Z' }),
      ],
    });

    const puntos = evolucionAprendizaje(journey);

    expect(puntos).toHaveLength(2);
    // Total de metas-que-cuentan es 3 (incluye la sin fecha), por eso 1/3 y 2/3, no 1/2 y 2/2.
    expect(puntos[0]?.porcentaje).toBe(33);
    expect(puntos[1]?.porcentaje).toBe(67);
  });
});
