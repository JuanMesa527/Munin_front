/**
 * Logica de la cola de leads (F3) — funciones puras, sin React.
 *
 * Estan aparte del hook para poder testearlas: son deterministas y son lo que
 * el jurado ve primero, asi que un fallo silencioso aqui se nota.
 *
 * OJO: esto NO decide viabilidad ni recalcula el score. Eso ya lo hizo el
 * backend (glass-box). Aqui solo se ORDENA y se FILTRA lo que ya llego
 * clasificado.
 */

import type { LeadListSort, ViableLeadListItem } from '@contracts';

/** Atajos de la barra de filtros. Cubren las 3 preguntas del closer al abrir. */
export type QueueChip = 'todos' | 'alta' | 'afiliados' | 'nutridos';

export interface QueueChipOption {
  readonly key: QueueChip;
  readonly label: string;
}

export const QUEUE_CHIPS: readonly QueueChipOption[] = [
  { key: 'todos', label: 'Todos' },
  { key: 'alta', label: 'Alta prioridad' },
  { key: 'afiliados', label: 'Afiliados' },
  { key: 'nutridos', label: 'Nutridos' },
];

export interface SortOption {
  readonly key: LeadListSort;
  readonly label: string;
}

export const SORT_OPTIONS: readonly SortOption[] = [
  { key: 'score_desc', label: 'Probabilidad de cierre' },
  { key: 'capacidad_desc', label: 'Capacidad estimada' },
  { key: 'recencia_desc', label: 'Más reciente' },
];

/** Corte de "alta prioridad". Es el umbral con el que el closer arranca el dia. */
export const UMBRAL_ALTA_PRIORIDAD = 80;

export function matchesChip(lead: ViableLeadListItem, chip: QueueChip): boolean {
  switch (chip) {
    case 'alta':
      return lead.score >= UMBRAL_ALTA_PRIORIDAD;
    case 'afiliados':
      return lead.esAfiliado;
    case 'nutridos':
      return lead.vieneDeNutricion;
    case 'todos':
      return true;
  }
}

/**
 * Busca sobre nombre, zona, ocupacion y MEJOR match: son los ganchos con los
 * que un comercial recuerda a alguien despues de una llamada.
 *
 * Solo el mejor match, no todos los proyectos afines: la fila lleva unicamente
 * `proyectoTop` (del contrato, para no resolver N proyectos por fila), y buscar
 * por algo que no esta en pantalla desconcierta mas de lo que ayuda. Si hace
 * falta buscar en todos, va en servidor y por POST (ver la nota de privacidad
 * en `closer-dashboard.api.ts`).
 */
export function matchesQuery(lead: ViableLeadListItem, query: string): boolean {
  const termino = query.trim().toLowerCase();
  if (termino.length === 0) return true;

  const heno = [
    lead.nombre,
    lead.ciudad ?? '',
    lead.ocupacion ?? '',
    lead.proyectoTop?.nombre ?? '',
  ]
    .join(' ')
    .toLowerCase();

  return heno.includes(termino);
}

export function sortLeads(
  leads: readonly ViableLeadListItem[],
  sort: LeadListSort,
): ViableLeadListItem[] {
  const copia = [...leads];

  switch (sort) {
    case 'capacidad_desc':
      return copia.sort((a, b) => (b.capacidadEstimada ?? 0) - (a.capacidadEstimada ?? 0));
    case 'recencia_desc':
      // Orden real por fecha. El mock del diseno ordenaba por nombre porque no
      // tenia timestamps; el contrato si trae `actualizadoEn`, y la etiqueta
      // "Mas reciente" tiene que cumplir lo que promete.
      return copia.sort((a, b) => b.actualizadoEn.localeCompare(a.actualizadoEn));
    case 'intent_desc':
      return copia.sort((a, b) => b.intentScore - a.intentScore);
    case 'score_desc':
      return copia.sort((a, b) => b.score - a.score);
  }
}

export interface QueueStats {
  readonly total: number;
  readonly avgScore: number;
  readonly pctAfiliados: number;
  readonly nutridos: number;
}

/**
 * Se calculan sobre la cola COMPLETA, no sobre la filtrada: son el titular del
 * dia del comercial y no deben moverse cuando toca un chip.
 */
export function computeStats(leads: readonly ViableLeadListItem[]): QueueStats {
  const total = leads.length;
  if (total === 0) return { total: 0, avgScore: 0, pctAfiliados: 0, nutridos: 0 };

  const sumaScore = leads.reduce((acc, l) => acc + l.score, 0);
  const afiliados = leads.filter((l) => l.esAfiliado).length;

  return {
    total,
    avgScore: Math.round(sumaScore / total),
    pctAfiliados: Math.round((afiliados / total) * 100),
    nutridos: leads.filter((l) => l.vieneDeNutricion).length,
  };
}
