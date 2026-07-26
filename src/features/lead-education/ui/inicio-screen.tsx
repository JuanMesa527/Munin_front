/**
 * Pantalla "Inicio" (capa ui, F2.2) — réplica del mock del dashboard de
 * bienvenida: siguiente paso destacado, progreso general, recomendaciones,
 * actividad reciente y preguntas frecuentes.
 */

import { ArrowRight, BookOpen, CheckCircle2, Home, Landmark, Sparkles } from 'lucide-react';
import type { ReactElement } from 'react';
import type { ContenidoEducativo, EducationJourney, EtapaId, Meta } from '@contracts';
import { Alert, Button, Card, EmptyState, Skeleton } from '@shared/ui';
import { useEducationJourney } from '../model/use-education-journey';
import { useLessonReader } from '../model/use-lesson-reader';
import { useProgressEvent } from '../model/use-progress-event';
import { ETAPA_COPY, type EtapaCopy } from '../model/etapa-copy';
import { etiquetaLead } from '../model/perfil-desde-lead';
import { conocimientoPorArea, resumenAprendizaje } from '../model/progreso-stats';
import { FaqWidget } from './faq-widget';
import { LessonReaderModal } from './lesson-reader-modal';
import { Reveal, Stagger } from './motion-reveal';
import { TopStats } from './top-stats';

export interface InicioScreenProps {
  leadId: string;
  onIrACamino: () => void;
  onIrAProgreso: () => void;
  onLogout: () => void;
}

function primeraEtapaIncompleta(journey: EducationJourney): EtapaId | undefined {
  const etapas = [...(journey.etapas ?? [])].sort((a, b) => a.orden - b.orden);
  const incompleta = etapas.find((etapa) => {
    const todas = journey.metas.filter((meta) => meta.etapa === etapa.id);
    if (todas.length === 0) return true; // caso borde: etapa sin metas, tratarla como pendiente.
    // Las metas opcionales no cuentan: si TODAS las metas reales de la etapa
    // son opcionales (o ya están completas), la etapa no debería seguir marcada
    // como "en progreso" para siempre.
    const queCuentan = todas.filter((meta) => meta.opcional !== true);
    return queCuentan.some((meta) => !meta.completada);
  });
  return (incompleta ?? etapas[0])?.id;
}

function eventoCompletarPara(meta: Meta): 'afiliacion_iniciada' | 'contenido_visto' {
  return meta.tipo === 'afiliacion' ? 'afiliacion_iniciada' : 'contenido_visto';
}

export function InicioScreen({
  leadId,
  onIrACamino,
  onIrAProgreso,
  onLogout,
}: InicioScreenProps): ReactElement {
  const { data, isLoading, isError, errorMessage, refetch } = useEducationJourney(leadId);
  const { registrar, isPending } = useProgressEvent(leadId);
  const { etapaAbierta, pasoInicial, abrir, cerrar } = useLessonReader(data?.contenidos ?? []);
  const journey = data?.journey;
  const lead = data?.lead;

  if (isLoading) {
    return (
      <main className="mx-auto flex min-w-0 max-w-[1280px] flex-col gap-6 p-4 sm:p-6 lg:p-8">
        <Skeleton variant="text" lines={2} className="max-w-sm" />
        <Skeleton variant="block" className="h-52" />
        <Skeleton variant="block" className="h-40" />
      </main>
    );
  }

  if (isError || journey === undefined || lead === undefined) {
    return (
      <main className="mx-auto max-w-[1280px] p-4 sm:p-6 lg:p-8">
        <EmptyState
          title="No pudimos cargar tu camino"
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
          title="Todavía no hay un camino armado"
          description="Completa la conversación inicial para que armemos tu plan personalizado."
        />
      </main>
    );
  }

  const etapaActual = primeraEtapaIncompleta(journey);
  const metasDeLaEtapa = journey.metas.filter((meta) => meta.etapa === etapaActual);
  const siguienteMeta = metasDeLaEtapa.find((meta) => !meta.completada);
  const contenidos: readonly ContenidoEducativo[] = data?.contenidos ?? [];
  const recomendadas = contenidos.filter((c) => c.etapa === etapaActual).slice(0, 3);

  const resumen = resumenAprendizaje(journey);
  const areas = conocimientoPorArea(journey);
  const areaFuerte = areas[0];

  const completadasRecientes = journey.metas.filter((meta) => meta.completada).slice(-2).reverse();

  const metaEducativaAbierta =
    etapaAbierta !== undefined
      ? journey.metas.find((meta) => meta.etapa === etapaAbierta && meta.tipo === 'educacion')
      : undefined;
  const etapaCopyAbierta: EtapaCopy =
    etapaAbierta !== undefined ? ETAPA_COPY[etapaAbierta] : ETAPA_COPY.descubrir;
  const contenidosDeLaEtapaAbierta = contenidos.filter((contenido) => contenido.etapa === etapaAbierta);

  return (
    <Stagger
      as="main"
      className="mx-auto flex min-w-0 max-w-[1280px] flex-col gap-6 p-4 pb-16 sm:p-6 lg:p-8 xl:px-10"
    >
      <Reveal className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-display text-3xl font-bold tracking-tight text-text sm:text-4xl">
            {lead.nombre !== null && lead.nombre.trim() !== ''
              ? `¡Hola, ${lead.nombre.split(/\s+/u)[0] ?? lead.nombre}!`
              : '¡Hola!'}
          </h1>
          <p className="mt-2 text-base text-text-muted">
            {lead.ciudad !== null
              ? `Desde ${lead.ciudad}, cada día es un paso más cerca de tu nuevo hogar.`
              : 'Cada día es un paso más cerca de tu nuevo hogar.'}
          </p>
        </div>
        <TopStats
          puntosTotales={journey.puntosTotales}
          etiqueta={etiquetaLead(lead)}
          onLogout={onLogout}
        />
      </Reveal>

      {journey.reclasificadoAViable && (
        <Reveal>
          <Alert tone="success" title="¡Ya estás listo para el siguiente paso!">
            Completaste lo esencial de tu camino. Muy pronto un asesor te va a contactar.
          </Alert>
        </Reveal>
      )}

      <Reveal className="grid min-w-0 gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="flex min-w-0 flex-col gap-6">
          {siguienteMeta !== undefined ? (
            <Card className="relative overflow-hidden shadow-card" padding="lg">
              <span className="inline-flex items-center gap-1.5 rounded-pill bg-brand-100 px-3 py-1 text-xs font-bold text-brand-800">
                <Sparkles aria-hidden="true" className="size-3.5" />
                Tu siguiente paso
              </span>
              <h2 className="mt-3 max-w-md font-display text-2xl font-bold text-text sm:text-3xl">
                {siguienteMeta.titulo}
              </h2>
              <p className="mt-2 max-w-md text-sm text-text-muted">{siguienteMeta.descripcion}</p>
              <span
                aria-hidden="true"
                className="absolute top-6 right-6 hidden size-20 items-center justify-center rounded-full bg-white/60 text-brand-800 sm:flex"
              >
                <Home className="size-10" strokeWidth={1.75} />
              </span>
              <Button
                variant="accent"
                className="mt-6"
                iconRight={<ArrowRight aria-hidden="true" className="size-4" />}
                loading={isPending}
                onClick={() => {
                  if (siguienteMeta.tipo === 'ahorro') {
                    onIrACamino();
                    return;
                  }
                  if (etapaActual !== undefined) abrir(etapaActual, recomendadas[0]?.id);
                }}
              >
                {siguienteMeta.tipo === 'ahorro' ? 'Ir a registrar aporte' : 'Comenzar'}
              </Button>
            </Card>
          ) : (
            <Alert tone="success" title="¡Completaste esta etapa!">
              Andá a "Mi camino" para elegir la siguiente.
            </Alert>
          )}

          <Card className="shadow-card">
            <p className="mb-3 text-sm font-bold text-text">Continúa donde lo dejaste</p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <span className="flex size-14 shrink-0 items-center justify-center rounded-card bg-accent-50 text-accent-700">
                <Landmark className="size-6" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-text">
                  {recomendadas[0]?.titulo ?? 'Tu camino a la vivienda'}
                </p>
                <p className="text-xs text-text-muted">
                  Etapa: {areaFuerte?.titulo ?? 'Camino a Mi Hogar'}
                </p>
              </div>
              <Button variant="secondary" onClick={onIrACamino}>
                Continuar
              </Button>
            </div>
          </Card>

          <Card className="shadow-card">
            <p className="mb-3 text-sm font-bold text-text">Actividad reciente</p>
            <div className="grid min-w-0 gap-3 sm:grid-cols-2">
              {completadasRecientes.length > 0 ? (
                completadasRecientes.map((meta) => (
                  <div key={meta.id} className="flex items-start gap-3 rounded-card bg-surface-2 p-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-success-soft text-success">
                      <CheckCircle2 aria-hidden="true" className="size-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-text">{meta.titulo}</p>
                      <p className="text-xs font-bold text-success">+{meta.puntos} XP</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-text-muted sm:col-span-2">
                  Todavía no completaste ningún paso — ¡empezá por el de arriba!
                </p>
              )}
            </div>
          </Card>
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          <Card className="shadow-card">
            <p className="mb-3 text-sm font-bold text-text">Tu progreso general</p>
            <div className="flex items-center gap-4">
              <ProgresoCircular value={journey.progreso} />
              <ul className="flex-1 text-sm">
                <ResumenLinea
                  icono={<BookOpen aria-hidden="true" className="size-4" />}
                  label="Lecciones"
                  valor={`${String(resumen.leccionesCompletadas)} / ${String(resumen.leccionesTotales)}`}
                />
                <ResumenLinea
                  icono={<CheckCircle2 aria-hidden="true" className="size-4" />}
                  label="Retos superados"
                  valor={`${String(resumen.evaluacionesAprobadas)} / ${String(resumen.evaluacionesTotales)}`}
                />
                <ResumenLinea
                  icono={<Sparkles aria-hidden="true" className="size-4" />}
                  label="XP acumulados"
                  valor={journey.puntosTotales.toLocaleString('es-CO')}
                />
              </ul>
            </div>
            <Button variant="ghost" className="mt-4 w-full" onClick={onIrAProgreso}>
              Ver mi progreso detallado
              <ArrowRight aria-hidden="true" className="ml-1 inline size-4" />
            </Button>
          </Card>

          {recomendadas.length > 0 && (
            <Card className="shadow-card">
              <p className="mb-3 text-sm font-bold text-text">Lecciones recomendadas para ti</p>
              <ul className="flex flex-col divide-y divide-border">
                {recomendadas.map((contenido) => (
                  <li key={contenido.id}>
                    <button
                      type="button"
                      onClick={() => {
                        abrir(contenido.etapa, contenido.id);
                      }}
                      className="focus-ring flex w-full items-center gap-3 rounded-card py-3 text-left first:pt-0 last:pb-0 hover:bg-surface-2"
                    >
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-800">
                        <BookOpen className="size-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-text">{contenido.titulo}</p>
                        <p className="truncate text-xs text-text-muted">{contenido.cuerpo}</p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <FaqWidget contenidos={contenidos} />
        </div>
      </Reveal>

      <LessonReaderModal
        open={etapaAbierta !== undefined}
        etapaCopy={etapaCopyAbierta}
        contenidos={contenidosDeLaEtapaAbierta}
        pasoInicial={pasoInicial}
        metaEducativa={metaEducativaAbierta}
        plan={journey.plan}
        isPending={isPending}
        onClose={cerrar}
        onCompletar={() => {
          if (metaEducativaAbierta !== undefined) {
            registrar({
              metaId: metaEducativaAbierta.id,
              tipo: eventoCompletarPara(metaEducativaAbierta),
              valor: 1,
            });
          }
        }}
      />
    </Stagger>
  );
}

function ProgresoCircular({ value }: { value: number }): ReactElement {
  const pct = Math.round(Math.min(Math.max(value, 0), 1) * 100);
  const radio = 40;
  const circunferencia = 2 * Math.PI * radio;
  const offset = circunferencia * (1 - pct / 100);

  return (
    <div className="relative size-24 shrink-0">
      <svg viewBox="0 0 100 100" className="size-full -rotate-90" aria-hidden="true">
        <circle cx="50" cy="50" r={radio} fill="none" className="stroke-surface-3" strokeWidth="9" />
        <circle
          cx="50"
          cy="50"
          r={radio}
          fill="none"
          className="stroke-brand"
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={String(circunferencia)}
          strokeDashoffset={String(offset)}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-display text-lg font-bold text-accent-700">{pct}%</span>
      </div>
      <span className="sr-only">{pct}% del camino completado</span>
    </div>
  );
}

function ResumenLinea({
  icono,
  label,
  valor,
}: {
  icono: ReactElement;
  label: string;
  valor: string;
}): ReactElement {
  return (
    <li className="flex items-center gap-2 py-1.5">
      <span className="text-text-subtle">{icono}</span>
      <span className="flex-1 text-text-muted">{label}</span>
      <span className="font-semibold tabular-nums text-text">{valor}</span>
    </li>
  );
}
