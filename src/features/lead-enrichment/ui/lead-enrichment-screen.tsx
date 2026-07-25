/**
 * Pantalla de F2.1: la baraja de proyectos afines al lead viable.
 * Es la unica superficie publica de la feature.
 *
 * ESCRITORIO PRIMERO. En un portatil hay tres columnas -- contexto, mazo y
 * detalle -- y el detalle esta SIEMPRE a la vista: en una pantalla grande, un
 * modal que tapa todo para leer un dato es un paso de mas. Debajo de `lg` se
 * colapsa a una columna y el detalle vuelve a ser una hoja.
 *
 * ESTADOS: carga, error, mazo y cierre, los cuatro cubiertos (regla 11).
 *
 * AUTOGESTIONADO: el titulo dice que hacer, los botones dicen que significan y
 * los atajos estan a la vista. Nadie deberia tener que explicar esta pantalla.
 */

import { AnimatePresence } from 'motion/react';
import { useCallback, useEffect, useState, type ReactElement } from 'react';
import type { ProjectMatchCard, SwipeAction } from '@contracts';
import { Alert, Button, ProgressBar, Skeleton } from '@shared/ui';
import { useProjectDeck } from '../model/use-project-deck';
import { EnrichmentSummaryView } from './enrichment-summary';
import { ProjectCard } from './project-card';
import { ProjectDetailModal, ProjectDetailPanel } from './project-detail';
import { SwipeControls } from './swipe-controls';

/** Cuantas tarjetas se dibujan apiladas. Mas de 3 no se ven y solo cuestan. */
const VISIBLES = 3;

export interface LeadEnrichmentScreenProps {
  leadId: string;
}

export function LeadEnrichmentScreen({ leadId }: LeadEnrichmentScreenProps): ReactElement {
  const mazo = useProjectDeck(leadId);
  const [detalleMovil, setDetalleMovil] = useState<ProjectMatchCard | null>(null);

  const { decidir, terminado } = mazo;
  const modalAbierto = detalleMovil !== null;

  // Atajos de teclado. Se apagan con la hoja abierta para no decidir por
  // debajo de un modal que tiene el foco atrapado.
  const alPresionar = useCallback(
    (evento: KeyboardEvent) => {
      if (modalAbierto || terminado) return;

      const acciones: Record<string, SwipeAction> = {
        ArrowLeft: 'pass',
        ArrowRight: 'like',
        ArrowUp: 'favorito',
      };
      const accion = acciones[evento.key];
      if (accion === undefined) return;

      evento.preventDefault();
      decidir(accion);
    },
    [decidir, modalAbierto, terminado],
  );

  useEffect(() => {
    window.addEventListener('keydown', alPresionar);
    return () => {
      window.removeEventListener('keydown', alPresionar);
    };
  }, [alPresionar]);

  if (mazo.cargando) {
    return (
      <Marco>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,400px)_1fr]">
          <div className="flex flex-col gap-4">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="aspect-[3/4] w-full rounded-card" />
          </div>
          <div className="hidden flex-col gap-3 lg:flex">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      </Marco>
    );
  }

  if (mazo.error !== null) {
    return (
      <Marco>
        <div className="max-w-xl">
          <Alert tone="danger" title="No pudimos cargar los proyectos">
            {mazo.error.message}
          </Alert>
        </div>
      </Marco>
    );
  }

  if (mazo.resumen !== undefined) {
    return (
      <Marco>
        <EnrichmentSummaryView resumen={mazo.resumen} />
      </Marco>
    );
  }

  const tarjetas = mazo.deck?.tarjetas ?? [];
  const enPantalla = tarjetas.slice(mazo.indice, mazo.indice + VISIBLES);
  const activa = enPantalla.at(0) ?? null;

  return (
    <Marco>
      <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,400px)_1fr]">
        {/* --- Columna del mazo --- */}
        <div className="flex flex-col gap-5">
          <header className="flex flex-col gap-3">
            <h2 className="text-2xl">Estos proyectos van contigo</h2>
            <p className="text-sm text-text-muted">
              Deslizalos, usa los botones o las flechas del teclado. Cada decision afina lo
              que el asesor va a saber de ti.
            </p>
            <ProgressBar
              value={mazo.avance * 100}
              label={`${String(mazo.indice)} de ${String(tarjetas.length)} revisados`}
            />
          </header>

          <div className="relative aspect-[3/4] w-full">
            <AnimatePresence initial={false}>
              {enPantalla.map((tarjeta, posicion) => (
                <ProjectCard
                  key={tarjeta.ficha.proyectoId}
                  tarjeta={tarjeta}
                  profundidad={posicion}
                  activa={posicion === 0}
                  onDecidir={mazo.decidir}
                />
              ))}
            </AnimatePresence>

            {terminado && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-card border border-dashed border-border-strong p-8 text-center">
                <p className="text-xl">Ya viste todos los proyectos</p>
                <p className="text-sm text-text-muted">
                  Guardamos lo que elegiste. Cierra para que un asesor lo reciba.
                </p>
                <Button onClick={mazo.cerrar} loading={mazo.cerrando} size="lg">
                  Ver mi resumen
                </Button>
              </div>
            )}
          </div>

          {!terminado && (
            <>
              <SwipeControls onDecidir={mazo.decidir} />

              <div className="flex items-center justify-between gap-3 text-xs text-text-muted">
                <span className="tabular-nums">{mazo.restantes} por revisar</span>

                <div className="flex items-center gap-4">
                  {/* Este boton vive FUERA de la tarjeta: dentro, el `drag` de
                      Motion se come el click y parece roto. Solo hace falta
                      debajo de `lg`; arriba el detalle ya esta en pantalla. */}
                  {activa !== null && (
                    <button
                      type="button"
                      onClick={() => {
                        setDetalleMovil(activa);
                        mazo.notificarDetalle(true);
                      }}
                      className="focus-ring rounded-field px-1 underline decoration-dotted underline-offset-4 lg:hidden"
                    >
                      Ver detalle
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={mazo.cerrar}
                    className="focus-ring rounded-field px-1 underline decoration-dotted underline-offset-4"
                  >
                    Terminar aqui
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* --- Columna del detalle: fija en escritorio --- */}
        {activa !== null && (
          <div className="hidden lg:block">
            <ProjectDetailPanel tarjeta={activa} />
          </div>
        )}
      </div>

      <ProjectDetailModal
        tarjeta={detalleMovil}
        open={modalAbierto}
        onClose={() => {
          setDetalleMovil(null);
          mazo.notificarDetalle(false);
        }}
      />
    </Marco>
  );
}

/** Ancho y respiracion comunes a todos los estados de la pantalla. */
function Marco({ children }: { children: ReactElement | ReactElement[] }): ReactElement {
  return (
    <main className="mx-auto w-full max-w-[1400px] px-5 py-8 lg:px-10 lg:py-12">{children}</main>
  );
}
