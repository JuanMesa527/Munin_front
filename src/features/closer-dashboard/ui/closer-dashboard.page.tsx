/**
 * F3 · closer-dashboard — la cola de leads viables del comercial.
 *
 * Es donde se demuestra el 20% de la rubrica (reduccion de ruido): el comercial
 * NO ve los 214 leads crudos que entraron por pauta, ve los que quedaron
 * despues de perfilar, ordenados por probabilidad de cierre. El contador
 * "214 crudos → N viables" existe para que esa reduccion sea literal y visible
 * en pantalla, no un claim del pitch.
 */

import { useState, type ReactElement } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import type { LeadListSort } from '@contracts';
import { ConsoleHeader, Skeleton } from '@shared/ui';
import { SEED_LEADS_CRUDOS } from '@shared/demo';
import { queryKeys } from '@shared/api/query-keys';
import { useCloserSession } from '@shared/auth/use-closer-session';
import { logoutCloser } from '../api/closer-dashboard.api';
import { useLeadQueue } from '../model/use-lead-queue';
import { LeadRow } from './lead-row';
import { QueueFilters } from './queue-filters';
import { QueueStatsPanel } from './queue-stats';

const COLUMNAS = 'md:grid-cols-[76px_1.5fr_1fr_1.2fr_auto]';

export interface CloserDashboardPageProps {
  /** Orden inicial de la cola. Configurable para el ensayo del pitch. */
  ordenInicial?: LeadListSort;
}

function EncabezadoTabla(): ReactElement {
  return (
    <div
      aria-hidden="true"
      className={`hidden grid-cols-1 gap-5 px-6 pb-2.5 font-mono text-[11px] font-bold tracking-[0.1em] text-console-mute uppercase md:grid ${COLUMNAS}`}
    >
      <span>Score</span>
      <span>Lead</span>
      <span>Capacidad estimada</span>
      <span>Mejor match</span>
      <span />
    </div>
  );
}

function ColaCargando(): ReactElement {
  return (
    <div aria-busy="true" aria-live="polite" className="flex flex-col gap-3">
      <span className="sr-only">Cargando tus leads viables…</span>
      {[0, 1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-[106px] rounded-[18px]" />
      ))}
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

export function CloserDashboardPage({
  ordenInicial = 'score_desc',
}: CloserDashboardPageProps): ReactElement {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { session } = useCloserSession();
  const cola = useLeadQueue(ordenInicial);

  const [errorSesion, setErrorSesion] = useState<string | null>(null);

  async function cerrarSesion(): Promise<void> {
    setErrorSesion(null);
    const respuesta = await logoutCloser();

    if (!respuesta.ok) {
      setErrorSesion(ERROR_LOGOUT);
      return;
    }

    // La cola y la sesion cacheadas sobreviven a la navegacion: sin esto, el
    // siguiente comercial que entre en esta pestana veria los leads del
    // anterior durante el primer render (Ley 1581, minimizacion).
    queryClient.removeQueries({ queryKey: queryKeys.closer.all });
    void navigate('/closer/login', { replace: true });
  }

  return (
    <div className="min-h-screen bg-console-paper font-display text-console-ink antialiased">
      <ConsoleHeader
        closerName={session?.nombre ?? 'Closer'}
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

      <main className="mx-auto max-w-[1280px] px-4 pt-9 pb-20 sm:px-8">
        <p className="mb-2.5 font-mono text-[12px] font-bold tracking-[0.16em] text-console-signal-text uppercase">
          Repositorio de leads viables
        </p>

        <div className="mb-7 flex flex-wrap items-end justify-between gap-6">
          <div>
            <h1 className="mb-2.5 text-[clamp(2rem,5vw,44px)] leading-none font-bold tracking-[-0.03em]">
              Tus leads de hoy
            </h1>
            <p className="max-w-[58ch] text-[16px] text-console-body">
              Solo aparecen leads perfilados y viables, ordenados por probabilidad de cierre.
              Todo lo demás ya se filtró antes de llegar aquí.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-full bg-console-green-soft px-4 py-[9px]">
            <span
              aria-hidden="true"
              className="size-2 animate-console-pulse rounded-full bg-console-green"
            />
            <span className="font-mono text-[12px] font-bold text-console-green-deep">
              {cola.stats.total} viables de {SEED_LEADS_CRUDOS} entradas
            </span>
          </div>
        </div>

        <QueueStatsPanel stats={cola.stats} />

        <QueueFilters
          chip={cola.chip}
          query={cola.query}
          sort={cola.sort}
          onChipChange={cola.setChip}
          onQueryChange={cola.setQuery}
          onSortChange={cola.setSort}
        />

        <EncabezadoTabla />

        {cola.isLoading ? (
          <ColaCargando />
        ) : (
          <div className="flex flex-col gap-3">
            {cola.visibles.map((lead) => (
              <LeadRow key={lead.leadId} lead={lead} />
            ))}
          </div>
        )}

        {cola.isEmpty && (
          <div className="mt-3 rounded-[18px] border-[1.5px] border-dashed border-console-edge bg-console-surface p-14 text-center">
            <div className="mb-2 text-[20px] font-bold">Sin leads para ese filtro</div>
            <p className="text-[15px] text-console-mute">
              Prueba con otro filtro o limpia la búsqueda.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
