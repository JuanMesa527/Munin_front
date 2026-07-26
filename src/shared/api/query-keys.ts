/**
 * Factory de keys de TanStack Query (capa shared).
 *
 * Existe para que nadie escriba un array de key a mano: un typo en la key es
 * un cache que nunca se invalida y un bug imposible de ver. Las keys van de
 * lo general a lo especifico para poder invalidar por prefijo
 * (`invalidateQueries({ queryKey: queryKeys.closer.all })`).
 */

import type { LeadListFilters, LeadListSort } from '@contracts';

const LEADS = ['leads'] as const;
const CLOSER = ['closer'] as const;

export const queryKeys = {
  intake: {
    all: [...LEADS, 'intake'] as const,
    conversation: (leadId: string) => [...LEADS, 'intake', 'conversation', leadId] as const,
  },

  enrichment: {
    all: [...LEADS, 'enrichment'] as const,
    state: (leadId: string) => [...LEADS, 'enrichment', 'state', leadId] as const,
  },

  education: {
    all: [...LEADS, 'education'] as const,
    journey: (leadId: string) => [...LEADS, 'education', 'journey', leadId] as const,
    /** Login por OTP: sesion del lead resuelta contra la cookie httpOnly. */
    session: () => [...LEADS, 'education', 'session'] as const,
  },

  closer: {
    all: CLOSER,
    session: () => [...CLOSER, 'session'] as const,
    /**
     * Filtros y orden entran como objeto: TanStack los serializa de forma
     * estable (ordena claves), asi que dos filtros equivalentes comparten
     * cache sin importar el orden en que se construyeron.
     */
    leads: (
      filters: LeadListFilters,
      sort: LeadListSort,
      pagina: number,
      porPagina: number,
    ) => [...CLOSER, 'leads', { filters, sort, pagina, porPagina }] as const,
    briefing: (leadId: string) => [...CLOSER, 'leads', leadId, 'briefing'] as const,
  },
} as const;
