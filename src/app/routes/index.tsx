/* eslint-disable react-refresh/only-export-components --
 * Este archivo exporta `router`, que no es un componente, y por eso el HMR de
 * React Refresh no puede tratarlo como modulo de componentes. Es correcto asi:
 * el arbol de rutas es configuracion, no UI, y separarlo en dos archivos solo
 * para callar la regla haria el routing mas dificil de leer.
 */

/**
 * Arbol de rutas, organizado POR ROL.
 *
 *   /                      portada: elige rol y entra (sin login)
 *   /cliente               usuario final, SIN login (F1 → F2.1 / F2.2)
 *   /politica-de-datos     aviso de tratamiento de datos (Ley 1581)
 *   /closer/login          puerta del comercial
 *   /closer                F3 · cola de leads viables      ┐ detras de CloserGuard
 *   /closer/leads/:leadId  F4 · ficha de la llamada        ┘
 *
 * `CloserGuard` es una layout route sin path: envuelve a sus hijos y renderiza
 * <Outlet/>. Recuerda que es UX, no seguridad — la autorizacion real la impone
 * el backend en cada request.
 *
 * Las pantallas del closer van con `lazy`: el usuario final nunca descarga el
 * codigo de la consola comercial.
 */

import { Suspense, lazy, type ReactElement, type ReactNode } from 'react';
import { createBrowserRouter } from 'react-router';
import { CloserGuard } from '@shared/auth/closer-guard';
import { Spinner } from '@shared/ui';
import { LandingPage } from './landing.page';
import { ClientFlowPage } from './client-flow.page';
import { PrivacyPolicyPage } from './privacy-policy.page';
import { NotFoundPage } from './not-found.page';

const CloserDashboardPage = lazy(async () => {
  const modulo = await import('@features/closer-dashboard');
  return { default: modulo.CloserDashboardPage };
});

const CloserLoginPage = lazy(async () => {
  const modulo = await import('@features/closer-dashboard');
  return { default: modulo.CloserLoginPage };
});

const CloserBriefingPage = lazy(async () => {
  const modulo = await import('@features/closer-briefing');
  return { default: modulo.CloserBriefingPage };
});

/** Fallback en el registro visual de la consola, no un spinner desnudo. */
function Cargando(): ReactElement {
  return (
    <div className="flex min-h-screen items-center justify-center bg-console-paper">
      <Spinner />
      <span className="sr-only">Cargando…</span>
    </div>
  );
}

function conSuspense(nodo: ReactNode): ReactElement {
  return <Suspense fallback={<Cargando />}>{nodo}</Suspense>;
}

export const router = createBrowserRouter([
  { path: '/', element: <LandingPage /> },
  // El flujo del cliente baja de `/` a `/cliente` porque `/` pasa a ser la
  // portada de roles. La portada NO va con `lazy`: es lo primero que ve
  // cualquiera que abre el link, y un spinner en el primer frame de la demo
  // es exactamente la impresion que no queremos dar.
  { path: '/cliente', element: <ClientFlowPage /> },
  { path: '/politica-de-datos', element: <PrivacyPolicyPage /> },
  { path: '/closer/login', element: conSuspense(<CloserLoginPage />) },
  {
    element: <CloserGuard />,
    children: [
      { path: '/closer', element: conSuspense(<CloserDashboardPage />) },
      { path: '/closer/leads/:leadId', element: conSuspense(<CloserBriefingPage />) },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);
