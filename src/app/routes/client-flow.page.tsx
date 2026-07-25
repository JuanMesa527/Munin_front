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

import { useEffect, useState, type ReactElement } from 'react';
import { LeadIntakeScreen } from '@features/lead-intake';
import { LeadEnrichmentScreen } from '@features/lead-enrichment';
import {
  InicioScreen,
  LeadEducationScreen,
  LeadLoginScreen,
  LogrosScreen,
  OnboardingWelcomeModal,
  PerfilScreen,
  ProgresoScreen,
  useEducationJourney,
  useLeadSession,
  VistaTransition,
} from '@features/lead-education';
import type { ClientVista } from '../shell/client-vista';
import { AppShell } from '../shell/app-shell';

interface CaminoNutricionProps {
  leadId: string;
  /**
   * F2.2 -> F2.1: cuando el lead cierra su brecha de ahorro (y afiliación, si
   * aplica), el journey se reclasifica a `viable` en el propio backend. Sin
   * este handoff, el usuario se queda en las pantallas de F2.2 mientras el
   * backend ya rechaza ese `leadId` (regla de dominio: F2.2 es solo para
   * `carril: 'no_viable'`) — cada fetch posterior falla, y esos fallos en
   * cascada fueron los que agotaban el rate limit ("demasiadas solicitudes").
   */
  onGraduar: (leadId: string) => void;
}

function CaminoNutricion({ leadId, onGraduar }: CaminoNutricionProps): ReactElement {
  const [vista, setVista] = useState<ClientVista>('inicio');
  // Una sola vez al entrar al carril de nutrición (no al cambiar de pestaña).
  const [mostrarOnboarding, setMostrarOnboarding] = useState(true);
  // Mismo queryKey que ya usa cada pantalla hija (React Query lo comparte —
  // esto NO agrega un fetch extra): solo lo leemos acá para detectar la
  // graduación sin importar en qué pestaña esté el usuario.
  const { data } = useEducationJourney(leadId);

  useEffect(() => {
    if (data?.journey.reclasificadoAViable === true) {
      onGraduar(leadId);
    }
  }, [data?.journey.reclasificadoAViable, leadId, onGraduar]);

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
  // Login por OTP (adenda A14): pantalla para recuperar el leadId cuando se
  // cerró la pestaña y no quedó nada en memoria — no hay F1 que repetir.
  const [mostrarLogin, setMostrarLogin] = useState(false);
  const { session, isLoading: cargandoSesion } = useLeadSession();

  if (leadViableId !== null) {
    return <LeadEnrichmentScreen leadId={leadViableId} />;
  }

  if (leadNoViableId !== null) {
    return <CaminoNutricion leadId={leadNoViableId} onGraduar={setLeadViableId} />;
  }

  // Cookie de sesión viva (`lead_session`, TTL largo): retoma directo, sin
  // pasar por F1 ni por la pantalla de login.
  if (!cargandoSesion && session !== null) {
    return <CaminoNutricion leadId={session.leadId} onGraduar={setLeadViableId} />;
  }

  if (mostrarLogin) {
    return (
      <LeadLoginScreen
        onSuccess={setLeadNoViableId}
        onCancel={() => {
          setMostrarLogin(false);
        }}
      />
    );
  }

  return (
    <div className="relative">
      <LeadIntakeScreen onViable={setLeadViableId} onNoViable={setLeadNoViableId} />
      <button
        type="button"
        onClick={() => {
          setMostrarLogin(true);
        }}
        className="focus-ring fixed top-3 right-3 z-50 rounded-pill bg-surface/90 px-3 py-1.5 text-xs font-bold text-text-muted shadow-sm hover:text-text"
      >
        ¿Ya empezaste? Volvé a tu camino
      </button>
    </div>
  );
}
