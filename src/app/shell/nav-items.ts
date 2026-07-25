/**
 * Items de navegacion del shell (capa app).
 */

import type { LucideIcon } from 'lucide-react';
import { Home, Map, TrendingUp, Trophy, User } from 'lucide-react';
import type { ClientVista } from './client-vista';

export interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  vista: ClientVista | null;
}

export const NAV_ITEMS: readonly NavItem[] = [
  { id: 'inicio', label: 'Inicio', icon: Home, vista: 'inicio' },
  { id: 'camino', label: 'Mi camino', icon: Map, vista: 'camino' },
  { id: 'logros', label: 'Logros', icon: Trophy, vista: 'logros' },
  { id: 'progreso', label: 'Progreso', icon: TrendingUp, vista: 'progreso' },
  { id: 'perfil', label: 'Mi perfil', icon: User, vista: 'perfil' },
];
