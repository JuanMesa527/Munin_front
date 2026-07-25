/**
 * Raiz de la app: providers + router. Nada mas.
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
