/**
 * Raiz de la app: providers + router. Nada mas.
 *
 * `AppProviders` deja el `ErrorBoundary` por FUERA de todo: si algo revienta
 * dentro del `QueryClientProvider` o del router, el mensaje amable igual se
 * muestra.
 */

import type { ReactElement } from 'react';
import { RouterProvider } from 'react-router';
import { AppProviders } from './providers/app-providers';
import { router } from './routes';

export function App(): ReactElement {
  return (
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  );
}
