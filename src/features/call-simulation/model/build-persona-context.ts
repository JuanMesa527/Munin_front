/**
 * Recorte SIN PII del `BriefingSheet` para F5. Capa: model.
 *
 * Espeja `Munin_back/src/features/call-simulation/domain/persona.ts#buildPersonaContext`:
 * mismo criterio de que campos viajan al backend (y de ahi al LLM) — nunca
 * telefono, apellidos ni documento. El backend valida esto igual con
 * `PersonaContextSchema` (el schema no declara esos campos, asi que zod los
 * descarta aunque este mapper tuviera un bug), pero la primera barrera es esta.
 */

import type { BriefingSheet, PersonaContext } from '@contracts';

const LARGO_MAXIMO_NOMBRE = 40;

/** Primer nombre, recortado. `"Laura Restrepo M."` -> `"Laura"`. Nunca apellidos. */
function primerNombreDe(nombreCompleto: string | null | undefined): string {
  const primero = (nombreCompleto ?? '').trim().split(/\s+/u)[0] ?? '';
  return primero.length > 0 ? primero.slice(0, LARGO_MAXIMO_NOMBRE) : 'el lead';
}

export function buildPersonaContext(briefing: BriefingSheet): PersonaContext {
  const { lead } = briefing;
  return {
    primerNombre: primerNombreDe(lead.identidad?.nombre),
    edad: lead.edad,
    ocupacion: lead.ocupacion,
    ciudad: lead.ciudad,
    hogar: lead.hogar,
    ingresosSmmlv: lead.ingresosSmmlv,
    segmento: lead.segmento,
    motivacion: lead.motivacion,
    intereses: lead.intereses,
    citaTextual: lead.citaTextual,
    objeciones: briefing.objeciones,
    talkingPoints: briefing.talkingPoints,
  };
}
