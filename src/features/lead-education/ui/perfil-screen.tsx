/**
 * Pantalla "Mi perfil" (capa ui, F2.2).
 *
 * Solo muestra datos del snapshot F1 + journey. Sin persona ficticia, sin
 * email/teléfono inventados, sin botones de edición que no persisten.
 */

import { ChevronRight, Heart, Home, Mail, MapPin, Phone, Trophy, User, Users, Wallet } from 'lucide-react';
import type { ReactElement } from 'react';
import { Button, Card, EmptyState, ProgressBar, Skeleton } from '@shared/ui';
import { useEducationJourney } from '../model/use-education-journey';
import { etiquetaLead, perfilDesdeLead } from '../model/perfil-desde-lead';
import { conocimientoPorArea, resumenAprendizaje } from '../model/progreso-stats';
import { iconoDeBadge } from '../model/badge-icons';
import { Reveal, Stagger } from './motion-reveal';
import { TopStats } from './top-stats';

export interface PerfilScreenProps {
  leadId: string;
  onVerCamino?: () => void;
  onVerLogros?: () => void;
  onLogout: () => void;
}

type Nivel = 'Principiante' | 'Intermedio' | 'Avanzado';

function nivelDe(progreso: number): Nivel {
  if (progreso >= 0.66) return 'Avanzado';
  if (progreso >= 0.33) return 'Intermedio';
  return 'Principiante';
}

const MAX_LOGROS_RECIENTES = 4;

export function PerfilScreen({
  leadId,
  onVerCamino,
  onVerLogros,
  onLogout,
}: PerfilScreenProps): ReactElement {
  const { data, isLoading, isError, errorMessage, refetch } = useEducationJourney(leadId);
  const journey = data?.journey;
  const lead = data?.lead;

  if (isLoading) {
    return (
      <main className="mx-auto flex max-w-[1280px] flex-col gap-6 p-4 pb-16 sm:p-6 lg:p-8 xl:px-10">
        <Skeleton variant="text" lines={2} className="max-w-sm" />
        <Skeleton variant="block" className="h-40" />
        <Skeleton variant="block" className="h-64" />
      </main>
    );
  }

  if (isError || journey === undefined || lead === undefined) {
    return (
      <main className="mx-auto max-w-[1280px] p-4 sm:p-6 lg:p-8">
        <EmptyState
          title="No pudimos cargar tu perfil"
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

  const perfil = perfilDesdeLead(lead, journey);
  const resumen = resumenAprendizaje(journey);
  const areas = conocimientoPorArea(journey);
  const temasDominados = areas.filter((area) => area.nivel === 'Dominado').length;
  const temasPorAprender = areas.length - temasDominados;
  const nivel = nivelDe(journey.progreso);
  const logrosRecientes = journey.badges
    .filter((badge) => badge.desbloqueadoEn !== null)
    .sort((a, b) => (b.desbloqueadoEn ?? '').localeCompare(a.desbloqueadoEn ?? ''))
    .slice(0, MAX_LOGROS_RECIENTES);

  return (
    <Stagger
      as="main"
      className="mx-auto flex max-w-[1280px] flex-col gap-6 p-4 pb-16 sm:p-6 lg:p-8 xl:px-10"
    >
      <Reveal className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1
            id="perfil"
            className="flex items-center gap-2.5 font-display text-3xl font-bold tracking-tight text-text sm:text-4xl"
          >
            <User aria-hidden="true" className="size-8 text-accent-700" />
            Mi perfil
          </h1>
          <p className="mt-2 text-base text-text-muted">
            Lo que armamos con tu conversación inicial y tu camino.
          </p>
        </div>
        <TopStats
          puntosTotales={journey.puntosTotales}
          etiqueta={etiquetaLead(lead)}
          onLogout={onLogout}
        />
      </Reveal>

      <Reveal className="grid gap-4 lg:grid-cols-[1.15fr_1fr]">
        <Card className="shadow-card" padding="lg">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <span
              aria-hidden="true"
              className="mx-auto flex size-24 shrink-0 items-center justify-center rounded-full bg-accent-100 text-2xl font-bold text-accent-700 sm:mx-0"
            >
              {perfil.iniciales}
            </span>

            <div className="min-w-0 flex-1 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <h2 className="font-display text-2xl font-bold text-text">{perfil.titulo}</h2>
                <span className="rounded-pill bg-accent-50 px-2.5 py-0.5 text-xs font-bold text-accent-700">
                  Nivel {nivel}
                </span>
              </div>
              {perfil.email !== null && (
                <p className="mt-2 flex items-center justify-center gap-1.5 text-sm text-text-muted sm:justify-start">
                  <Mail aria-hidden="true" className="size-3.5" />
                  {perfil.email}
                </p>
              )}
              {perfil.telefonoEnmascarado !== null && (
                <p className="mt-1 flex items-center justify-center gap-1.5 text-sm text-text-muted sm:justify-start">
                  <Phone aria-hidden="true" className="size-3.5" />
                  {perfil.telefonoEnmascarado}
                </p>
              )}
              <p className="mt-2 text-sm text-text-muted">{perfil.afiliacion}</p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 border-t border-border pt-5 sm:grid-cols-4">
            <MetaDato
              icono={<User aria-hidden="true" className="size-4" />}
              label="Edad"
              valor={perfil.edad === null ? '—' : `${String(perfil.edad)} años`}
            />
            <MetaDato
              icono={<MapPin aria-hidden="true" className="size-4" />}
              label="Ciudad"
              valor={perfil.ciudad ?? '—'}
            />
            <MetaDato
              icono={<Wallet aria-hidden="true" className="size-4" />}
              label="Rango salarial"
              valor={perfil.rangoSalarial ?? '—'}
            />
            <MetaDato
              icono={<Heart aria-hidden="true" className="size-4" />}
              label="Estado civil"
              valor={perfil.estadoCivil ?? '—'}
            />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-2">
            <MetaDato
              icono={<Users aria-hidden="true" className="size-4" />}
              label="Personas a cargo"
              valor={perfil.personasACargo}
            />
            <MetaDato
              icono={<Home aria-hidden="true" className="size-4" />}
              label="Hogar"
              valor={perfil.segmentoFamiliar ?? '—'}
            />
          </div>
        </Card>

        <Card className="flex flex-col shadow-card" padding="lg">
          <p className="mb-4 text-sm font-semibold text-text">Resumen de aprendizaje</p>
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <ProgresoCircular value={journey.progreso} />
            <ul className="flex flex-1 flex-col gap-2.5 text-sm">
              <ResumenLinea
                label="Lecciones completadas"
                valor={`${String(resumen.leccionesCompletadas)}/${String(resumen.leccionesTotales)}`}
              />
              <ResumenLinea
                label="Evaluaciones aprobadas"
                valor={`${String(resumen.evaluacionesAprobadas)}/${String(resumen.evaluacionesTotales)}`}
              />
              <ResumenLinea label="Temas dominados" valor={String(temasDominados)} />
              <ResumenLinea label="Temas por aprender" valor={String(temasPorAprender)} />
            </ul>
          </div>
          <Button
            variant="primary"
            className="mt-auto w-full"
            iconLeft={<Trophy aria-hidden="true" className="size-4" />}
            onClick={onVerCamino}
          >
            Ver mi camino
          </Button>
        </Card>
      </Reveal>

      <Reveal className="grid gap-4 lg:grid-cols-2">
        <Card className="shadow-card">
          <p className="mb-3 flex items-center gap-2 text-sm font-bold text-text">
            <Home aria-hidden="true" className="size-4 text-accent-700" />
            Tu caso (desde el chatbot)
          </p>
          <ul className="divide-y divide-border">
            {perfil.informacion.map((campo) => (
              <li key={campo.label} className="flex items-center justify-between gap-3 py-3">
                <span className="text-sm text-text-muted">{campo.label}</span>
                <span className="text-right text-sm font-semibold text-text">{campo.valor}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="shadow-card">
          <p className="mb-3 text-sm font-bold text-text">Avance por tema</p>
          {perfil.intereses.length > 0 ? (
            <ul className="flex flex-col gap-4">
              {perfil.intereses.map((interes) => (
                <li key={interes.tema}>
                  <div className="mb-1.5 flex items-baseline justify-between gap-2">
                    <p className="text-sm font-semibold text-text">{interes.tema}</p>
                    <span className="text-[0.6875rem] font-medium text-text-subtle">{interes.nivel}</span>
                  </div>
                  <ProgressBar
                    value={interes.progreso}
                    max={1}
                    tone={interes.progreso >= 0.7 ? 'accent' : 'brand'}
                    size="sm"
                    ariaLabel={`Avance en ${interes.tema}`}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-text-muted">Todavía no hay temas en tu camino.</p>
          )}
        </Card>
      </Reveal>

      <Reveal>
        <Card className="shadow-card">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-bold text-text">Mis logros recientes</p>
            <button
              type="button"
              onClick={onVerLogros}
              className="focus-ring inline-flex items-center gap-1 text-sm font-semibold text-accent-700 hover:underline"
            >
              Ver todos mis logros
              <ChevronRight aria-hidden="true" className="size-4" />
            </button>
          </div>
          {logrosRecientes.length > 0 ? (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {logrosRecientes.map((badge) => {
                const Icono = iconoDeBadge(badge.icono);
                return (
                  <li key={badge.id} className="flex items-center gap-3">
                    <span
                      aria-hidden="true"
                      className="flex size-12 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-800"
                    >
                      <Icono className="size-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-text">{badge.nombre}</p>
                      <p className="truncate text-xs text-text-muted">{badge.descripcion}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-sm text-text-muted">
              Todavía no desbloqueaste logros. ¡Seguí avanzando en tu camino!
            </p>
          )}
        </Card>
      </Reveal>
    </Stagger>
  );
}

function MetaDato({
  icono,
  label,
  valor,
}: {
  icono: ReactElement;
  label: string;
  valor: string;
}): ReactElement {
  return (
    <div className="text-center sm:text-left">
      <span className="mb-1 inline-flex text-text-subtle">{icono}</span>
      <p className="text-[0.6875rem] text-text-subtle">{label}</p>
      <p className="text-sm font-semibold text-text">{valor}</p>
    </div>
  );
}

function ResumenLinea({ label, valor }: { label: string; valor: string }): ReactElement {
  return (
    <li className="flex items-center justify-between gap-3">
      <span className="text-text-muted">{label}</span>
      <span className="font-semibold tabular-nums text-text">{valor}</span>
    </li>
  );
}

function ProgresoCircular({ value }: { value: number }): ReactElement {
  const pct = Math.round(Math.min(Math.max(value, 0), 1) * 100);
  const radio = 42;
  const circunferencia = 2 * Math.PI * radio;
  const offset = circunferencia * (1 - pct / 100);

  return (
    <div className="relative mx-auto size-28 shrink-0 sm:mx-0">
      <svg viewBox="0 0 100 100" className="size-full -rotate-90" aria-hidden="true">
        <circle cx="50" cy="50" r={radio} fill="none" className="stroke-surface-3" strokeWidth="10" />
        <circle
          cx="50"
          cy="50"
          r={radio}
          fill="none"
          className="stroke-brand"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={String(circunferencia)}
          strokeDashoffset={String(offset)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="font-display text-xl font-bold text-accent-700">{pct}%</span>
        <span className="text-[0.625rem] leading-tight text-text-subtle">
          Progreso
          <br />
          general
        </span>
      </div>
      <span className="sr-only">{pct}% de progreso general</span>
    </div>
  );
}
