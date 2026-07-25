/**
 * Orquestador del flujo del cliente (`/`).
 *
 * Aqui vive el SWITCH DE CARRIL y en ningun otro lado (regla 4 de aislamiento):
 * F1 (intake) perfila al lead; cuando cierra en `viable`, el control pasa a F2.1
 * (enrichment) con el mismo `leadId`. F1 y F2.1 no se conocen entre si — este
 * componente de `app/` es el unico que los une.
 *
 *   carril viable      -> LeadEnrichmentScreen (F2.1)
 *   carril no_viable    -> lo maneja F1 en su pantalla de cierre (F2.2 aun no
 *                          existe); cuando exista, se enruta aqui igual que F2.1.
 *
 * Vive en `app/` y no dentro de una feature a proposito: es lo que permite que
 * las features del cliente se desarrollen en paralelo sin conocerse.
 */

import { useState, type ReactElement } from 'react';
import { LeadIntakeScreen } from '@features/lead-intake';
import { LeadEnrichmentScreen } from '@features/lead-enrichment';

export function ClientFlowPage(): ReactElement {
  // `null` mientras F1 perfila; el leadId del lead viable cuando F1 lo entrega.
  const [leadViableId, setLeadViableId] = useState<string | null>(null);

  if (leadViableId !== null) {
    return <LeadEnrichmentScreen leadId={leadViableId} />;
  }

  return <LeadIntakeScreen onViable={setLeadViableId} />;
}
