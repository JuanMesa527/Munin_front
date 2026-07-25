/**
 * Barrel de los datos semilla de la demo (capa shared).
 *
 * F3 y F4 importan SIEMPRE desde aqui (`@shared/demo`). Cuando los endpoints
 * del closer existan, este modulo se borra completo y solo desaparecen los
 * fallbacks de `api/`: la UI no cambia porque siempre habló el contrato.
 */

export { SEED_LEADS, SEED_LEADS_CRUDOS, type SeedLead } from './leads.seed';
export {
  SEED_BRIEFINGS,
  SEED_LIST_ITEMS,
  buildTalkingPoints,
  revealSeedPhone,
  toBriefingSheet,
  toEnrichedLead,
  toListItem,
} from './seed-mappers';
