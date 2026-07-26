/**
 * Pantalla "Progreso" (capa ui, F2.2) — réplica del mock de analítica:
 * stats generales, conocimiento por área, evolución y distribución de tiempo.
 *
 * Todas las métricas se DERIVAN de `EducationJourney` real (ver
 * `model/progreso-stats.ts`) — nada aleatorio ni fijo.
 */

import { Award, BookOpen, CheckCircle2, Clock, TrendingUp } from 'lucide-react';
import type { ReactElement } from 'react';
import {
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Button, Card, EmptyState, ProgressBar, Skeleton } from '@shared/ui';
import { useEducationJourney } from '../model/use-education-journey';
import { etiquetaLead } from '../model/perfil-desde-lead';
import {
  conocimientoPorArea,
  distribucionTiempo,
  evolucionAprendizaje,
  formatTiempo,
  resumenAprendizaje,
  resumenCamino,
} from '../model/progreso-stats';
import { Reveal, Stagger } from './motion-reveal';
import { TopStats } from './top-stats';

export interface ProgresoScreenProps {
  leadId: string;
}

const COLORES_DONUT = ['#1E5AA8', '#2E9E4F', '#F2CE1B', '#D64545', '#8A867A'];

function nivelDe(progreso: number): string {
  if (progreso >= 0.66) return 'Avanzado';
  if (progreso >= 0.33) return 'Intermedio';
  return 'Principiante';
}

export function ProgresoScreen({ leadId }: ProgresoScreenProps): ReactElement {
  const { data, isLoading, isError, errorMessage, refetch } = useEducationJourney(leadId);
  const journey = data?.journey;
  const lead = data?.lead;

  if (isLoading) {
    return (
      <main className="mx-auto flex min-w-0 max-w-[1280px] flex-col gap-6 p-4 sm:p-6 lg:p-8">
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
          title="No pudimos cargar tu progreso"
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

  if (journey.metas.length === 0) {
    return (
      <main className="mx-auto max-w-[1280px] p-4 sm:p-6 lg:p-8">
        <EmptyState
          title="Todavía no hay progreso para mostrar"
          description="Empieza tu camino para que esta pantalla se llene de datos."
        />
      </main>
    );
  }

  const resumen = resumenAprendizaje(journey);
  const areas = conocimientoPorArea(journey);
  const evolucion = evolucionAprendizaje(journey);
  const distribucion = distribucionTiempo(journey);
  const resumenEtapas = resumenCamino(journey);

  const fortalezas = areas.filter((a) => a.porcentaje >= 70).slice(0, 3);
  const oportunidades = areas.filter((a) => a.porcentaje < 70).slice(0, 3);

  return (
    <Stagger
      as="main"
      className="mx-auto flex min-w-0 max-w-[1280px] flex-col gap-6 p-4 pb-16 sm:p-6 lg:p-8 xl:px-10"
    >
      <Reveal className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="flex items-center gap-2.5 font-display text-3xl font-bold tracking-tight text-text sm:text-4xl">
            <TrendingUp aria-hidden="true" className="size-8 text-accent-700" />
            Progreso
          </h1>
          <p className="mt-2 text-base text-text-muted">Así va tu aprendizaje y evolución día a día.</p>
        </div>
        <TopStats puntosTotales={journey.puntosTotales} etiqueta={etiquetaLead(lead)} />
      </Reveal>

      <Reveal className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          icono={<Award aria-hidden="true" className="size-5 text-brand-700" />}
          fondo="bg-brand-50"
          label="Nivel actual"
          valor={nivelDe(journey.progreso)}
          hint={`${String(Math.round(journey.progreso * 100))}% del camino`}
        />
        <StatTile
          icono={<BookOpen aria-hidden="true" className="size-5 text-accent-700" />}
          fondo="bg-accent-50"
          label="Lecciones completadas"
          valor={`${String(resumen.leccionesCompletadas)} / ${String(resumen.leccionesTotales)}`}
        />
        <StatTile
          icono={<CheckCircle2 aria-hidden="true" className="size-5 text-success" />}
          fondo="bg-success-soft"
          label="Retos superados"
          valor={`${String(resumen.evaluacionesAprobadas)} / ${String(resumen.evaluacionesTotales)}`}
        />
        <StatTile
          icono={<Clock aria-hidden="true" className="size-5 text-text-muted" />}
          fondo="bg-surface-3"
          label="Tiempo de aprendizaje"
          valor={formatTiempo(resumen.tiempoMinutos)}
        />
      </Reveal>

      <Reveal className="grid gap-4 lg:grid-cols-2">
        <Card className="shadow-card">
          <p className="text-sm font-bold text-text">Conocimiento por área</p>
          <p className="mb-4 text-xs text-text-muted">Tu nivel de dominio en cada etapa del camino.</p>
          <ul className="flex flex-col gap-3.5">
            {areas.map((area) => (
              <li key={area.etapa}>
                <div className="mb-1 flex items-baseline justify-between gap-2 text-sm">
                  <span className="flex items-center gap-1.5 font-semibold text-text">
                    <area.icono aria-hidden="true" className="size-3.5 text-text-subtle" />
                    {area.titulo}
                  </span>
                  <span className="text-xs text-text-subtle">
                    {area.porcentaje}% · {area.nivel}
                  </span>
                </div>
                <ProgressBar
                  value={area.porcentaje}
                  max={100}
                  tone={area.porcentaje >= 70 ? 'accent' : 'brand'}
                  size="sm"
                  ariaLabel={`Dominio en ${area.titulo}`}
                />
              </li>
            ))}
          </ul>
        </Card>

        <Card className="shadow-card">
          <p className="text-sm font-bold text-text">Evolución de tu aprendizaje</p>
          <p className="mb-2 text-xs text-text-muted">Así ha crecido tu progreso con el tiempo.</p>
          {evolucion.length >= 2 ? (
            <>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={evolucion} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                    <CartesianGrid stroke="var(--color-border)" vertical={false} />
                    <XAxis
                      dataKey="etiqueta"
                      tick={{ fontSize: 11, fill: 'var(--color-text-subtle)' }}
                      axisLine={{ stroke: 'var(--color-border)' }}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fontSize: 11, fill: 'var(--color-text-subtle)' }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v: number) => `${String(v)}%`}
                    />
                    <Tooltip
                      formatter={(value) => [`${String(value)}%`, 'Progreso']}
                      contentStyle={{
                        borderRadius: 10,
                        borderColor: 'var(--color-border)',
                        fontSize: 12,
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="porcentaje"
                      stroke="var(--color-accent-600)"
                      strokeWidth={2.5}
                      dot={{ r: 3.5 }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p className="mt-2 rounded-card bg-accent-50 px-3 py-2 text-xs font-medium text-accent-800">
                {journey.progreso >= 0.5
                  ? '¡Vas mejorando! Tu constancia está dando resultados.'
                  : 'Cada paso cuenta — sigue completando etapas para ver tu curva subir.'}
              </p>
            </>
          ) : (
            <EmptyState
              className="h-56 justify-center"
              title="Todavía no hay suficiente historial de lecciones completadas para mostrar tu evolución"
              description="A medida que avances, esta curva se va a llenar sola."
            />
          )}
        </Card>
      </Reveal>

      <Reveal className="grid gap-4 lg:grid-cols-3">
        <Card className="shadow-card">
          <p className="mb-3 text-sm font-bold text-text">Resumen de tu camino</p>
          <ul className="flex flex-col divide-y divide-border text-sm">
            <ResumenFila label="Etapas completadas" valor={`${String(resumenEtapas.etapasCompletadas)} / ${String(resumenEtapas.etapasTotales)}`} />
            <ResumenFila label="Etapa en progreso" valor={String(resumenEtapas.etapasEnProgreso)} />
            <ResumenFila label="Etapas pendientes" valor={String(resumenEtapas.etapasPendientes)} />
          </ul>
        </Card>

        <Card className="shadow-card">
          <p className="mb-3 text-sm font-bold text-text">Fortalezas y oportunidades</p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="mb-1.5 text-xs font-bold text-success">Tus fortalezas</p>
              <ul className="flex flex-col gap-1">
                {fortalezas.length > 0 ? (
                  fortalezas.map((a) => <li key={a.etapa} className="truncate text-text-muted">{a.titulo}</li>)
                ) : (
                  <li className="text-text-subtle">Todavía en camino</li>
                )}
              </ul>
            </div>
            <div>
              <p className="mb-1.5 text-xs font-bold text-warning">Por reforzar</p>
              <ul className="flex flex-col gap-1">
                {oportunidades.length > 0 ? (
                  oportunidades.map((a) => <li key={a.etapa} className="truncate text-text-muted">{a.titulo}</li>)
                ) : (
                  <li className="text-text-subtle">¡Vas parejo en todo!</li>
                )}
              </ul>
            </div>
          </div>
        </Card>

        <Card className="shadow-card">
          <p className="mb-3 text-sm font-bold text-text">Distribución de tu tiempo</p>
          {distribucion.length > 0 ? (
            <div className="flex items-center gap-4">
              <div className="size-24 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={distribucion}
                      dataKey="proporcion"
                      nameKey="titulo"
                      innerRadius={28}
                      outerRadius={44}
                      strokeWidth={2}
                    >
                      {distribucion.map((_, indice) => (
                        // eslint-disable-next-line @typescript-eslint/no-deprecated -- `Cell` sigue funcional en recharts v3 (se retira en v4); el reemplazo (`shape` con un `Sector` a mano) es mas codigo para el mismo resultado en una demo.
                        <Cell key={indice} fill={COLORES_DONUT[indice % COLORES_DONUT.length] ?? '#8A867A'} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="min-w-0 flex-1 text-xs">
                {distribucion.map((item, indice) => (
                  <li key={item.etapa} className="flex items-center gap-1.5 py-0.5">
                    <span
                      aria-hidden="true"
                      className="size-2 shrink-0 rounded-full"
                      style={{ backgroundColor: COLORES_DONUT[indice % COLORES_DONUT.length] ?? '#8A867A' }}
                    />
                    <span className="min-w-0 flex-1 truncate text-text-muted">{item.titulo}</span>
                    <span className="shrink-0 font-semibold text-text">{formatTiempo(item.minutos)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-sm text-text-muted">Completa pasos para ver en qué invertiste tu tiempo.</p>
          )}
        </Card>
      </Reveal>
    </Stagger>
  );
}

function StatTile({
  icono,
  fondo,
  label,
  valor,
  hint,
}: {
  icono: ReactElement;
  fondo: string;
  label: string;
  valor: string;
  hint?: string;
}): ReactElement {
  return (
    <Card className="shadow-card">
      <span className={`flex size-10 items-center justify-center rounded-full ${fondo}`}>{icono}</span>
      <p className="mt-3 text-xs font-semibold text-text-muted">{label}</p>
      <p className="mt-0.5 font-display text-xl font-bold text-text">{valor}</p>
      {hint !== undefined && <p className="mt-0.5 text-xs text-text-subtle">{hint}</p>}
    </Card>
  );
}

function ResumenFila({ label, valor }: { label: string; valor: string }): ReactElement {
  return (
    <li className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
      <span className="text-text-muted">{label}</span>
      <span className="font-semibold tabular-nums text-text">{valor}</span>
    </li>
  );
}
