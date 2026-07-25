/**
 * Carga la ficha de llamada de un lead (F4).
 *
 * Igual que en F3: pide al backend y cae a los datos semilla en modo demo si el
 * motor todavia no existe. La UI consume `BriefingSheet` en los dos casos.
 */

import { useQuery } from '@tanstack/react-query';
import type { BriefingSheet } from '@contracts';
import { queryKeys } from '@shared/api/query-keys';
import { env } from '@shared/config/env';
import { SEED_BRIEFINGS } from '@shared/demo';
import { fetchBriefing } from '../api/closer-briefing.api';

export interface BriefingState {
  briefing: BriefingSheet | null;
  isLoading: boolean;
  /** `true` cuando la ficha viene de los datos semilla. */
  isDemo: boolean;
  /** Mensaje listo para mostrar, o `null`. Nunca un stack trace (OWASP A09). */
  error: string | null;
}

export function useBriefing(leadId: string): BriefingState {
  const query = useQuery({
    queryKey: queryKeys.closer.briefing(leadId),
    queryFn: async (): Promise<{ sheet: BriefingSheet; demo: boolean }> => {
      const respuesta = await fetchBriefing(leadId);
      if (respuesta.ok) return { sheet: respuesta.data, demo: false };

      const semilla = SEED_BRIEFINGS[leadId];
      if (env.demoMode && semilla !== undefined) return { sheet: semilla, demo: true };

      throw new Error(respuesta.error.message);
    },
    retry: false,
    staleTime: 30_000,
  });

  return {
    briefing: query.data?.sheet ?? null,
    isLoading: query.isPending,
    isDemo: query.data?.demo ?? false,
    error: query.isError ? 'No pudimos cargar la ficha de este lead.' : null,
  };
}
