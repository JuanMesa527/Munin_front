/**
 * Llamadas al backend de F2.2 (capa api).
 *
 * `ui/` no llama `fetch` directo: pasa siempre por aca, que a su vez pasa por
 * el cliente compartido. Nunca se inventan URLs: siempre `API_ROUTES`.
 */

import { API_ROUTES } from '@contracts';
import type { EducationJourney, EducationJourneyView, ProgressEvent } from '@contracts';
import { apiGet, apiPost } from '@shared/api/http-client';

/** Alias local: misma forma que el contrato compartido. */
export type JourneyView = EducationJourneyView;

export function fetchJourney(leadId: string): ReturnType<typeof apiGet<JourneyView>> {
  return apiGet<JourneyView>(API_ROUTES.education.journey, { leadId });
}

export interface RecordProgressInput {
  leadId: string;
  event: Omit<ProgressEvent, 'ocurridoEn'>;
  /**
   * Fecha límite de la meta de ahorro (adenda A10). Ortogonal al evento: el
   * backend la configura ADEMÁS de aplicar `event`, sin tocar `alcanzado`.
   */
  fechaObjetivo?: string;
}

export function recordProgress(
  input: RecordProgressInput,
): ReturnType<typeof apiPost<EducationJourney>> {
  return apiPost<EducationJourney>(API_ROUTES.education.progress, {
    leadId: input.leadId,
    ...input.event,
    ...(input.fechaObjetivo !== undefined ? { fechaObjetivo: input.fechaObjetivo } : {}),
  });
}
