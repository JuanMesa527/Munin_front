/**
 * Marco de la aplicacion: cabecera fija + area de contenido. Capa: app.
 *
 * Pensado para ESCRITORIO primero -- el jurado va a recorrerlo en un portatil,
 * no en un telefono -- y colapsa a una columna en movil. La cabecera es blanca
 * con un borde de un pixel, como en el sistema de Colsubsidio: el color se
 * reserva para los bloques de contenido, no para el cromado.
 *
 * SOBRE EL LOGO: es el logotipo oficial de Colsubsidio, con uso autorizado
 * por el dueno de producto. El pie aclara que los precios son estimados.
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
              src="https://www.colsubsidio.com/campusvirtual/login-custom/img/colsubsidio1.png"
              alt="Colsubsidio"
              className="h-7 w-auto"
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
            Los precios y la capacidad de compra son estimados a partir de lo que nos cuentas.
            No constituyen oferta comercial vinculante.
          </p>
        </div>
      </footer>
    </div>
  );
}
