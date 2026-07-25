/**
 * Providers globales de la app.
 *
 * `reducedMotion: 'user'` en MotionConfig hace que TODA animacion de Motion
 * respete `prefers-reduced-motion` sin que cada componente tenga que acordarse
 * (requisito AA, WCAG 2.3.3). El CSS equivalente ya esta en styles/index.css.
 */

import { useState, type ReactElement, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MotionConfig } from 'motion/react';
import { ErrorBoundary } from './error-boundary';

function crearQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Un solo reintento: en una demo en vivo, tres reintentos son 45
        // segundos de spinner antes de que el jurado vea el error.
        retry: 1,
        refetchOnWindowFocus: false,
        staleTime: 30_000,
      },
    },
  });
}

export interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps): ReactElement {
  // En estado y no como constante de modulo: en StrictMode el modulo se evalua
  // una vez pero el arbol se monta dos, y compartir cache entre montajes
  // esconde bugs de invalidacion.
  const [queryClient] = useState(crearQueryClient);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <MotionConfig reducedMotion="user">{children}</MotionConfig>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
