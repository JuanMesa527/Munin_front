/**
 * Pantalla de entrada de F2.2 "Camino a Mi Hogar" (capa ui).
 *
 * Composición: top stats → hero (título + progreso) → camino → resumen →
 * siguiente lección/nivel/faq → plan SFV → metas accionables → currículo
 * ordenado de la etapa (`EtapaCurriculo`), que abre el lector paso a paso
 * (`LessonReaderModal`) en vez de completar la meta educativa al toque.
 */

import { ArrowRight } from 'lucide-react';
import { useEffect, useRef, useState, type ReactElement } from 'react';
import type { Badge as BadgeType, EducationJourney, EtapaId, Meta, ProgressEvent } from '@contracts';
import { Alert, Button, Card, EmptyState, Skeleton } from '@shared/ui';
import { useEducationJourney } from '../model/use-education-journey';
import { useLessonReader } from '../model/use-lesson-reader';
import { useProgressEvent } from '../model/use-progress-event';
import { ETAPA_COPY, type EtapaCopy } from '../model/etapa-copy';
import { etiquetaLead } from '../model/perfil-desde-lead';
import { resumenCamino } from '../model/progreso-stats';
import { BadgeUnlockModal } from './badge-unlock-modal';
import { CaminoAMiHogar } from './camino-a-mi-hogar';
import { EtapaCurriculo } from './etapa-curriculo';
import { FaqWidget } from './faq-widget';
import { JourneyHeader } from './journey-header';
import { LessonReaderModal } from './lesson-reader-modal';
import { MetaCard } from './meta-card';
import { Reveal, Stagger } from './motion-reveal';
import { NextLessonCard } from './next-lesson-card';
import { NivelCard } from './nivel-card';
import { PlanSfvCard } from './plan-sfv-card';
import { TopStats } from './top-stats';

export interface LeadEducationScreenProps {
  leadId: string;
  onIrAProgreso?: () => void;
}

function primeraEtapaIncompleta(journey: EducationJourney): EtapaId | undefined {
  const etapas = [...(journey.etapas ?? [])].sort((a, b) => a.orden - b.orden);
  const incompleta = etapas.find((etapa) => {
    const propias = journey.metas.filter((meta) => meta.etapa === etapa.id);
    return propias.length === 0 || propias.some((meta) => !meta.completada);
  });
  return (incompleta ?? etapas[0])?.id;
}

function eventoCompletarPara(meta: Meta): ProgressEvent['tipo'] {
  return meta.tipo === 'afiliacion' ? 'afiliacion_iniciada' : 'contenido_visto';
}

export function LeadEducationScreen({ leadId, onIrAProgreso }: LeadEducationScreenProps): ReactElement {
  const { data, isLoading, isError, errorMessage, refetch } = useEducationJourney(leadId);
  const { registrar, isPending } = useProgressEvent(leadId);
  const { etapaAbierta, pasoInicial, abrir, cerrar } = useLessonReader(data?.contenidos ?? []);

  const [etapaSeleccionada, setEtapaSeleccionada] = useState<EtapaId | undefined>(undefined);
  const [badgeParaCelebrar, setBadgeParaCelebrar] = useState<BadgeType | null>(null);
  const badgesVistos = useRef<Set<string>>(new Set());
  const primeraCargaHecha = useRef(false);

  const journey = data?.journey;
  const lead = data?.lead;

  useEffect(() => {
    if (journey === undefined) return;

    for (const badge of journey.badges) {
      if (badge.desbloqueadoEn === null) continue;
      if (badgesVistos.current.has(badge.id)) continue;

      badgesVistos.current.add(badge.id);
      if (primeraCargaHecha.current) setBadgeParaCelebrar(badge);
    }

    primeraCargaHecha.current = true;
  }, [journey]);

  if (isLoading) {
    return (
      <main className="mx-auto flex min-w-0 max-w-[1280px] flex-col gap-6 p-4 sm:p-6 lg:p-8">
        <Skeleton variant="text" lines={2} className="max-w-sm self-end" />
        <Skeleton variant="block" className="h-24" />
        <Skeleton variant="block" className="h-64" />
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

  const etapaEfectiva = etapaSeleccionada ?? primeraEtapaIncompleta(journey);
  const contenidosDeLaEtapa = (data?.contenidos ?? []).filter(
    (contenido) => contenido.etapa === etapaEfectiva,
  );
  const metasDeLaEtapa = journey.metas.filter((meta) => meta.etapa === etapaEfectiva);
  const metasAccionablesDeLaEtapa = metasDeLaEtapa.filter((meta) => meta.tipo !== 'educacion');
  const siguienteMeta = metasDeLaEtapa.find((meta) => !meta.completada);
  const contenidoDestacado =
    contenidosDeLaEtapa.find((c) => c.titulo.toLowerCase().includes('crédito')) ??
    contenidosDeLaEtapa[0];
  const resumen = resumenCamino(journey);
  const copyEtapaEfectiva = etapaEfectiva !== undefined ? ETAPA_COPY[etapaEfectiva] : undefined;

  const metaEducativaAbierta =
    etapaAbierta !== undefined
      ? journey.metas.find((meta) => meta.etapa === etapaAbierta && meta.tipo === 'educacion')
      : undefined;
  const etapaCopyAbierta: EtapaCopy =
    etapaAbierta !== undefined ? ETAPA_COPY[etapaAbierta] : ETAPA_COPY.descubrir;
  const contenidosDeLaEtapaAbierta = (data?.contenidos ?? []).filter(
    (contenido) => contenido.etapa === etapaAbierta,
  );

  function continuarMeta(meta: Meta): void {
    if (meta.tipo === 'ahorro') {
      document
        .getElementById(`meta-${meta.id}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    if (etapaEfectiva !== undefined) {
      abrir(etapaEfectiva, contenidoDestacado?.id);
    }
  }

  return (
    <Stagger
      as="main"
      className="mx-auto flex min-w-0 max-w-[1280px] flex-col gap-8 p-4 pb-16 sm:p-6 lg:p-8 xl:px-10"
    >
      <Reveal>
        <TopStats puntosTotales={journey.puntosTotales} etiqueta={etiquetaLead(lead)} />
      </Reveal>

      {journey.reclasificadoAViable && (
        <Reveal>
          <Alert tone="success" title="¡Ya estás listo para el siguiente paso!">
            Completaste lo esencial de tu camino. Muy pronto un asesor te va a contactar.
          </Alert>
        </Reveal>
      )}

      <Reveal>
        <header className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 max-w-xl">
            <h1 className="font-display text-3xl font-bold tracking-tight text-text sm:text-4xl">
              Camino a Mi Hogar
            </h1>
            <p className="mt-2 text-base text-text-muted sm:text-lg">
              Aprende, supera tus dudas y prepárate para comprar la vivienda que sueñas.
            </p>
          </div>
          <JourneyHeader progreso={journey.progreso} />
        </header>
      </Reveal>

      <Reveal>
        <section aria-label="Tu recorrido">
          <CaminoAMiHogar
            etapas={journey.etapas ?? []}
            metas={journey.metas}
            etapaSeleccionada={etapaEfectiva}
            onSeleccionarEtapa={(etapaId) => {
              setEtapaSeleccionada(etapaId as EtapaId);
            }}
          />
        </section>
      </Reveal>

      <Reveal>
        <Card className="shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm font-bold text-text">Resumen de tu camino</p>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
              <ResumenChip
                label="Etapas completadas"
                valor={`${String(resumen.etapasCompletadas)} / ${String(resumen.etapasTotales)}`}
              />
              <ResumenChip label="Etapa en progreso" valor={String(resumen.etapasEnProgreso)} />
              <ResumenChip label="Etapas pendientes" valor={String(resumen.etapasPendientes)} />
            </div>
            {onIrAProgreso !== undefined && (
              <Button variant="ghost" onClick={onIrAProgreso}>
                Ver mi progreso detallado
                <ArrowRight aria-hidden="true" className="ml-1 inline size-4" />
              </Button>
            )}
          </div>
        </Card>
      </Reveal>

      <Reveal className="grid min-w-0 gap-4 lg:grid-cols-3">
        {siguienteMeta !== undefined ? (
          <NextLessonCard
            meta={siguienteMeta}
            contenido={contenidoDestacado}
            ctaLabel="Continuar"
            isPending={isPending}
            onContinuar={() => {
              continuarMeta(siguienteMeta);
            }}
          />
        ) : (
          <Alert tone="success" title="¡Completaste esta etapa!" className="lg:col-span-1">
            Elegí otra etapa en tu recorrido para seguir avanzando.
          </Alert>
        )}

        <NivelCard progreso={journey.progreso} badges={journey.badges} />
        <FaqWidget contenidos={data?.contenidos ?? []} />
      </Reveal>

      <Reveal className="grid gap-6 border-t border-border pt-6">
        <PlanSfvCard plan={journey.plan} />

        <section aria-labelledby="pasos-titulo" className="grid gap-4">
          <h2 id="pasos-titulo" className="text-sm font-semibold text-text-muted">
            Pasos de esta etapa
          </h2>

          {metasAccionablesDeLaEtapa.length > 0 && (
            <div className="grid min-w-0 gap-4 sm:grid-cols-2">
              {metasAccionablesDeLaEtapa.map((meta) => (
                <MetaCard
                  key={meta.id}
                  meta={meta}
                  isPending={isPending}
                  onRegistrarAhorro={(valor) => {
                    registrar({ metaId: meta.id, tipo: 'ahorro_registrado', valor });
                  }}
                  onCompletar={() => {
                    registrar({ metaId: meta.id, tipo: eventoCompletarPara(meta), valor: 1 });
                  }}
                />
              ))}
            </div>
          )}

          {copyEtapaEfectiva !== undefined && contenidosDeLaEtapa.length > 0 && (
            <EtapaCurriculo
              etapaCopy={copyEtapaEfectiva}
              contenidos={contenidosDeLaEtapa}
              metaEducativa={metasDeLaEtapa.find((meta) => meta.tipo === 'educacion')}
              onAbrirLector={(contenidoId) => {
                if (etapaEfectiva !== undefined) abrir(etapaEfectiva, contenidoId);
              }}
            />
          )}
        </section>
      </Reveal>

      <BadgeUnlockModal
        badge={badgeParaCelebrar}
        onClose={() => {
          setBadgeParaCelebrar(null);
        }}
      />

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

function ResumenChip({ label, valor }: { label: string; valor: string }): ReactElement {
  return (
    <span className="flex items-baseline gap-1.5">
      <span className="text-text-muted">{label}</span>
      <span className="font-bold tabular-nums text-text">{valor}</span>
    </span>
  );
}
