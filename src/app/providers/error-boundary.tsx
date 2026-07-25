/**
 * Frontera de error de la app.
 *
 * OWASP A09: al usuario se le muestra un mensaje amable y NADA mas. El stack va
 * a la consola del navegador, nunca a la pantalla: un stack trace en pantalla
 * filtra rutas de archivos y estructura interna a cualquiera que mire.
 *
 * Es un class component porque `componentDidCatch` no tiene equivalente en hooks.
 */

import { Component, type ErrorInfo, type ReactNode } from 'react';

export interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  override state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    // `console.error` es el unico permitido por ESLint en este repo, y es el
    // lugar correcto: queda en la consola del dev, no en la UI del usuario.
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  override render(): ReactNode {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="flex min-h-screen items-center justify-center bg-console-paper px-4 font-display text-console-ink">
        <div className="max-w-[440px] text-center">
          <h1 className="mb-3 text-[28px] font-bold tracking-[-0.03em]">Algo se rompió</h1>
          <p className="mb-6 text-[15px] text-console-body">
            No pudimos mostrar esta pantalla. Vuelve a cargar la página; si sigue pasando, avísale
            al equipo.
          </p>
          <button
            type="button"
            onClick={() => {
              window.location.reload();
            }}
            className="focus-ring cursor-pointer rounded-full bg-console-ink px-6 py-3.5 text-[15px] font-bold text-console-signal transition-colors hover:bg-console-ink-3"
          >
            Recargar
          </button>
        </div>
      </div>
    );
  }
}
