/**
 * Marco de la aplicacion: cabecera fija + area de contenido. Capa: app.
 *
 * Pensado para ESCRITORIO primero -- el jurado va a recorrerlo en un portatil,
 * no en un telefono -- y colapsa a una columna en movil. La cabecera es blanca
 * con un borde de un pixel, como en el sistema de Colsubsidio: el color se
 * reserva para los bloques de contenido, no para el cromado.
 *
 * SOBRE EL LOGO: es el logotipo oficial de Colsubsidio, porque esto es una
 * entrega al hackaton que la propia Colsubsidio organiza y evalua. El aviso de
 * demo del pie deja explicito que es un prototipo y no un producto suyo
 * aprobado (EQUIPO.md seccion 8).
 */

import type { ReactElement, ReactNode } from 'react';

export interface AppShellProps {
  /** Se muestra a la derecha de la cabecera: contexto o accion secundaria. */
  acciones?: ReactNode;
  children: ReactNode;
}

export function AppShell({ acciones, children }: AppShellProps): ReactElement {
  return (
    <div className="flex min-h-dvh flex-col bg-surface">
      <header className="sticky top-0 z-30 border-b border-border bg-surface/95 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-[1400px] items-center justify-between gap-6 px-5 lg:px-10">
          <div className="flex items-center gap-4">
            <img
              src="/colsubsidio.png"
              alt="Colsubsidio"
              className="h-7 w-auto dark:brightness-0 dark:invert"
            />
            <span aria-hidden="true" className="hidden h-6 w-px bg-border sm:block" />
            <p className="label-mono hidden text-text-subtle sm:block">
              Perfilador de vivienda
            </p>
          </div>

          {acciones}
        </div>
      </header>

      <div className="flex-1">{children}</div>

      <footer className="border-t border-border">
        <div className="mx-auto w-full max-w-[1400px] px-5 py-5 lg:px-10">
          <p className="text-xs text-text-subtle">
            Prototipo del Hackathon Colsubsidio × 30X. No es un canal oficial de
            Colsubsidio: los precios son estimados y no constituyen oferta comercial.
          </p>
        </div>
      </footer>
    </div>
  );
}
