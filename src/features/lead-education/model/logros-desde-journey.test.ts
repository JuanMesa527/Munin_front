import { describe, expect, it } from 'vitest';
import type { EducationJourney, EtapaId, Meta, NurturePlan } from '@contracts';
import { logrosDesdeJourney } from './logros-desde-journey';

const NOW = '2026-07-25T00:00:00.000Z';

const PLAN_CON_BRECHA: NurturePlan = {
  precioObjetivo: 146_115_000,
  subsidioEstimado: 32_470_000,
  gap: 105_645_000,
  mesesParaCalificar: 151,
  proyectoObjetivoId: 'vis-referencia',
  aplicaSubsidio: true,
};

function metaEducacion(id: string, etapa: EtapaId, completada: boolean): Meta {
  return {
    id,
    titulo: id,
    descripcion: id,
    tipo: 'educacion',
    objetivo: 1,
    alcanzado: completada ? 1 : 0,
    completada,
    puntos: 30,
    badgeId: null,
    etapa,
  };
}

function metaAhorro(alcanzado: number, objetivo = PLAN_CON_BRECHA.gap): Meta {
  return {
    id: 'meta-ahorro',
    titulo: 'Cerrá tu brecha de ahorro',
    descripcion: 'Registrá tus aportes hasta alcanzar la meta de ahorro.',
    tipo: 'ahorro',
    objetivo,
    alcanzado,
    completada: alcanzado >= objetivo,
    puntos: 100,
    badgeId: 'badge-ahorrador',
    etapa: 'capacidad',
  };
}

function metaDoc(completada: boolean): Meta {
  return {
    id: 'meta-doc',
    titulo: 'Reuní tus documentos',
    descripcion: 'Tené listo lo que te van a pedir para comprar.',
    tipo: 'documentacion',
    objetivo: 1,
    alcanzado: completada ? 1 : 0,
    completada,
    puntos: 50,
    badgeId: 'badge-preparado',
    etapa: 'prepararse',
  };
}

function journeyBase(overrides: Partial<EducationJourney> = {}): EducationJourney {
  return {
    leadId: 'lead-test',
    plan: PLAN_CON_BRECHA,
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

function obtenidoDe(journey: EducationJourney, id: string): boolean {
  const logro = logrosDesdeJourney(journey).find((l) => l.id === id);
  if (logro === undefined) throw new Error(`logro no encontrado en el catálogo: ${id}`);
  return logro.obtenido;
}

describe('logrosDesdeJourney', () => {
  it('un journey recién arrancado no tiene ningún logro obtenido', () => {
    const journey = journeyBase();
    const logros = logrosDesdeJourney(journey);
    expect(logros.every((l) => !l.obtenido)).toBe(true);
    expect(logros).toHaveLength(22);
  });

  it('primer-paso y explorador se obtienen al completar la primera meta educativa', () => {
    const journey = journeyBase({ metas: [metaEducacion('meta-edu-descubrir', 'descubrir', true)] });
    expect(obtenidoDe(journey, 'primer-paso')).toBe(true);
    expect(obtenidoDe(journey, 'explorador')).toBe(true);
  });

  it('calculador y simulador dependen de meta-edu-capacidad', () => {
    const sinCompletar = journeyBase({ metas: [metaEducacion('meta-edu-capacidad', 'capacidad', false)] });
    expect(obtenidoDe(sinCompletar, 'calculador')).toBe(false);
    expect(obtenidoDe(sinCompletar, 'simulador')).toBe(false);

    const completada = journeyBase({ metas: [metaEducacion('meta-edu-capacidad', 'capacidad', true)] });
    expect(obtenidoDe(completada, 'calculador')).toBe(true);
    expect(obtenidoDe(completada, 'simulador')).toBe(true);
  });

  it('ahorrador se obtiene con el primer aporte; hucha-llena solo cuando se cierra la brecha', () => {
    const primerAporte = journeyBase({ metas: [metaAhorro(1_000_000)] });
    expect(obtenidoDe(primerAporte, 'ahorrador')).toBe(true);
    expect(obtenidoDe(primerAporte, 'hucha-llena')).toBe(false);

    const brechaCerrada = journeyBase({ metas: [metaAhorro(PLAN_CON_BRECHA.gap)] });
    expect(obtenidoDe(brechaCerrada, 'hucha-llena')).toBe(true);

    const sinBrecha = journeyBase({ plan: { ...PLAN_CON_BRECHA, gap: 0 }, metas: [] });
    expect(obtenidoDe(sinBrecha, 'hucha-llena')).toBe(true);
  });

  it('credito-claro y sabio-sfv reconocen tanto la meta combinada del backend como las granulares de la fixture', () => {
    const backend = journeyBase({ metas: [metaEducacion('meta-edu-financiar', 'financiar', true)] });
    expect(obtenidoDe(backend, 'credito-claro')).toBe(true);
    expect(obtenidoDe(backend, 'sabio-sfv')).toBe(true);

    const fixtureParcial = journeyBase({
      metas: [
        metaEducacion('meta-fin-1', 'financiar', true),
        metaEducacion('meta-fin-2', 'financiar', false),
      ],
    });
    expect(obtenidoDe(fixtureParcial, 'credito-claro')).toBe(true);
    expect(obtenidoDe(fixtureParcial, 'sabio-sfv')).toBe(false);
  });

  it('rompecabezas exige las 6 lecciones granulares completas, o la meta combinada del backend', () => {
    const incompleto = journeyBase({
      metas: [
        metaEducacion('meta-fin-1', 'financiar', true),
        metaEducacion('meta-fin-2', 'financiar', true),
        metaEducacion('meta-fin-3', 'financiar', false),
      ],
    });
    expect(obtenidoDe(incompleto, 'rompecabezas')).toBe(false);

    const completo = journeyBase({
      metas: [
        metaEducacion('meta-fin-1', 'financiar', true),
        metaEducacion('meta-fin-2', 'financiar', true),
        metaEducacion('meta-fin-3', 'financiar', true),
        metaEducacion('meta-fin-4', 'financiar', true),
        metaEducacion('meta-fin-5', 'financiar', true),
        metaEducacion('meta-fin-6', 'financiar', true),
      ],
    });
    expect(obtenidoDe(completo, 'rompecabezas')).toBe(true);

    const backend = journeyBase({ metas: [metaEducacion('meta-edu-financiar', 'financiar', true)] });
    expect(obtenidoDe(backend, 'rompecabezas')).toBe(true);
  });

  it('aprendiz-constante exige 3+ lecciones completadas en la MISMA etapa', () => {
    const dosEtapasDistintas = journeyBase({
      metas: [
        metaEducacion('meta-edu-descubrir', 'descubrir', true),
        metaEducacion('meta-edu-capacidad', 'capacidad', true),
      ],
    });
    expect(obtenidoDe(dosEtapasDistintas, 'aprendiz-constante')).toBe(false);

    const tresEnFinanciar = journeyBase({
      metas: [
        metaEducacion('meta-fin-1', 'financiar', true),
        metaEducacion('meta-fin-2', 'financiar', true),
        metaEducacion('meta-fin-3', 'financiar', true),
      ],
    });
    expect(obtenidoDe(tresEnFinanciar, 'aprendiz-constante')).toBe(true);
  });

  it('documentalista y checklist-pro dependen de meta-doc; conversador de meta-edu-llegar', () => {
    const conDoc = journeyBase({ metas: [metaDoc(true)] });
    expect(obtenidoDe(conDoc, 'documentalista')).toBe(true);
    expect(obtenidoDe(conDoc, 'checklist-pro')).toBe(true);

    const conLlegar = journeyBase({ metas: [metaEducacion('meta-edu-llegar', 'llegar', true)] });
    expect(obtenidoDe(conLlegar, 'conversador')).toBe(true);
  });

  it('meta-intermedio y llaves-casa dependen del progreso agregado', () => {
    expect(obtenidoDe(journeyBase({ progreso: 0.4 }), 'meta-intermedio')).toBe(false);
    expect(obtenidoDe(journeyBase({ progreso: 0.5 }), 'meta-intermedio')).toBe(true);
    expect(obtenidoDe(journeyBase({ progreso: 0.9 }), 'llaves-casa')).toBe(false);
    expect(obtenidoDe(journeyBase({ progreso: 1 }), 'llaves-casa')).toBe(true);
  });

  it('plan-cerrado se obtiene cuando mesesParaCalificar llega a 0', () => {
    expect(obtenidoDe(journeyBase({ plan: { ...PLAN_CON_BRECHA, mesesParaCalificar: 1 } }), 'plan-cerrado')).toBe(
      false,
    );
    expect(obtenidoDe(journeyBase({ plan: { ...PLAN_CON_BRECHA, mesesParaCalificar: 0 } }), 'plan-cerrado')).toBe(
      true,
    );
  });

  it('curiosidad exige 5 o más metas educativas completadas (aproximación honesta de "contenidos leídos")', () => {
    const cuatro = journeyBase({
      metas: [
        metaEducacion('meta-edu-descubrir', 'descubrir', true),
        metaEducacion('meta-edu-capacidad', 'capacidad', true),
        metaEducacion('meta-fin-1', 'financiar', true),
        metaEducacion('meta-fin-2', 'financiar', true),
      ],
    });
    expect(obtenidoDe(cuatro, 'curiosidad')).toBe(false);

    const cinco = journeyBase({
      metas: [
        metaEducacion('meta-edu-descubrir', 'descubrir', true),
        metaEducacion('meta-edu-capacidad', 'capacidad', true),
        metaEducacion('meta-fin-1', 'financiar', true),
        metaEducacion('meta-fin-2', 'financiar', true),
        metaEducacion('meta-fin-3', 'financiar', true),
      ],
    });
    expect(obtenidoDe(cinco, 'curiosidad')).toBe(true);
  });

  it('preguntón, sin-dudas, mentor y mapa-completo quedan permanentemente bloqueados: no hay señal real para ellos', () => {
    // Journey "perfecto": todo completo, progreso al 100%. Ni así se destraban,
    // porque no dependen de ninguna señal de EducationJourney.
    const journeyPerfecto = journeyBase({
      progreso: 1,
      plan: { ...PLAN_CON_BRECHA, gap: 0, mesesParaCalificar: 0 },
      metas: [
        metaEducacion('meta-edu-descubrir', 'descubrir', true),
        metaEducacion('meta-edu-capacidad', 'capacidad', true),
        metaEducacion('meta-edu-financiar', 'financiar', true),
        metaEducacion('meta-edu-llegar', 'llegar', true),
        metaAhorro(PLAN_CON_BRECHA.gap),
        metaDoc(true),
      ],
    });
    expect(obtenidoDe(journeyPerfecto, 'preguntón')).toBe(false);
    expect(obtenidoDe(journeyPerfecto, 'sin-dudas')).toBe(false);
    expect(obtenidoDe(journeyPerfecto, 'mentor')).toBe(false);
    expect(obtenidoDe(journeyPerfecto, 'mapa-completo')).toBe(false);
  });

  it('estrella-camino se obtiene cuando TODOS los logros de una categoría completa (ej. financiero) están obtenidos', () => {
    const financieroCompleto = journeyBase({
      plan: { ...PLAN_CON_BRECHA, gap: 0 },
      metas: [
        metaEducacion('meta-edu-capacidad', 'capacidad', true), // calculador + simulador
        metaAhorro(1), // ahorrador
        metaEducacion('meta-edu-financiar', 'financiar', true), // credito-claro + sabio-sfv + rompecabezas
      ],
    });
    expect(obtenidoDe(financieroCompleto, 'estrella-camino')).toBe(true);
  });

  it('estrella-camino sigue bloqueado si ninguna categoría se completó del todo', () => {
    const parcial = journeyBase({ metas: [metaEducacion('meta-edu-capacidad', 'capacidad', true)] });
    expect(obtenidoDe(parcial, 'estrella-camino')).toBe(false);
  });
});
