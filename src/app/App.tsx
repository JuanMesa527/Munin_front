/**
 * Raiz de composicion de la app (capa app) — tasks.md 4.5.
 *
 * `ErrorBoundary` va por FUERA de todo: si algo revienta dentro del
 * `QueryClientProvider` o del router, el mensaje amable igual se muestra
 * (EQUIPO.md regla 17). Adentro, `AppQueryProvider` y `AppMotionProvider` no
 * dependen uno del otro, asi que el orden entre ellos es indistinto.
 */

import type { ReactElement } from 'react';
import { RouterProvider } from 'react-router';
import { AppMotionProvider, AppQueryProvider, ErrorBoundary } from './providers';
import { router } from './routes';

export function App(): ReactElement {
  return (
    <ErrorBoundary>
      <AppQueryProvider>
        <AppMotionProvider>
          <RouterProvider router={router} />
        </AppMotionProvider>
      </AppQueryProvider>
    </ErrorBoundary>
  );
}
