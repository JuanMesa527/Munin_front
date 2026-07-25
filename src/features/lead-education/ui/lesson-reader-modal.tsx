/**
 * Lector de lecciones paso a paso (capa ui, F2.2).
 *
 * Este es el arreglo del bug central de F2.2: antes, "Comenzar"/"Continuar"
 * disparaba `registrar(...)` de inmediato y el `cuerpo` de la lección (texto
 * curado a mano, con cifras del SFV) nunca se mostraba. Acá se muestra
 * completo, un paso a la vez, y la meta educativa recién se completa cuando
 * el usuario confirma el último paso.
 *
 * Construido sobre `Modal` (capa shared): no reimplementa foco/Escape/portal.
 * Animación: mismo patrón que `camino-a-mi-hogar.tsx`
 * (`motion/react` + `useReducedMotion`, 0.24-0.28s).
 */

import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useState, type ReactElement } from 'react';
import type { ContenidoEducativo, Meta, NurturePlan } from '@contracts';
import { Badge, Button, Modal } from '@shared/ui';
import { cn } from '@shared/lib/cn';
import type { EtapaCopy } from '../model/etapa-copy';
import { ETIQUETA_POR_TIPO, ICONO_POR_TIPO } from '../model/contenido-tipo';
import { LessonVideoPlayer } from './lesson-video-player';
import { TuCasoCallout } from './tu-caso-callout';

export interface LessonReaderModalProps {
  open: boolean;
  etapaCopy: EtapaCopy;
  contenidos: readonly ContenidoEducativo[];
  pasoInicial?: number;
  metaEducativa?: Meta | undefined;
  plan: NurturePlan;
  isPending: boolean;
  onClose: () => void;
  onCompletar: () => void;
}

export function LessonReaderModal({
  open,
  etapaCopy,
  contenidos,
  pasoInicial = 0,
  metaEducativa,
  plan,
  isPending,
  onClose,
  onCompletar,
}: LessonReaderModalProps): ReactElement | null {
  const [pasoActual, setPasoActual] = useState(pasoInicial);
  const [direccion, setDireccion] = useState<1 | -1>(1);
  const reducirMovimiento = useReducedMotion() ?? false;

  // El modal se queda montado entre aperturas (lo controla `open`, no un
  // render condicional del padre), así que cada transición cerrado->abierto
  // debe re-arrancar en `pasoInicial` — incluso si el número es el mismo que
  // la vez anterior (deep-link repetido a la misma lección).
  const [openPrevio, setOpenPrevio] = useState(open);
  if (open !== openPrevio) {
    setOpenPrevio(open);
    if (open) {
      setPasoActual(pasoInicial);
      setDireccion(1);
    }
  }

  if (!open || contenidos.length === 0) return null;

  const totalPasos = contenidos.length;
  const indiceSeguro = Math.min(Math.max(pasoActual, 0), totalPasos - 1);
  const contenido = contenidos[indiceSeguro];
  const esUltimoPaso = indiceSeguro === totalPasos - 1;
  const esPrimerPaso = indiceSeguro === 0;

  function irA(indice: number, nuevaDireccion: 1 | -1): void {
    setDireccion(nuevaDireccion);
    setPasoActual(indice);
  }

  function manejarPrimario(): void {
    if (!esUltimoPaso) {
      irA(indiceSeguro + 1, 1);
      return;
    }

    if (metaEducativa !== undefined && !metaEducativa.completada) {
      onCompletar();
    }
    onClose();
  }

  const Icono = etapaCopy.icono;
  const etiquetaPrimario = !esUltimoPaso
    ? 'Siguiente'
    : metaEducativa !== undefined && !metaEducativa.completada
      ? 'Marcar etapa como completada'
      : 'Cerrar';

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={etapaCopy.titulo}
      size="lg"
      footer={
        <>
          <Button
            variant="secondary"
            disabled={esPrimerPaso || isPending}
            onClick={() => {
              irA(indiceSeguro - 1, -1);
            }}
          >
            Anterior
          </Button>
          <Button variant="accent" disabled={isPending} loading={isPending} onClick={manejarPrimario}>
            {etiquetaPrimario}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-100 text-accent-700"
          >
            <Icono className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="font-bold text-text">{etapaCopy.titulo}</p>
            <p className="text-xs text-text-muted">
              Paso {indiceSeguro + 1} de {totalPasos}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5" role="presentation" aria-hidden="true">
          {contenidos.map((item, indice) => (
            <span
              key={item.id}
              className={cn(
                'h-1.5 flex-1 rounded-pill transition-colors',
                indice < indiceSeguro && 'bg-brand',
                indice === indiceSeguro && 'bg-accent-600 ring-2 ring-accent-200',
                indice > indiceSeguro && 'bg-surface-3',
              )}
            />
          ))}
        </div>

        <AnimatePresence mode="wait" initial={false}>
          {contenido !== undefined && (
            <motion.div
              key={contenido.id}
              initial={reducirMovimiento ? false : { opacity: 0, x: direccion * 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -direccion * 24 }}
              transition={{ duration: 0.24 }}
              className="flex flex-col gap-3"
            >
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-display text-lg font-bold text-text">{contenido.titulo}</h3>
                <Badge
                  tone="neutral"
                  size="sm"
                  icon={ICONO_POR_TIPO[contenido.tipoContenido]}
                >
                  {ETIQUETA_POR_TIPO[contenido.tipoContenido]}
                </Badge>
              </div>

              <p className="text-sm leading-relaxed whitespace-pre-line text-text">
                {contenido.cuerpo}
              </p>

              {contenido.videoId !== undefined && (
                <LessonVideoPlayer videoId={contenido.videoId} titulo={contenido.titulo} />
              )}

              <TuCasoCallout plan={plan} contenidoId={contenido.id} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Modal>
  );
}
