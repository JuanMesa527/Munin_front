/**
 * API publica de F3 · closer-dashboard.
 *
 * Unica superficie por la que el resto de la app puede tocar esta feature.
 * ESLint bloquea que alguien importe `ui/`, `model/` o `api/` por dentro (de).
 */

export {
  CloserDashboardPage,
  type CloserDashboardPageProps,
} from './ui/closer-dashboard.page';
export { CloserLoginPage } from './ui/closer-login.page';
