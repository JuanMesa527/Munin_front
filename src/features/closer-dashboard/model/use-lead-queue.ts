/**
 * Estado de la cola de leads (F3): filtro, busqueda y orden.
 *
 * El orden se resuelve en servidor (llega en la query) y el chip + texto se
 * aplican sobre la pagina ya cargada, que es lo que permite que el filtrado se
 * sienta instantaneo mientras el closer escribe.
 */

import { useMemo, useState } from 'react';
import type { LeadListSort, ViableLeadListItem } from '@contracts';
import {
  computeStats,
  matchesChip,
  matchesQuery,
  sortLeads,
  type QueueChip,
  type QueueStats,
} from './lead-queue';
import { useViableLeads } from './use-viable-leads';

export interface LeadQueueState {
  readonly visibles: readonly ViableLeadListItem[];
  readonly stats: QueueStats;
  readonly chip: QueueChip;
  readonly query: string;
  readonly sort: LeadListSort;
  readonly isLoading: boolean;
  readonly isDemo: boolean;
  readonly isEmpty: boolean;
  setChip: (chip: QueueChip) => void;
  setQuery: (query: string) => void;
  setSort: (sort: LeadListSort) => void;
}

export function useLeadQueue(sortInicial: LeadListSort = 'score_desc'): LeadQueueState {
  const [chip, setChip] = useState<QueueChip>('todos');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<LeadListSort>(sortInicial);

  const { leads, isLoading, isDemo } = useViableLeads(sort);

  const visibles = useMemo(
    () =>
      sortLeads(
        leads.filter((lead) => matchesChip(lead, chip) && matchesQuery(lead, query)),
        sort,
      ),
    [leads, chip, query, sort],
  );

  const stats = useMemo(() => computeStats(leads), [leads]);

  return {
    visibles,
    stats,
    chip,
    query,
    sort,
    isLoading,
    isDemo,
    // Vacio solo cuenta cuando ya cargo: si no, se pinta el skeleton.
    isEmpty: !isLoading && visibles.length === 0,
    setChip,
    setQuery,
    setSort,
  };
}
