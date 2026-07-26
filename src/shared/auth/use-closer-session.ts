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
import { env } from '../config/env';

export interface CloserSessionState {
  session: CloserSession | null;
  isLoading: boolean;
  isError: boolean;
  /** Fuerza una revalidacion, p. ej. despues del login. */
  refetch: () => Promise<boolean>;
}

/**
 * Sesion ficticia para poder recorrer la consola cuando el backend todavia
 * no existe.
 *
 * POR QUE ESTO NO ES UN HUECO DE SEGURIDAD:
 *  1. Solo existe si `VITE_DEMO_MODE=true`, que es una bandera de BUILD. El
 *     bundle de produccion se compila con `false` y esta rama desaparece.
 *  2. Nunca se activa cuando el servidor DECIDE sobre la autorizacion: un 401 o
 *     un 403 devuelven `null` y el guard manda al login, como siempre.
 *  3. Aunque alguien la forzara, no consigue nada. Este objeto no es un token:
 *     la autorizacion real la impone el backend en cada request contra la cookie
 *     httpOnly, y sin ella todos los endpoints del closer siguen dando 401
 *     (OWASP A01 — el cliente nunca decide permisos).
 */
const SESION_DEMO: CloserSession = {
  closerId: 'demo-closer',
  nombre: 'Sofía Marín',
  rol: 'closer',
  expiraEn: '2026-07-31T23:59:59.000Z',
};

/**
 * Decisiones de autorizacion del servidor. Estas SIEMPRE ganan sobre el modo
 * demo; cualquier otro fallo (no hay backend, el proxy no alcanza el upstream,
 * un 500) se trata como "todavia no hay motor" y deja pasar a la demo.
 */
const DECISIONES_DE_AUTORIZACION = new Set(['UNAUTHORIZED', 'FORBIDDEN']);

export function useCloserSession(): CloserSessionState {
  const query = useQuery({
    queryKey: queryKeys.closer.session(),
    queryFn: async (): Promise<CloserSession | null> => {
      const respuesta = await apiGet<CloserSession>(API_ROUTES.closer.session);

      if (!respuesta.ok) {
        if (DECISIONES_DE_AUTORIZACION.has(respuesta.error.code)) return null;
        if (env.demoMode) return SESION_DEMO;
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
    refetch: async () => {
      const result = await query.refetch();
      return result.isSuccess && result.data !== null;
    },
  };
}
