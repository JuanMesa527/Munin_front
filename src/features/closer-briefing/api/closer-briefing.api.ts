/**
 * I/O de F4 · closer-briefing.
 */

import { API_ROUTES, type ApiResponse, type BriefingSheet } from '@contracts';
import { apiGet, apiPost } from '@shared/api/http-client';

/**
 * `leadId` va en el path y no como query: es un identificador opaco, no un dato
 * personal, asi que no arrastra PII a los logs de proxies (regla 18).
 */
export function fetchBriefing(leadId: string): Promise<ApiResponse<BriefingSheet>> {
  return apiGet<BriefingSheet>(`${API_ROUTES.closer.briefing}/${encodeURIComponent(leadId)}`);
}

export interface RevealedContact {
  readonly telefono: string;
}

/**
 * La accion mas sensible de todo el producto: destapa el telefono real de una
 * persona. Es un POST a proposito (muta estado: deja rastro en auditoria) y el
 * backend registra en `AuditLogPort` quien lo pidio, de quien y cuando. Nunca
 * cachear esta respuesta.
 */
export function revealContact(leadId: string): Promise<ApiResponse<RevealedContact>> {
  return apiPost<RevealedContact>(API_ROUTES.closer.revealContact, { leadId });
}
