/**
 * Mutacion de progreso del journey (capa model, F2.2).
 *
 * POST al API y actualiza el cache preservando `lead` + `contenidos` del
 * snapshot F1 (el endpoint de progress solo devuelve el journey).
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ProgressEvent } from '@contracts';
import { ApiRequestError } from '@shared/api/http-client';
import { queryKeys } from '@shared/api/query-keys';
import { recordProgress } from '../api/education';
import type { JourneyView } from '../api/education';

export interface RegistrarProgresoInput {
  metaId: string;
  tipo: ProgressEvent['tipo'];
  valor: number;
}

export function useProgressEvent(leadId: string): {
  registrar: (input: RegistrarProgresoInput) => void;
  isPending: boolean;
} {
  const queryClient = useQueryClient();
  const queryKey = queryKeys.education.journey(leadId);

  const mutacion = useMutation({
    mutationFn: async (input: RegistrarProgresoInput) => {
      const cached = queryClient.getQueryData<JourneyView>(queryKey);
      const respuesta = await recordProgress({
        leadId,
        event: { tipo: input.tipo, metaId: input.metaId, valor: input.valor },
      });
      if (!respuesta.ok) throw new ApiRequestError(respuesta.error);
      if (cached === undefined) {
        throw new ApiRequestError({
          code: 'CACHE_MISS',
          message: 'No hay un journey cargado para actualizar.',
          fields: null,
        });
      }
      return {
        journey: respuesta.data,
        contenidos: cached.contenidos,
        lead: cached.lead,
      } satisfies JourneyView;
    },
    onSuccess: (view) => {
      queryClient.setQueryData(queryKey, view);
    },
  });

  return {
    registrar: (input: RegistrarProgresoInput) => {
      mutacion.mutate(input);
    },
    isPending: mutacion.isPending,
  };
}
