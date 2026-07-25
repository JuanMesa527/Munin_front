/**
 * QueryClient de la app (capa app) — tasks.md 4.2.
 *
 * `retry: 1`: en una demo de hackathon un reintento agresivo (el default de
 * TanStack es 3, con backoff) hace que un backend caido se sienta colgado
 * mucho mas tiempo del necesario. `refetchOnWindowFocus: false`: el chat de
 * intake no tiene datos que se desactualicen por cambiar de pestaña, y
 * refetchear ahi solo arriesga reiniciar una mutacion en curso.
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactElement, ReactNode } from 'react';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

export interface AppQueryProviderProps {
  children: ReactNode;
}

export function AppQueryProvider({ children }: AppQueryProviderProps): ReactElement {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
