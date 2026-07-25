/**
 * Superficie publica de F1 · `lead-intake` (tasks.md 3.12).
 *
 * UNICO simbolo exportado (EQUIPO.md regla 4): cualquier otra feature o
 * `app/` que necesite algo de `lead-intake` importa desde aqui, nunca de
 * `ui/`, `model/` o `api/` directo.
 */
export { LeadIntakeScreen } from './ui/lead-intake-screen';
