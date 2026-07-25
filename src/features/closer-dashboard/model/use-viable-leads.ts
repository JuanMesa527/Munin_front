/**
 * Carga la cola de leads viables (F3).
 *
 * Pide la lista al backend y, si todavia no existe, cae a los datos semilla en
 * modo demo. Ese fallback es lo que permite que la pantalla se pueda ensenar al
 * jurado desde la primera hora sin esperar al motor, y desaparece con solo
 * borrar la rama de `catch`: la UI habla el contrato en los dos casos.
 */

import { useQuery } from '@tanstack/react-query';
import type { LeadListFilters, LeadListSort, ViableLeadListItem } from '@contracts';
import { queryKeys } from '@shared/api/query-keys';
import { env } from '@shared/config/env';
import { SEED_LIST_ITEMS } from '@shared/demo';
import { fetchViableLeads } from '../api/closer-dashboard.api';

/** Filtros que se resuelven en servidor. El texto libre se filtra local. */
const FILTROS_SERVIDOR: LeadListFilters = {
  soloAfiliados: null,
  soloNutridos: null,
  segmento: null,
  ciudad: null,
  scoreMinimo: null,
  banda: null,
  busqueda: null,
};

const PAGINA = 1;
const POR_PAGINA = 50;

export interface ViableLeadsState {
  leads: readonly ViableLeadListItem[];
  isLoading: boolean;
  /** `true` cuando la pantalla se esta alimentando de los datos semilla. */
  isDemo: boolean;
}

export function useViableLeads(sort: LeadListSort): ViableLeadsState {
  const query = useQuery({
    queryKey: queryKeys.closer.leads(FILTROS_SERVIDOR, sort, PAGINA, POR_PAGINA),
    queryFn: async (): Promise<{ items: readonly ViableLeadListItem[]; demo: boolean }> => {
      const respuesta = await fetchViableLeads({
        filters: FILTROS_SERVIDOR,
        sort,
        pagina: PAGINA,
        porPagina: POR_PAGINA,
      });

      if (respuesta.ok) return { items: respuesta.data.items, demo: false };

      // Sin backend, la demo sigue en pie. Fuera de modo demo preferimos
      // fallar visiblemente antes que ensenar datos inventados como si fueran
      // la cola real del comercial.
      if (env.demoMode) return { items: SEED_LIST_ITEMS, demo: true };

      throw new Error(respuesta.error.message);
    },
    retry: false,
    staleTime: 30_000,
  });

  return {
    leads: query.data?.items ?? [],
    isLoading: query.isPending,
    isDemo: query.data?.demo ?? false,
  };
}
