/**
 * Deriva `obtenido` de cada logro del catálogo a partir del `EducationJourney`
 * real del lead (capa model, F2.2).
 *
 * `LOGROS_CATALOG` solo define la forma de presentación (icono/categoría/xp/
 * nombre/descripción). Acá se calcula, logro por logro, si el lead lo obtuvo
 * de verdad — mirando sus metas completadas, su ahorro y su plan — en vez de
 * leer un booleano fijo.
 *
 * Regla dura: si no hay una señal real en `EducationJourney` para un logro,
 * ese logro NO entra en `LOGRO_CONDICION` y queda `obtenido: false` siempre
 * (bloqueado). Preferimos un logro honesto y permanentemente bloqueado a uno
 * con una condición inventada o aproximada.
 */

import type { EducationJourney } from '@contracts';
import { LOGROS_CATALOG, type LogroCatalogItem, type LogroCategoria } from './logros.catalog';

function metaCompleta(journey: EducationJourney, metaId: string): boolean {
  return journey.metas.find((meta) => meta.id === metaId)?.completada ?? false;
}

/** Ids de las 6 lecciones granulares de "financiar" que usa la fixture de demo. */
const METAS_FINANCIAR_GRANULARES = [
  'meta-fin-1',
  'meta-fin-2',
  'meta-fin-3',
  'meta-fin-4',
  'meta-fin-5',
  'meta-fin-6',
] as const;

/**
 * La etapa "financiar" se modela distinto según el origen del journey:
 *  - Backend real (`buildGamifiedJourney`): una sola meta booleana
 *    `meta-edu-financiar`.
 *  - Fixture de demo (`JOURNEY_FIXTURE`): 6 metas granulares `meta-fin-1..6`.
 * Se resuelve mirando cuál de las dos formas está presente en `journey.metas`
 * en vez de asumir una sola.
 */
function etapaFinanciarCompleta(journey: EducationJourney): boolean {
  const granulares = journey.metas.filter((meta) => METAS_FINANCIAR_GRANULARES.includes(meta.id as (typeof METAS_FINANCIAR_GRANULARES)[number]));
  if (granulares.length > 0) {
    return granulares.every((meta) => meta.completada);
  }
  return metaCompleta(journey, 'meta-edu-financiar');
}

/** Como arriba, pero para saber si el lead avanzó en la etapa (no si la terminó). */
function algunaMetaFinanciarCompleta(journey: EducationJourney, idGranular: string): boolean {
  const tieneGranulares = journey.metas.some((meta) =>
    METAS_FINANCIAR_GRANULARES.includes(meta.id as (typeof METAS_FINANCIAR_GRANULARES)[number]),
  );
  if (tieneGranulares) return metaCompleta(journey, idGranular);
  return metaCompleta(journey, 'meta-edu-financiar');
}

/**
 * Condiciones reales por id de logro. Los ids que NO aparecen acá (p. ej.
 * `preguntón`, `sin-dudas`, `mentor`) no tienen todavía una señal real en el
 * contrato y quedan permanentemente bloqueados vía el fallback en
 * `logrosDesdeJourney`.
 */
const LOGRO_CONDICION: Partial<Record<string, (journey: EducationJourney) => boolean>> = {
  'primer-paso': (j) => j.metas.some((m) => m.completada),
  explorador: (j) => metaCompleta(j, 'meta-edu-descubrir'),
  calculador: (j) => metaCompleta(j, 'meta-edu-capacidad'),
  ahorrador: (j) => (j.metas.find((m) => m.id === 'meta-ahorro')?.alcanzado ?? 0) > 0,
  'credito-claro': (j) => algunaMetaFinanciarCompleta(j, 'meta-fin-1'),
  'sabio-sfv': (j) => algunaMetaFinanciarCompleta(j, 'meta-fin-2'),
  'meta-intermedio': (j) => j.progreso >= 0.5,
  'aprendiz-constante': (j) => {
    const porEtapa = new Map<string, number>();
    for (const meta of j.metas) {
      if (meta.tipo !== 'educacion' || !meta.completada || meta.etapa === undefined) continue;
      porEtapa.set(meta.etapa, (porEtapa.get(meta.etapa) ?? 0) + 1);
    }
    return [...porEtapa.values()].some((cantidad) => cantidad >= 3);
  },
  documentalista: (j) => metaCompleta(j, 'meta-doc'),
  'checklist-pro': (j) => metaCompleta(j, 'meta-doc'),
  conversador: (j) => metaCompleta(j, 'meta-edu-llegar'),
  'llaves-casa': (j) => j.progreso >= 1,
  'plan-cerrado': (j) => j.plan.mesesParaCalificar === 0,
  rompecabezas: (j) => etapaFinanciarCompleta(j),
  'hucha-llena': (j) => j.plan.gap <= 0 || (j.metas.find((m) => m.id === 'meta-ahorro')?.completada ?? false),
  simulador: (j) => metaCompleta(j, 'meta-edu-capacidad'),
  // "Contenidos leídos" no se cuenta en el contrato: se aproxima, igual que
  // `resumenAprendizaje` en `progreso-stats.ts`, contando metas tipo
  // 'educacion' completadas (cada una representa haber consumido el
  // microlearning curado de esa etapa).
  curiosidad: (j) => j.metas.filter((m) => m.tipo === 'educacion' && m.completada).length >= 5,
  // 'mapa-completo': sin señal real de "etapas revisadas" en el contrato
  //   (`journey.etapas` es un catálogo estático, no un registro de visitas):
  //   queda intencionalmente afuera, permanentemente bloqueado.
  // 'preguntón', 'sin-dudas', 'mentor': dependen del tracking de preguntas al
  //   asistente, que todavía no existe en `EducationJourney` — permanecen
  //   afuera a propósito.
};

const CATEGORIAS_ELEGIBLES_ESTRELLA: readonly LogroCategoria[] = [
  'explorador',
  'financiero',
  'preparado',
  'decidido',
];

/**
 * Calcula el `obtenido` real de cada logro del catálogo a partir del
 * `journey`. `estrella-camino` es un caso especial: depende de si OTRO logro
 * ya computado completó una categoría entera, así que se resuelve en una
 * segunda pasada sobre el resultado, no directamente sobre `journey`.
 */
export function logrosDesdeJourney(journey: EducationJourney): LogroCatalogItem[] {
  const base = LOGROS_CATALOG.map((item) => ({
    ...item,
    obtenido: LOGRO_CONDICION[item.id]?.(journey) ?? false,
  }));

  const categoriaCompleta = CATEGORIAS_ELEGIBLES_ESTRELLA.some((categoria) => {
    const deCategoria = base.filter((item) => item.categoria === categoria);
    return deCategoria.length > 0 && deCategoria.every((item) => item.obtenido);
  });

  return base.map((item) => (item.id === 'estrella-camino' ? { ...item, obtenido: categoriaCompleta } : item));
}
