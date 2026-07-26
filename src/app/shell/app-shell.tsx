/**
 * Cascaron de la app (capa app, shell).
 */

import type { ReactElement, ReactNode } from 'react';
import type { ClientVista } from './client-vista';
import { BottomNav } from './bottom-nav';
import { SideNav } from './side-nav';
import { UserMenu } from './user-menu';

export interface AppShellProps {
  children: ReactNode;
  vista: ClientVista;
  onCambiarVista: (vista: ClientVista) => void;
  /**
   * Opcional a proposito: `LeadSession` no trae nombre y quien monta el shell
   * no tiene ninguno que pasar. Existe para el dia que si lo tenga, sin
   * obligar hoy a nadie a cambiar su llamada.
   */
  nombreUsuario?: string | undefined;
}

export function AppShell({
  children,
  vista,
  onCambiarVista,
  nombreUsuario,
}: AppShellProps): ReactElement {
  return (
    <div
      id="inicio"
      className="flex min-h-dvh flex-col bg-surface-2 sm:h-dvh sm:flex-row sm:overflow-hidden"
    >
      <SideNav vista={vista} onCambiarVista={onCambiarVista} nombreUsuario={nombreUsuario} />

      {/* En movil la burbuja flota arriba a la derecha en vez de ser un sexto
          item de `BottomNav`: la barra ya reparte 5 destinos en el ancho de un
          telefono y uno mas los deja por debajo del area tactil comoda.
          Ademas "Mi perfil" ya vive ahi — una "cuenta" al lado se leeria como
          el mismo destino dos veces, y cerrar sesion no es navegacion.
          `z-40` (no 50) para que los modales de F2.2 sigan quedando encima. */}
      <UserMenu
        nombre={nombreUsuario}
        variant="flotante"
        className="fixed top-3 right-3 z-40 sm:hidden"
      />

      <div className="min-w-0 flex-1 overflow-y-auto pb-20 sm:pb-0">{children}</div>
      <BottomNav vista={vista} onCambiarVista={onCambiarVista} />
    </div>
  );
}
