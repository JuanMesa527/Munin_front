/**
 * Barrel de providers de `app/` (tasks.md 4.2).
 *
 * `App.tsx` compone estos tres a mano en vez de exponer un unico
 * `AppProviders` aqui: el orden de anidamiento (ErrorBoundary por fuera de
 * todo) es una decision de `App.tsx`, no algo que este barrel deba ocultar.
 */

export { AppQueryProvider, queryClient, type AppQueryProviderProps } from './query-client';
export { ErrorBoundary, type ErrorBoundaryProps } from './error-boundary';
export { AppMotionProvider, type AppMotionProviderProps } from './motion';
