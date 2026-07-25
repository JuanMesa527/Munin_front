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

export interface RequestOtpInput {
  telefono: string | null;
  email: string | null;
}

export interface RequestOtpResult {
  enviado: boolean;
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
