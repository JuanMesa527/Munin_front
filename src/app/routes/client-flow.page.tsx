/**
 * Orquestador del flujo del cliente (`/`).
 *
 * Aqui vive el SWITCH DE CARRIL y en ningun otro lado (regla 4 de aislamiento):
 * F1 (intake) perfila al lead; cuando cierra, el control pasa a la feature que
 * corresponda con el mismo `leadId`. Las features del cliente no se conocen
 * entre si — este componente de `app/` es el unico que las une.
 *
 *   carril viable     -> LeadEnrichmentScreen (F2.1)
 *   carril no_viable   -> AppShell + F2.2 (Inicio, Camino a Mi Hogar, Logros,
 *                         Progreso, Mi perfil): camino de nutricion gamificado.
 *
 * Vive en `app/` y no dentro de una feature a proposito: es lo que permite que
 * las features del cliente se desarrollen en paralelo sin conocerse.
 */

import { useState, type ReactElement } from 'react';
import { LeadIntakeScreen } from '@features/lead-intake';
import { LeadEnrichmentScreen } from '@features/lead-enrichment';
import {
  InicioScreen,
  LeadEducationScreen,
  LogrosScreen,
  OnboardingWelcomeModal,
  PerfilScreen,
  ProgresoScreen,
  VistaTransition,
} from '@features/lead-education';
import type { ClientVista } from '../shell/client-vista';
import { AppShell } from '../shell/app-shell';

function CaminoNutricion({ leadId }: { leadId: string }): ReactElement {
  const [vista, setVista] = useState<ClientVista>('inicio');
  // Una sola vez al entrar al carril de nutrición (no al cambiar de pestaña).
  const [mostrarOnboarding, setMostrarOnboarding] = useState(true);

  const pantalla =
    vista === 'inicio' ? (
      <InicioScreen
        leadId={leadId}
        onIrACamino={() => {
          setVista('camino');
        }}
        onIrAProgreso={() => {
          setVista('progreso');
        }}
      />
    ) : vista === 'logros' ? (
      <LogrosScreen leadId={leadId} />
    ) : vista === 'progreso' ? (
      <ProgresoScreen leadId={leadId} />
    ) : vista === 'perfil' ? (
      <PerfilScreen
        leadId={leadId}
        onVerCamino={() => {
          setVista('camino');
        }}
        onVerLogros={() => {
          setVista('logros');
        }}
      />
    ) : (
      <LeadEducationScreen
        leadId={leadId}
        onIrAProgreso={() => {
          setVista('progreso');
        }}
      />
    );

  return (
    <AppShell vista={vista} onCambiarVista={setVista}>
      <OnboardingWelcomeModal
        open={mostrarOnboarding}
        onClose={() => {
          setMostrarOnboarding(false);
        }}
      />
      <VistaTransition vistaKey={vista}>{pantalla}</VistaTransition>
    </AppShell>
  );
}

export function ClientFlowPage(): ReactElement {
  // `null` mientras F1 perfila; el leadId del lead correspondiente cuando F1
  // cierra el carril (viable o no_viable).
  const [leadViableId, setLeadViableId] = useState<string | null>(null);
  const [leadNoViableId, setLeadNoViableId] = useState<string | null>(null);

  if (leadViableId !== null) {
    return <LeadEnrichmentScreen leadId={leadViableId} />;
  }

  if (leadNoViableId !== null) {
    return <CaminoNutricion leadId={leadNoViableId} />;
  }

  return <LeadIntakeScreen onViable={setLeadViableId} onNoViable={setLeadNoViableId} />;
}
