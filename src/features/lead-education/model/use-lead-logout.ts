/**
 * Cierre de sesion del lead (F2.2) — capa model.
 *
 * Limpia todo el cache de `education` (sesion + journey) al terminar: si el
 * cliente vuelve a entrar por la cookie de `useLeadSession`, no debe quedar
 * ni un dato viejo del lead anterior.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiRequestError } from '@shared/api/http-client';
import { queryKeys } from '@shared/api/query-keys';
import { logoutLead } from '../api/lead-auth';

export function useLeadLogout(): {
  logout: () => void;
  isPending: boolean;
} {
  const queryClient = useQueryClient();

  const mutacion = useMutation({
    mutationFn: async () => {
      const respuesta = await logoutLead();
      if (!respuesta.ok) throw new ApiRequestError(respuesta.error);
    },
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: queryKeys.education.all });
    },
  });

  return {
    logout: () => {
      mutacion.mutate();
    },
    isPending: mutacion.isPending,
  };
}
