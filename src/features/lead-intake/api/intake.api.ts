/**
 * Llamadas HTTP de F1 (capa api). Unica capa que conoce `API_ROUTES.intake.*`;
 * `ui/` y `model/` nunca llaman `fetch` directo (EQUIPO.md regla 3).
 *
 * Los shapes de `input` calzan 1:1 con los casos de uso del backend
 * (`SubmitConsentUseCase.execute` / `ProcessConversationTurnUseCase.execute`,
 * ver `Munin_back/openspec/changes/lead-intake/design.md`): `/consent` nunca
 * recibe `leadId` — el backend lo acuña server-side (D6) — y `/turn` lo
 * recibe porque ya existe.
 */

import { apiPost, unwrap } from '@shared/api/http-client';
import { API_ROUTES } from '@contracts';
import type { ConversationTurn, FinalidadTratamiento } from '@contracts';

export interface SubmitConsentInput {
  otorgado: boolean;
  versionPolitica: string;
  finalidades: FinalidadTratamiento[];
  canal: string;
}

export interface SubmitTurnInput {
  leadId: string;
  texto: string | null;
  quickReplyValue: string | null;
}

/** `/start` no recibe body: el backend crea un `LeadProfile` efimero (D6). */
export function startIntake(): Promise<ConversationTurn> {
  return unwrap(apiPost<ConversationTurn>(API_ROUTES.intake.start));
}

export function submitConsent(input: SubmitConsentInput): Promise<ConversationTurn> {
  return unwrap(apiPost<ConversationTurn>(API_ROUTES.intake.consent, input));
}

export function submitTurn(input: SubmitTurnInput): Promise<ConversationTurn> {
  return unwrap(apiPost<ConversationTurn>(API_ROUTES.intake.turn, input));
}
