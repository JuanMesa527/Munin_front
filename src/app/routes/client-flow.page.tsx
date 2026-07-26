/**
 * Orquestador del flujo del cliente (`/`).
 *
 * Aqui vive el SWITCH DE CARRIL y en ningun otro lado (de aislamiento): F1
 * (intake) perfila al lead; cuando cierra, el control pasa a la feature que
 * corresponda con el mismo `leadId`. Las features del cliente no se conocen
 * entre si — este componente de `app/` es el unico que las une.
 *
 *   carril viable     -> LeadEnrichmentScreen (F2.1)
 *   carril no_viable   -> LeadOtpGateScreen (código al correo que dio en el
 *                         chat) y, una vez verificado, AppShell + F2.2
 *                         (Inicio, Camino a Mi Hogar, Logros, Progreso, Mi
 *                         perfil): camino de nutrición gamificado.
 *
 * Vive en `app/` y no dentro de una feature a proposito: es lo que permite que
 * las features del cliente se desarrollen en paralelo sin conocerse.
 */

import { useState, type ReactElement } from 'react';
import { LeadIntakeScreen } from '@features/lead-intake';
import { LeadEnrichmentScreen } from '@features/lead-enrichment';
import {
  GraduationModal,
  InicioScreen,
  LeadEducationScreen,
  LeadLoginScreen,
  LeadOtpGateScreen,
  LogrosScreen,
  OnboardingWelcomeModal,
  PerfilScreen,
  ProgresoScreen,
  useEducationJourney,
  useLeadLogout,
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
  onLogout: () => void;
}

function CaminoNutricion({ leadId, onGraduar, onLogout }: CaminoNutricionProps): ReactElement {
  const [vista, setVista] = useState<ClientVista>('inicio');
  // Una sola vez al entrar al carril de nutrición (no al cambiar de pestaña).
  const [mostrarOnboarding, setMostrarOnboarding] = useState(true);
  // Mismo queryKey que ya usa cada pantalla hija (React Query lo comparte —
  // esto NO agrega un fetch extra): solo lo leemos acá para detectar la
  // graduación sin importar en qué pestaña esté el usuario.
  const { data } = useEducationJourney(leadId);
  // Derivado del dato, no un `useState` + efecto: la reclasificación ya no
  // dispara `onGraduar` de una, se celebra primero con `GraduationModal`
  // (confetti + aviso) y solo el click del lead en "Ver proyectos" completa
  // el handoff a F2.1 (que desmonta este componente entero) — no hace falta
  // "recordar" que se mostró, el dato del journey ya es la fuente de verdad.
  const mostrarGraduacion = data?.journey.reclasificadoAViable === true;

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
        onLogout={onLogout}
      />
    ) : vista === 'logros' ? (
      <LogrosScreen leadId={leadId} onLogout={onLogout} />
    ) : vista === 'progreso' ? (
      <ProgresoScreen leadId={leadId} onLogout={onLogout} />
    ) : vista === 'perfil' ? (
      <PerfilScreen
        leadId={leadId}
        onVerCamino={() => {
          setVista('camino');
        }}
        onVerLogros={() => {
          setVista('logros');
        }}
        onLogout={onLogout}
      />
    ) : (
      <LeadEducationScreen
        leadId={leadId}
        onIrAProgreso={() => {
          setVista('progreso');
        }}
        onLogout={onLogout}
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
      <GraduationModal
        open={mostrarGraduacion}
        onVerProyectos={() => {
          onGraduar(leadId);
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
  // Paso intermedio F1 -> F2.2: salir del chat como `no_viable` NO abre el
  // módulo educativo. Antes de entrar hay que confirmar el código que el
  // backend manda al correo que el propio lead declaró en la conversación —
  // sin esa verificación no hay cookie, y sin cookie `/journey` responde 401.
  const [leadPorVerificarId, setLeadPorVerificarId] = useState<string | null>(null);
  // Login por OTP: pantalla para recuperar el leadId cuando se cerró la pestaña
  // y no quedó nada en memoria — no hay F1 que repetir.
  const [mostrarLogin, setMostrarLogin] = useState(false);
  const { session, isLoading: cargandoSesion } = useLeadSession();
  const { logout } = useLeadLogout();

  // Cierra la cookie de sesion en el backend y limpia el cache de `education`;
  // volver a `leadNoViableId: null` es lo que hace que `ClientFlowPage` caiga
  // de nuevo al chat de F1 en vez de reintentar contra un lead sin sesion.
  function handleLogout(): void {
    logout();
    setLeadNoViableId(null);
  }

  if (leadViableId !== null) {
    return <LeadEnrichmentScreen leadId={leadViableId} />;
  }

  if (leadNoViableId !== null) {
    return (
      <CaminoNutricion leadId={leadNoViableId} onGraduar={setLeadViableId} onLogout={handleLogout} />
    );
  }

  if (leadPorVerificarId !== null) {
    return (
      <LeadOtpGateScreen
        leadId={leadPorVerificarId}
        onVerificado={(leadId) => {
          setLeadPorVerificarId(null);
          setLeadNoViableId(leadId);
        }}
      />
    );
  }

  // Cookie de sesión viva (`lead_session`, TTL largo): retoma directo, sin
  // pasar por F1 ni por la pantalla de login.
  if (!cargandoSesion && session !== null) {
    return (
      <CaminoNutricion
        leadId={session.leadId}
        onGraduar={setLeadViableId}
        onLogout={handleLogout}
      />
    );
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
      <LeadIntakeScreen onViable={setLeadViableId} onNoViable={setLeadPorVerificarId} />
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
