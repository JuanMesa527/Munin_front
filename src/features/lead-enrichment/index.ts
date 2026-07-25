/**
 * API publica de F2.1 (lead-enrichment).
 *
 * Es la UNICA superficie que otras features y `app/` pueden importar. Todo lo
 * de `ui/`, `model/` y `api/` es interno: ESLint bloquea el import directo.
 */

export {
  LeadEnrichmentScreen,
  type LeadEnrichmentScreenProps,
} from './ui/lead-enrichment-screen';
