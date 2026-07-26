/**
 * API publica de F2.2 · lead-education (capa: superficie de la feature). Unica
 * via de acceso desde fuera: ESLint bloquea importar `ui/`, `model/` o `api/`
 * directamente.
 */

export { GraduationModal, type GraduationModalProps } from './ui/graduation-modal';
export { InicioScreen, type InicioScreenProps } from './ui/inicio-screen';
export { LeadEducationScreen, type LeadEducationScreenProps } from './ui/lead-education-screen';
export { LeadLoginScreen, type LeadLoginScreenProps } from './ui/lead-login-screen';
export { LeadOtpGateScreen, type LeadOtpGateScreenProps } from './ui/lead-otp-gate-screen';
export { LogrosScreen, type LogrosScreenProps } from './ui/logros-screen';
export {
  OnboardingWelcomeModal,
  type OnboardingWelcomeModalProps,
} from './ui/onboarding-welcome-modal';
export { PerfilScreen, type PerfilScreenProps } from './ui/perfil-screen';
export { ProgresoScreen, type ProgresoScreenProps } from './ui/progreso-screen';
export { VistaTransition, type VistaTransitionProps } from './ui/vista-transition';
export { useEducationJourney } from './model/use-education-journey';
export { useLeadSession, type LeadSessionState } from './model/use-lead-session';
