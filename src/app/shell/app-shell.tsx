/**
 * Cascaron de la app (capa app, shell).
 */

import type { ReactElement, ReactNode } from 'react';
import type { ClientVista } from './client-vista';
import { BottomNav } from './bottom-nav';
import { SideNav } from './side-nav';

export interface AppShellProps {
  children: ReactNode;
  vista: ClientVista;
  onCambiarVista: (vista: ClientVista) => void;
}

export function AppShell({ children, vista, onCambiarVista }: AppShellProps): ReactElement {
  return (
    <div
      id="inicio"
      className="flex min-h-dvh flex-col bg-surface-2 sm:h-dvh sm:flex-row sm:overflow-hidden"
    >
      <SideNav vista={vista} onCambiarVista={onCambiarVista} />
      <div className="min-w-0 flex-1 overflow-y-auto pb-20 sm:pb-0">{children}</div>
      <BottomNav vista={vista} onCambiarVista={onCambiarVista} />
    </div>
  );
}
