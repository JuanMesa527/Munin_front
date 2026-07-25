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

import type { ReactElement } from 'react';
import { useParams } from 'react-router';
import { ConsoleHeader, Skeleton } from '@shared/ui';
import { useCloserSession } from '@shared/auth/use-closer-session';
import { useBriefing } from '../model/use-briefing';
import { useCallTimer } from '../model/use-call-timer';
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

export function CloserBriefingPage(): ReactElement {
  const { leadId = '' } = useParams<{ leadId: string }>();
  const { session } = useCloserSession();
  const { briefing, isLoading, error } = useBriefing(leadId);

  const timer = useCallTimer();
  const guion = useTalkingPoints(briefing?.talkingPoints.length ?? 0);

  const closerName = session?.nombre ?? 'Closer';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-console-paper font-display text-console-ink antialiased">
        <ConsoleHeader closerName={closerName} />
        <FichaCargando />
      </div>
    );
  }

  if (briefing === null) {
    return (
      <div className="min-h-screen bg-console-paper font-display text-console-ink antialiased">
        <ConsoleHeader closerName={closerName} />
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
      <ConsoleHeader closerName={closerName} />
      <BriefingHeader lead={lead} timer={timer} />

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
          <CallNotes />
        </div>
      </main>
    </div>
  );
}
