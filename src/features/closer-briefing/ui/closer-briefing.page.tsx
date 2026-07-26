/**
 * F4 · closer-briefing — ficha tecnica de la llamada en vivo.
 *
 * Se lee CON EL CLIENTE AL TELEFONO, asi que la jerarquia manda: capacidad e
 * identidad a la izquierda (lo que se dice en los primeros 20 segundos), el
 * porque del score y los proyectos en el centro (el cuerpo de la conversacion) y
 * el guion pegado a la derecha (`sticky`) para que no se pierda al hacer scroll.
 *
 * Tres columnas en escritorio y una sola en movil, sin cambiar el orden de
 * lectura: primero quien es, despues por que, al final que decir.
 */

import { useState, type ReactElement } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router';
import { API_ROUTES, type ApiResponse } from '@contracts';
import { ConsoleHeader, Skeleton } from '@shared/ui';
import { apiPost } from '@shared/api/http-client';
import { queryKeys } from '@shared/api/query-keys';
import { useCloserSession } from '@shared/auth/use-closer-session';
import { useBriefing } from '../model/use-briefing';
import { useTalkingPoints } from '../model/use-talking-points';
import { BestTimeCard } from './best-time-card';
import { BriefingHeader } from './briefing-header';
import { CallNotes } from './call-notes';
import { CallScript } from './call-script';
import { CapacityCard } from './capacity-card';
import { IdentityCard } from './identity-card';
import { LeadJourney } from './lead-journey';
import { LeadQuotes } from './lead-quotes';
import { ObjectionsCard } from './objections-card';
import { ProjectMatches } from './project-matches';
import { ScoreExplainer } from './score-explainer';

const COLUMNAS = 'grid-cols-[repeat(auto-fit,minmax(320px,1fr))]';

function FichaCargando(): ReactElement {
  return (
    <div aria-busy="true" aria-live="polite" className="mx-auto max-w-[1280px] px-4 py-8 sm:px-8">
      <span className="sr-only">Cargando la ficha del lead…</span>
      <div className={`grid gap-[22px] ${COLUMNAS}`}>
        <Skeleton className="h-[380px] rounded-[20px]" />
        <Skeleton className="h-[380px] rounded-[20px]" />
        <Skeleton className="h-[380px] rounded-[20px]" />
      </div>
    </div>
  );
}

/**
 * Quien decide si la sesion murio es el backend: la cookie es httpOnly y este
 * codigo no puede borrarla. Si el POST falla, el comercial SIGUE dentro, y
 * mandarlo al login seria mentirle (el guard lo devolveria aqui en un rebote
 * que parece un bug). Se queda donde esta, con el estado dicho en voz alta.
 */
const ERROR_LOGOUT = 'No pudimos cerrar tu sesión. Sigues conectado; intenta de nuevo.';

/**
 * F4 no llama `logoutCloser()` de F3 aunque sea exactamente este POST: la regla
 * 4 prohibe importar internals de otra feature y el `index.ts` publico de F3
 * solo expone pantallas. La URL sigue saliendo de `API_ROUTES`, que es la
 * fuente de verdad compartida, asi que las dos features no pueden divergir.
 */
function cerrarSesionEnServidor(): Promise<ApiResponse<null>> {
  return apiPost<null>(API_ROUTES.closer.logout);
}

export function CloserBriefingPage(): ReactElement {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { leadId = '' } = useParams<{ leadId: string }>();
  const { session } = useCloserSession();
  const { briefing, isLoading, error } = useBriefing(leadId);

  const guion = useTalkingPoints(briefing?.talkingPoints.length ?? 0);

  const [errorSesion, setErrorSesion] = useState<string | null>(null);

  const closerName = session?.nombre ?? 'Closer';

  async function cerrarSesion(): Promise<void> {
    setErrorSesion(null);
    const respuesta = await cerrarSesionEnServidor();

    if (!respuesta.ok) {
      setErrorSesion(ERROR_LOGOUT);
      return;
    }

    // La ficha cacheada trae datos de contacto del titular: sacarla del cache
    // evita que el siguiente comercial que entre en esta pestana los vea en el
    // primer render (Ley 1581, minimizacion).
    queryClient.removeQueries({ queryKey: queryKeys.closer.all });
    void navigate('/closer/login', { replace: true });
  }

  const cabecera = (
    <>
      <ConsoleHeader
        closerName={closerName}
        onCerrarSesion={() => {
          void cerrarSesion();
        }}
      />

      {errorSesion !== null && (
        <div className="mx-auto max-w-[1280px] px-4 pt-5 sm:px-8">
          <p
            role="alert"
            className="rounded-[14px] border border-console-red bg-console-red-soft px-4 py-3 text-[14px] font-bold text-console-red-deep"
          >
            {errorSesion}
          </p>
        </div>
      )}
    </>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-console-paper font-display text-console-ink antialiased">
        {cabecera}
        <FichaCargando />
      </div>
    );
  }

  if (briefing === null) {
    return (
      <div className="min-h-screen bg-console-paper font-display text-console-ink antialiased">
        {cabecera}
        <div className="mx-auto max-w-[640px] px-4 py-20 text-center">
          <h1 className="mb-3 text-[28px] font-bold tracking-[-0.03em]">Ficha no disponible</h1>
          <p className="text-[15px] text-console-mute">
            {error ?? 'No encontramos este lead en tu cola.'}
          </p>
        </div>
      </div>
    );
  }

  const { lead } = briefing;

  return (
    <div className="min-h-screen bg-console-paper font-display text-console-ink antialiased">
      {cabecera}
      <BriefingHeader briefing={briefing} />

      <main
        className={`mx-auto grid max-w-[1280px] items-start gap-[22px] px-4 pt-7 pb-[90px] sm:px-8 ${COLUMNAS}`}
      >
        <div className="flex min-w-0 flex-col gap-[18px]">
          <CapacityCard lead={lead} />
          <IdentityCard lead={lead} closerName={closerName} />
          <BestTimeCard lead={lead} />
        </div>

        <div className="flex min-w-0 flex-col gap-[18px]">
          <ScoreExplainer score={lead.score} resumen={briefing.resumenScore} />
          <ProjectMatches proyectos={lead.proyectos} />
          <LeadQuotes intereses={lead.intereses} cita={lead.citaTextual} />
          <ObjectionsCard objeciones={briefing.objeciones} />
        </div>

        <div className="flex min-w-0 flex-col gap-[18px] lg:sticky lg:top-[88px]">
          <CallScript puntos={briefing.talkingPoints} estado={guion} />
          <LeadJourney timeline={lead.timeline} />
          <CallNotes leadId={leadId} gestion={lead.gestion} />
        </div>
      </main>
    </div>
  );
}
