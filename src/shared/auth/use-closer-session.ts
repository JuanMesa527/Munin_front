/**
 * Hook de sesion del closer (capa shared).
 *
 * Pregunta al backend quien es el usuario actual. El token NUNCA pasa por
 * aqui: viaja en una cookie httpOnly que este codigo no puede leer, y por eso
 * la unica forma de saber si hay sesion es preguntarle al servidor.
 *
 * Un 401 no es un fallo de la app, es "no hay sesion": se traduce a `null`
 * para que el guard redirija al login en vez de mostrar pantalla de error.
 */

import { useQuery } from '@tanstack/react-query';
import { API_ROUTES, type CloserSession } from '@contracts';
import { ApiRequestError, apiGet } from '../api/http-client';
import { queryKeys } from '../api/query-keys';

export interface CloserSessionState {
  session: CloserSession | null;
  isLoading: boolean;
  isError: boolean;
  /** Fuerza una revalidacion, p. ej. despues del login. */
  refetch: () => void;
}

export function useCloserSession(): CloserSessionState {
  const query = useQuery({
    queryKey: queryKeys.closer.session(),
    queryFn: async (): Promise<CloserSession | null> => {
      const respuesta = await apiGet<CloserSession>(API_ROUTES.closer.session);

      if (!respuesta.ok) {
        if (respuesta.error.code === 'UNAUTHORIZED') return null;
        throw new ApiRequestError(respuesta.error);
      }

      return respuesta.data;
    },
    // Sin reintentos: reintentar un 401 solo demora la redireccion al login.
    retry: false,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  return {
    session: query.data ?? null,
    isLoading: query.isPending,
    isError: query.isError,
    refetch: () => {
      void query.refetch();
    },
  };
}
