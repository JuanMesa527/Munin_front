/**
 * "Camino a Mi Hogar": recorrido visual de las 5 etapas (capa ui, F2.2).
 *
 * Diseño minimalista y consistente: iconos Lucide en círculos de color de
 * estado (amarillo=completa, azul=activa, gris=bloqueada) — el mismo
 * lenguaje visual que el resto del design system. Sin emoji, sin imágenes
 * sueltas: la consistencia importa más que la decoración.
 */

import { Check, Footprints, Home, Lock } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import type { ReactElement } from 'react';
import type { EtapaCamino, EtapaId, Meta } from '@contracts';
import { Card } from '@shared/ui';
import { cn } from '@shared/lib/cn';
import { ETAPA_COPY, type EtapaCopy } from '../model/etapa-copy';

export interface CaminoAMiHogarProps {
  etapas: readonly EtapaCamino[];
  metas: readonly Meta[];
  etapaSeleccionada?: string | undefined;
  onSeleccionarEtapa?: (etapaId: string) => void;
}

type EstadoEtapa = 'completa' | 'activa' | 'bloqueada';

interface EtapaConEstado {
  etapa: EtapaCamino;
  estado: EstadoEtapa;
  completadas: number;
  total: number;
}

function metasDe(etapaId: string, metas: readonly Meta[]): Meta[] {
  return metas.filter((meta) => meta.etapa === etapaId);
}

function calcularEstados(
  etapas: readonly EtapaCamino[],
  metas: readonly Meta[],
): EtapaConEstado[] {
  const ordenadas = [...etapas].sort((a, b) => a.orden - b.orden);
  const completitud = ordenadas.map((etapa) => {
    const propias = metasDe(etapa.id, metas);
    return propias.length > 0 && propias.every((meta) => meta.completada);
  });
  const indiceActiva = completitud.findIndex((completa) => !completa);

  return ordenadas.map((etapa, indice) => {
    const propias = metasDe(etapa.id, metas);
    const estado: EstadoEtapa =
      completitud[indice] === true
        ? 'completa'
        : indice === (indiceActiva === -1 ? ordenadas.length : indiceActiva)
          ? 'activa'
          : 'bloqueada';
    return {
      etapa,
      estado,
      completadas: propias.filter((meta) => meta.completada).length,
      total: Math.max(propias.length, 1),
    };
  });
}

function copyDe(etapaId: EtapaId): EtapaCopy {
  return ETAPA_COPY[etapaId];
}

export function CaminoAMiHogar({
  etapas,
  metas,
  etapaSeleccionada,
  onSeleccionarEtapa,
}: CaminoAMiHogarProps): ReactElement {
  const conEstado = calcularEstados(etapas, metas);

  return (
    <nav id="camino-titulo" aria-label="Camino a Mi Hogar">
      <CaminoHorizontal
        conEstado={conEstado}
        etapaSeleccionada={etapaSeleccionada}
        onSeleccionarEtapa={onSeleccionarEtapa}
      />
      <CaminoVertical
        conEstado={conEstado}
        etapaSeleccionada={etapaSeleccionada}
        onSeleccionarEtapa={onSeleccionarEtapa}
      />
    </nav>
  );
}

interface CaminoVariantProps {
  conEstado: readonly EtapaConEstado[];
  etapaSeleccionada: string | undefined;
  onSeleccionarEtapa: ((etapaId: string) => void) | undefined;
}

/** Layout flex: onda SVG de fondo + nodos alternando arriba/abajo. */
function CaminoHorizontal({
  conEstado,
  etapaSeleccionada,
  onSeleccionarEtapa,
}: CaminoVariantProps): ReactElement {
  const reducirMovimiento = useReducedMotion() ?? false;
  const total = conEstado.length;

  return (
    <div className="relative mb-4 hidden overflow-visible sm:block">
      <div className="relative flex items-center gap-2 px-1 pt-6 pb-4">
        <div className="z-10 flex w-16 shrink-0 flex-col items-center lg:w-20">
          <PersonajeCaminante />
        </div>

        <div className="relative min-w-0 flex-1">
          {/* Camino ondulado de fondo */}
          <svg
            viewBox="0 0 1000 120"
            preserveAspectRatio="none"
            className="pointer-events-none absolute inset-x-0 top-1/2 h-28 w-full -translate-y-1/2"
            aria-hidden="true"
          >
            <path
              d="M 20 90 C 120 90, 140 30, 240 30 S 360 90, 460 90 S 580 30, 680 30 S 800 90, 980 90"
              fill="none"
              strokeWidth="10"
              strokeLinecap="round"
              className="stroke-brand"
            />
          </svg>

          <ol className="relative z-10 flex items-stretch justify-between gap-1">
            {conEstado.map((item, indice) => {
              const seleccionada = etapaSeleccionada === item.etapa.id;
              // Alterna: 0 abajo, 1 arriba, 2 abajo...
              const arriba = indice % 2 === 1;

              return (
                <motion.li
                  key={item.etapa.id}
                  className={cn(
                    'flex flex-1 justify-center',
                    arriba ? 'items-start pt-0' : 'items-end pb-0 pt-16',
                    arriba && 'pb-16',
                  )}
                  initial={reducirMovimiento ? false : { opacity: 0, y: arriba ? -8 : 8 }}
                  animate={reducirMovimiento ? false : { opacity: 1, y: 0 }}
                  transition={{ delay: indice * 0.05, duration: 0.28 }}
                >
                  <NodoEtapa
                    item={item}
                    seleccionada={seleccionada}
                    onClick={() => {
                      onSeleccionarEtapa?.(item.etapa.id);
                    }}
                    compacto={total > 4 && item.estado !== 'activa'}
                  />
                </motion.li>
              );
            })}
          </ol>
        </div>

        <div className="z-10 flex w-20 shrink-0 flex-col items-center gap-1 lg:w-24">
          <CasaDestino />
          <p className="text-center text-[0.6875rem] leading-tight font-semibold text-text">
            Tu hogar te espera
          </p>
        </div>
      </div>
    </div>
  );
}

function EstadoPill({ item }: { item: EtapaConEstado }): ReactElement {
  if (item.estado === 'completa') {
    return (
      <span className="inline-flex items-center gap-1 rounded-pill bg-success-soft px-2.5 py-1 text-[0.6875rem] font-bold text-success">
        <Check aria-hidden="true" className="size-3 stroke-[3]" />
        ¡Completado!
      </span>
    );
  }
  if (item.estado === 'activa') {
    return (
      <span className="inline-flex items-center rounded-pill bg-accent-700 px-3 py-1.5 text-[0.6875rem] font-bold text-white shadow-sm">
        En progreso
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-pill bg-ink/90 px-2.5 py-1 text-[0.6875rem] font-bold text-text-inverse">
      <Lock aria-hidden="true" className="size-3" />
      Bloqueado
    </span>
  );
}

/** Círculo de icono con el color de estado — mismo patrón que el resto del design system. */
function CirculoEtapa({ item, grande }: { item: EtapaConEstado; grande: boolean }): ReactElement {
  const { estado } = item;
  const Icono = copyDe(item.etapa.id).icono;
  const esActiva = estado === 'activa';

  return (
    <span
      aria-hidden="true"
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full border-[3px] border-surface shadow-card',
        grande ? 'size-14' : 'size-12',
        estado === 'completa' && 'bg-brand text-ink',
        esActiva && 'bg-accent-600 text-white ring-4 ring-accent-100',
        estado === 'bloqueada' && 'bg-surface-3 text-text-subtle',
      )}
    >
      {estado === 'completa' ? (
        <Check className={grande ? 'size-6' : 'size-5'} strokeWidth={3} />
      ) : estado === 'bloqueada' ? (
        <Lock className={grande ? 'size-5' : 'size-4'} />
      ) : (
        <Icono className={grande ? 'size-6' : 'size-5'} />
      )}
    </span>
  );
}

function NodoEtapa({
  item,
  seleccionada,
  onClick,
  compacto = false,
}: {
  item: EtapaConEstado;
  seleccionada: boolean;
  onClick: () => void;
  compacto?: boolean;
}): ReactElement {
  const { etapa, estado, completadas, total } = item;
  const esActiva = estado === 'activa';
  const copy = copyDe(etapa.id);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={esActiva ? 'step' : undefined}
      aria-pressed={seleccionada}
      aria-label={copy.titulo}
      className="focus-ring rounded-card"
    >
      {esActiva ? (
        <Card
          padding="sm"
          className={cn(
            'flex w-[11.5rem] flex-col items-center gap-2 text-center shadow-pop',
            seleccionada && 'ring-2 ring-accent-500',
          )}
        >
          <CirculoEtapa item={item} grande />
          <p className="text-[0.8125rem] leading-snug font-bold text-text">{copy.titulo}</p>
          <p className="text-[0.6875rem] leading-snug text-text-muted">{copy.descripcion}</p>
          <EstadoPill item={item} />
          <p className="text-[0.6875rem] font-medium text-text-subtle">
            {completadas} de {total} lecciones
          </p>
        </Card>
      ) : (
        <div
          className={cn(
            'flex flex-col items-center gap-1.5 rounded-card p-1',
            compacto ? 'w-[6.5rem]' : 'w-32',
            seleccionada && 'bg-accent-50',
          )}
        >
          <CirculoEtapa item={item} grande={false} />
          <p className="text-[0.6875rem] leading-tight font-semibold text-text">{copy.titulo}</p>
          <EstadoPill item={item} />
        </div>
      )}
    </button>
  );
}

function PersonajeCaminante(): ReactElement {
  return (
    <div
      aria-hidden="true"
      className="flex size-12 items-center justify-center rounded-full bg-brand-50 text-brand-800 shadow-card"
    >
      <Footprints className="size-6" />
    </div>
  );
}

function CasaDestino(): ReactElement {
  return (
    <div
      aria-hidden="true"
      className="flex size-14 items-center justify-center rounded-full bg-brand shadow-pop lg:size-16"
    >
      <Home className="size-7 text-ink lg:size-8" strokeWidth={2.25} />
    </div>
  );
}

function CaminoVertical({
  conEstado,
  etapaSeleccionada,
  onSeleccionarEtapa,
}: CaminoVariantProps): ReactElement {
  const reducirMovimiento = useReducedMotion() ?? false;

  return (
    <ol className="relative flex flex-col gap-1 sm:hidden">
      {conEstado.map((item, indice) => {
        const seleccionada = etapaSeleccionada === item.etapa.id;
        const esUltima = indice === conEstado.length - 1;
        const copy = copyDe(item.etapa.id);

        return (
          <motion.li
            key={item.etapa.id}
            className="relative flex gap-4 pb-5"
            initial={reducirMovimiento ? false : { opacity: 0, y: 8 }}
            animate={reducirMovimiento ? false : { opacity: 1, y: 0 }}
            transition={{ delay: indice * 0.05, duration: 0.25 }}
          >
            {!esUltima && (
              <span
                aria-hidden="true"
                className={cn(
                  'absolute top-12 left-6 h-[calc(100%-2.25rem)] w-1 rounded-pill',
                  item.estado === 'completa' || item.estado === 'activa' ? 'bg-brand' : 'bg-border',
                )}
              />
            )}

            <CirculoEtapa item={item} grande={false} />

            <button
              type="button"
              onClick={() => {
                onSeleccionarEtapa?.(item.etapa.id);
              }}
              aria-current={item.estado === 'activa' ? 'step' : undefined}
              aria-pressed={seleccionada}
              className={cn(
                'focus-ring flex-1 rounded-card border border-border bg-surface px-3 py-3 text-left shadow-card transition-colors',
                seleccionada && 'ring-2 ring-accent-500',
              )}
            >
              <p className="font-bold text-text">{copy.titulo}</p>
              {item.estado === 'activa' && (
                <p className="mt-1 text-xs text-text-muted">{copy.descripcion}</p>
              )}
              <div className="mt-2">
                <EstadoPill item={item} />
              </div>
              {item.estado === 'activa' && (
                <p className="mt-1.5 text-[0.6875rem] text-text-subtle">
                  {item.completadas} de {item.total} lecciones
                </p>
              )}
            </button>
          </motion.li>
        );
      })}
    </ol>
  );
}
