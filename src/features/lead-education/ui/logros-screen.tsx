/**
 * Pantalla "Logros" (capa ui, F2.2) — réplica del mock de trofeos.
 */

import { Check, ChevronDown, Lightbulb, Lock, Star, Target, Trophy } from 'lucide-react';
import { useMemo, useState, type ReactElement } from 'react';
import { Button, Card, EmptyState, ProgressBar, Skeleton } from '@shared/ui';
import { cn } from '@shared/lib/cn';
import { useEducationJourney } from '../model/use-education-journey';
import { etiquetaLead } from '../model/perfil-desde-lead';
import { logrosDesdeJourney } from '../model/logros-desde-journey';
import {
  CATEGORIAS_FILTRO,
  resumenLogros,
  type LogroCatalogItem,
  type LogroCategoria,
} from '../model/logros.catalog';
import { Reveal, Stagger } from './motion-reveal';
import { TopStats } from './top-stats';

export interface LogrosScreenProps {
  leadId: string;
  onLogout: () => void;
}

type Orden = 'recientes' | 'xp' | 'nombre';

export function LogrosScreen({ leadId, onLogout }: LogrosScreenProps): ReactElement {
  const [filtro, setFiltro] = useState<LogroCategoria | 'todos'>('todos');
  const [orden, setOrden] = useState<Orden>('recientes');

  const { data, isLoading, isError, errorMessage, refetch } = useEducationJourney(leadId);
  const journey = data?.journey;
  const lead = data?.lead;

  const logros = useMemo(
    () => (journey !== undefined ? logrosDesdeJourney(journey) : []),
    [journey],
  );
  const resumen = useMemo(() => resumenLogros(logros), [logros]);
  const puntosTotales = journey?.puntosTotales ?? 0;
  const progresoGeneral = resumen.total === 0 ? 0 : resumen.obtenidos / resumen.total;

  const visibles = useMemo(() => {
    let lista = [...logros];
    if (filtro !== 'todos') {
      lista = lista.filter((l) => l.categoria === filtro);
    }
    if (orden === 'xp') {
      lista.sort((a, b) => b.xp - a.xp);
    } else if (orden === 'nombre') {
      lista.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
    } else {
      // obtenidos primero, luego el resto ("Más recientes")
      lista.sort((a, b) => Number(b.obtenido) - Number(a.obtenido));
    }
    return lista;
  }, [logros, filtro, orden]);

  if (isLoading) {
    return (
      <main className="mx-auto flex max-w-[1280px] flex-col gap-6 p-4 pb-16 sm:p-6 lg:p-8 xl:px-10">
        <Skeleton variant="text" lines={2} className="max-w-sm" />
        <Skeleton variant="block" className="h-32" />
        <Skeleton variant="block" className="h-64" />
      </main>
    );
  }

  if (isError || journey === undefined || lead === undefined) {
    return (
      <main className="mx-auto max-w-[1280px] p-4 sm:p-6 lg:p-8">
        <EmptyState
          title="No pudimos cargar tus logros"
          description={errorMessage ?? 'Revisa que el servidor esté disponible e inténtalo de nuevo.'}
          action={
            <Button variant="accent" onClick={refetch}>
              Reintentar
            </Button>
          }
        />
      </main>
    );
  }

  return (
    <Stagger
      as="main"
      className="mx-auto flex max-w-[1280px] flex-col gap-6 p-4 pb-16 sm:p-6 lg:p-8 xl:px-10"
    >
      <Reveal className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1
            id="logros"
            className="flex items-center gap-2.5 font-display text-3xl font-bold tracking-tight text-text sm:text-4xl"
          >
            <Trophy aria-hidden="true" className="size-8 fill-brand text-brand-700" />
            Logros
          </h1>
          <p className="mt-2 text-base text-text-muted">
            Cada logro te acerca más a tu hogar ideal.
          </p>
        </div>
        <TopStats puntosTotales={puntosTotales} etiqueta={etiquetaLead(lead)} onLogout={onLogout} />
      </Reveal>

      <Reveal className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card className="shadow-card">
          <p className="mb-4 text-sm font-semibold text-text">Resumen de tus logros</p>
          <div className="grid gap-4 sm:grid-cols-3">
            <ResumenStat
              icono={<Trophy aria-hidden="true" className="size-5 text-brand-700" />}
              valor={`${String(resumen.obtenidos)} / ${String(resumen.total)}`}
              label="Logros obtenidos"
              fondo="bg-brand-50"
            />
            <ResumenStat
              icono={<Star aria-hidden="true" className="size-5 fill-accent-600 text-accent-600" />}
              valor={puntosTotales.toLocaleString('es-CO')}
              label="XP totales"
              fondo="bg-accent-50"
            />
            <ResumenStat
              icono={<Target aria-hidden="true" className="size-5 text-success" />}
              valor={String(resumen.categoriasCompletas)}
              label="Categorías completadas"
              fondo="bg-success-soft"
            />
          </div>
        </Card>

        <Card className="shadow-card">
          <div className="mb-2 flex items-baseline justify-between gap-3">
            <span className="text-sm font-semibold text-text">Progreso general</span>
            <span className="font-display text-2xl font-bold tabular-nums text-accent-700">
              {Math.round(progresoGeneral * 100)}%
            </span>
          </div>
          <ProgressBar
            value={progresoGeneral}
            max={1}
            tone="brand"
            size="lg"
            ariaLabel="Progreso de logros"
          />
          <p className="mt-2.5 text-sm text-text-muted">¡Vas excelente! Sigue así</p>
        </Card>
      </Reveal>

      <Reveal>
        <div
          className="flex gap-2 overflow-x-auto pb-1"
          role="tablist"
          aria-label="Categorías de logros"
        >
          {CATEGORIAS_FILTRO.map((cat) => {
            const activo = filtro === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                role="tab"
                aria-selected={activo}
                onClick={() => {
                  setFiltro(cat.id);
                }}
                className={cn(
                  'focus-ring inline-flex shrink-0 items-center gap-2 rounded-pill border px-3.5 py-2 text-sm font-semibold transition-colors',
                  activo
                    ? 'border-accent-200 bg-accent-50 text-accent-700'
                    : 'border-border bg-surface text-text-muted hover:bg-surface-3',
                )}
              >
                <cat.icono aria-hidden="true" className="size-4" />
                {cat.label}
              </button>
            );
          })}
        </div>
      </Reveal>

      <Reveal>
        <section aria-labelledby="tus-logros-titulo">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 id="tus-logros-titulo" className="text-base font-bold text-text">
              Tus logros
            </h2>
            <label className="relative inline-flex items-center gap-2 text-sm text-text-muted">
              <span className="sr-only">Ordenar</span>
              <select
                value={orden}
                onChange={(evento) => {
                  setOrden(evento.target.value as Orden);
                }}
                className="focus-ring appearance-none rounded-field border border-border bg-surface py-2 pr-9 pl-3 text-sm font-semibold text-text"
              >
                <option value="recientes">Más recientes</option>
                <option value="xp">Más XP</option>
                <option value="nombre">Nombre</option>
              </select>
              <ChevronDown
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-text-subtle"
              />
            </label>
          </div>

          <ul className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {visibles.map((logro) => (
              <li key={logro.id}>
                <LogroCard logro={logro} />
              </li>
            ))}
          </ul>
        </section>
      </Reveal>

      <Reveal>
        <aside className="flex items-start gap-3 rounded-card bg-accent-600 px-4 py-3.5 text-white shadow-card sm:items-center">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/15">
            <Lightbulb aria-hidden="true" className="size-5" />
          </span>
          <p className="text-sm leading-snug font-medium">
            Consejo: Sigue completando lecciones y retos para desbloquear más logros y ganar XP.
          </p>
        </aside>
      </Reveal>
    </Stagger>
  );
}

function ResumenStat({
  icono,
  valor,
  label,
  fondo,
}: {
  icono: ReactElement;
  valor: string;
  label: string;
  fondo: string;
}): ReactElement {
  return (
    <div className="flex items-center gap-3">
      <span className={cn('flex size-11 shrink-0 items-center justify-center rounded-full', fondo)}>
        {icono}
      </span>
      <div className="min-w-0">
        <p className="font-display text-xl font-bold tabular-nums text-text">{valor}</p>
        <p className="text-xs text-text-muted">{label}</p>
      </div>
    </div>
  );
}

function LogroCard({ logro }: { logro: LogroCatalogItem }): ReactElement {
  const bloqueado = !logro.obtenido;

  return (
    <article
      className={cn(
        'relative flex h-full flex-col overflow-hidden rounded-card border border-border bg-surface shadow-card',
        bloqueado && 'opacity-70',
      )}
    >
      {logro.nuevo === true && logro.obtenido && (
        <span className="absolute top-2.5 left-2.5 z-10 rounded-pill bg-success px-2 py-0.5 text-[0.625rem] font-bold text-white">
          ¡Nuevo!
        </span>
      )}

      <div
        className={cn(
          'flex flex-1 flex-col items-center gap-2 px-3 pt-6 pb-4 text-center',
          bloqueado && 'grayscale',
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            'flex size-14 shrink-0 items-center justify-center rounded-full',
            logro.obtenido ? 'bg-brand-100 text-brand-800' : 'bg-surface-3 text-text-subtle',
          )}
        >
          <logro.icono className="size-6" />
        </span>
        <h3 className="text-sm leading-snug font-bold text-text">{logro.nombre}</h3>
        <p className="line-clamp-2 text-[0.6875rem] leading-snug text-text-muted">
          {logro.descripcion}
        </p>
      </div>

      <div
        className={cn(
          'mt-auto flex items-center justify-between gap-2 px-3 py-2.5 text-[0.6875rem] font-bold',
          logro.obtenido ? 'bg-success-soft text-success' : 'bg-surface-3 text-text-subtle',
        )}
      >
        <span className="inline-flex items-center gap-1">
          {logro.obtenido ? (
            <Check aria-hidden="true" className="size-3.5 stroke-[3]" />
          ) : (
            <Lock aria-hidden="true" className="size-3.5" />
          )}
          {logro.obtenido ? 'Obtenido' : 'Bloqueado'}
        </span>
        <span>+{logro.xp} XP</span>
      </div>
    </article>
  );
}
