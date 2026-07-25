/**
 * Traduce `Badge.icono` (clave semántica del contrato, p. ej. `'piggy-bank'`)
 * a un ícono real (capa model, F2.2).
 *
 * `Badge.icono` es un STRING de presentación (ver `buildGamifiedJourney` en
 * `Munin_back/src/features/lead-education/domain/journey.ts`), no un emoji ni
 * un componente. Antes de esto, `nivel-card.tsx` y `badge-unlock-modal.tsx`
 * renderizaban `{badge.icono}` como texto crudo — "funcionaba" solo porque la
 * fixture de demo usa emoji literales en vez de la clave real del contrato.
 */

import { FileText, IdCard, PiggyBank, Trophy, type LucideIcon } from 'lucide-react';

export const BADGE_ICONOS: Record<string, LucideIcon> = {
  'piggy-bank': PiggyBank,
  'id-card': IdCard,
  'file-text': FileText,
};

/** Si la clave no está mapeada (o es un emoji viejo de fixture), cae a un trofeo genérico. */
export function iconoDeBadge(icono: string): LucideIcon {
  return BADGE_ICONOS[icono] ?? Trophy;
}
