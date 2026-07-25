/**
 * Sesion del lead resuelta por OTP (F2.2, adenda A14) — capa model.
 *
 * Mismo criterio que `use-closer-session.ts`: el token vive en cookie httpOnly
 * que este codigo no puede leer, asi que la unica forma de saber si hay
 * sesion es preguntarle al servidor. Un 401 no es un error de la app, es
 * "no hay sesion" (o ya no perdio el `leadId` — sigue en el flujo normal de
 * F1/F2.2 en la misma pestana).
 */

import { useQuery } from '@tanstack/react-query';
import type { LeadSession } from '@contracts';
import { ApiRequestError } from '@shared/api/http-client';
import { queryKeys } from '@shared/api/query-keys';
import { fetchLeadSession } from '../api/lead-auth';

const SIN_SESION = new Set(['UNAUTHORIZED', 'FORBIDDEN']);

export interface LeadSessionState {
  session: LeadSession | null;
  isLoading: boolean;
}

export function useLeadSession(): LeadSessionState {
  const query = useQuery({
    queryKey: queryKeys.education.session(),
    queryFn: async (): Promise<LeadSession | null> => {
      const respuesta = await fetchLeadSession();
      if (!respuesta.ok) {
        if (SIN_SESION.has(respuesta.error.code)) return null;
        throw new ApiRequestError(respuesta.error);
      }
      return respuesta.data;
    },
    // Sin reintentos: reintentar un 401 solo demora mostrar el flujo normal de F1.
    retry: false,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  return {
    session: query.data ?? null,
    isLoading: query.isPending,
  };
}
