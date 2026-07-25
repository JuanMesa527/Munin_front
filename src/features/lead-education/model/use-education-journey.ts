/**
 * Hook del journey de F2.2 (capa model).
 *
 * Siempre pide al backend el journey + snapshot del lead de F1. Sin fixtures
 * silenciosas: si falla la red, la UI muestra error/empty — no María Gómez.
 */

import { useQuery } from '@tanstack/react-query';
import { ApiRequestError } from '@shared/api/http-client';
import { queryKeys } from '@shared/api/query-keys';
import { fetchJourney } from '../api/education';
import type { JourneyView } from '../api/education';

export interface EducationJourneyState {
  data: JourneyView | undefined;
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
  refetch: () => void;
}

export function useEducationJourney(leadId: string): EducationJourneyState {
  const query = useQuery({
    queryKey: queryKeys.education.journey(leadId),
    queryFn: async (): Promise<JourneyView> => {
      const respuesta = await fetchJourney(leadId);
      if (!respuesta.ok) {
        throw new ApiRequestError(respuesta.error);
      }
      return respuesta.data;
    },
    enabled: leadId.length > 0,
    staleTime: 15_000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  return {
    data: query.data,
    isLoading: query.isPending,
    isError: query.isError,
    errorMessage:
      query.error instanceof Error ? query.error.message : query.isError ? 'No pudimos cargar tu camino.' : null,
    refetch: () => {
      void query.refetch();
    },
  };
}
