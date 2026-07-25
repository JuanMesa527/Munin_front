/**
 * Tabla de rutas de la app (capa app) — tasks.md 4.4.
 *
 * Deliberadamente minima: solo `/` (F1 · lead-intake) y `/politica-de-datos`.
 * Ningun `/closer/*` va aqui — F3/F4 son otra fase de este cambio (spec
 * `app-bootstrap-front`, "Minimal Router Surface").
 */

import { createBrowserRouter, type RouteObject } from 'react-router';
import { LeadIntakeScreen } from '@features/lead-intake';
import { PrivacyPolicyPage } from './privacy-policy.page';

export const routes: RouteObject[] = [
  { path: '/', element: <LeadIntakeScreen /> },
  { path: '/politica-de-datos', element: <PrivacyPolicyPage /> },
];

export const router = createBrowserRouter(routes);
