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
  /** Fecha límite de la meta de ahorro (adenda A10). Ortogonal a `tipo`/`valor`. */
  fechaObjetivo?: string;
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
        ...(input.fechaObjetivo !== undefined ? { fechaObjetivo: input.fechaObjetivo } : {}),
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
        // `ritmoAhorro` es derivado por el backend a partir de `aportes`/
        // `fechaObjetivo`: la respuesta del POST solo trae `journey`, asi que
        // se conserva el ultimo valor conocido hasta que el `invalidateQueries`
        // de abajo traiga el recalculo fresco del GET.
        ...(cached.ritmoAhorro !== undefined ? { ritmoAhorro: cached.ritmoAhorro } : {}),
      } satisfies JourneyView;
    },
    onSuccess: (view) => {
      queryClient.setQueryData(queryKey, view);
      // Si este evento reclasifico al lead a `viable`, `app/client-flow.page`
      // esta a punto de desmontar esta pantalla (regla de dominio: F2.2 solo
      // sirve leads `no_viable`). Un refetch en ese momento pega contra un
      // backend que ahora rechaza el leadId — no vale la pena, y era la causa
      // de los fallos en cascada que agotaban el rate limit al completar el
      // ahorro. El numero fresco de `ritmoAhorro` ya no importa: el usuario se
      // va a F2.1.
      if (!view.journey.reclasificadoAViable) {
        void queryClient.invalidateQueries({ queryKey });
      }
    },
  });

  return {
    registrar: (input: RegistrarProgresoInput) => {
      mutacion.mutate(input);
    },
    isPending: mutacion.isPending,
  };
}
