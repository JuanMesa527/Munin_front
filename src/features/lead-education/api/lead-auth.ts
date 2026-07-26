/**
 * Login por OTP del lead (F2.2, adenda A14) — capa api.
 *
 * `ui/` no llama `fetch` directo: pasa siempre por aca, igual que `education.ts`.
 * La sesion viaja en cookie httpOnly (`apiPost`/`apiGet` ya mandan
 * `credentials: 'include'`); este archivo nunca toca `localStorage`.
 */

import { API_ROUTES } from '@contracts';
import type { LeadSession } from '@contracts';
import { apiGet, apiPost } from '@shared/api/http-client';

/**
 * Exactamente UN canal por intento. `leadId` es el del GATE (el lead viene de
 * terminar F1 y el correo ya lo dio en el chat); `telefono`/`email` son los de
 * RECUPERACION (cerro la pestana y hay que volver a identificarlo).
 */
export interface RequestOtpInput {
  telefono?: string | null;
  email?: string | null;
  leadId?: string | null;
}

export interface RequestOtpResult {
  enviado: boolean;
  /** Correo enmascarado (`pe*****@correo.com`). Solo lo devuelve el canal `leadId`. */
  destino?: string | null;
  canal?: 'email' | 'telefono';
  /** Solo fuera de produccion (demo sin SMS/correo real). */
  codigo?: string;
}

export function requestLeadOtp(
  input: RequestOtpInput,
): ReturnType<typeof apiPost<RequestOtpResult>> {
  return apiPost<RequestOtpResult>(API_ROUTES.education.auth.requestOtp, input);
}

export interface VerifyOtpInput extends RequestOtpInput {
  codigo: string;
}

/** El backend distingue "codigo malo" (401) de "ese lead no existe" (404). */
export const CODIGO_LEAD_INEXISTENTE = 'NOT_FOUND';

export function verifyLeadOtp(
  input: VerifyOtpInput,
): ReturnType<typeof apiPost<{ leadId: string }>> {
  return apiPost<{ leadId: string }>(API_ROUTES.education.auth.verifyOtp, input);
}

export function fetchLeadSession(): ReturnType<typeof apiGet<LeadSession>> {
  return apiGet<LeadSession>(API_ROUTES.education.auth.session);
}

export function logoutLead(): ReturnType<typeof apiPost<null>> {
  return apiPost<null>(API_ROUTES.education.auth.logout);
}
