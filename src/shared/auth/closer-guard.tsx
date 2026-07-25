/**
 * CloserGuard - puerta de las rutas del closer (capa shared).
 *
 * ESTO ES UX, NO SEGURIDAD. Solo evita que alguien vea un dashboard vacio o
 * un parpadeo raro cuando no tiene sesion. La autorizacion REAL la impone el
 * backend en cada request (`requireCloser` + cookie httpOnly): cualquiera
 * puede saltarse este componente desde las devtools, y no pasa nada, porque el
 * servidor sigue diciendo 401. Regla OWASP: nunca confiar en el cliente.
 */

import { Navigate, Outlet } from 'react-router';
import type { ReactElement } from 'react';
import { Skeleton } from '../ui/skeleton';
import { useCloserSession } from './use-closer-session';

export function CloserGuard(): ReactElement {
  const { session, isLoading } = useCloserSession();

  if (isLoading) {
    return (
      <div
        aria-busy="true"
        aria-live="polite"
        className="mx-auto flex max-w-6xl flex-col gap-4 p-6"
      >
        <span className="sr-only">Verificando tu sesión…</span>
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 sm:grid-cols-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  // `replace` para que el boton "atras" no devuelva a una ruta protegida.
  if (session === null) return <Navigate to="/closer/login" replace />;

  return <Outlet />;
}
