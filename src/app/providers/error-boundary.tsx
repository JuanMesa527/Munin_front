/**
 * ErrorBoundary de la app (capa app).
 *
 * Unico lugar del frontend donde un error de render se atrapa antes de
 * volverse una pagina en blanco. Los detalles van a la consola, nunca a la
 * pantalla (EQUIPO.md regla 17, OWASP A09): un stack trace expuesto puede
 * filtrar rutas internas o datos que no le corresponden ver al usuario.
 *
 * Tiene que ser un componente de clase: React todavia no ofrece un hook para
 * atrapar errores de render de sus hijos.
 */

import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Alert } from '@shared/ui';

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
    // Solo consola: nunca se manda a un tercero (EQUIPO.md regla 15/19, sin
    // analytics externos) ni se pinta en pantalla.
    console.error('ErrorBoundary atrapó un error de render', error, info.componentStack);
  }

  override render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex h-full items-center justify-center p-4">
          <Alert tone="danger" title="Algo salió mal">
            Ocurrió un error inesperado. Intenta recargar la página; si el problema sigue,
            vuelve más tarde.
          </Alert>
        </div>
      );
    }

    return this.props.children;
  }
}
