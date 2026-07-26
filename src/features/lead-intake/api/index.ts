/** Barrel interno de `api/`. Consumido solo por `model/` (: `ui/` nunca importa `api/` directo). */
export { startIntake, submitConsent, submitTurn } from './intake.api';
export type { SubmitConsentInput, SubmitTurnInput } from './intake.api';
