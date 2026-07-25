/**
 * La tarjeta del mazo. Capa: ui.
 *
 * Solo la de arriba es arrastrable; las de atras se dibujan escaladas y
 * quietas para dar profundidad sin costar rendimiento.
 *
 * NADA INTERACTIVO VIVE AQUI DENTRO. Motion captura el puntero mientras hay
 * `drag` activo, asi que un boton dentro de la superficie arrastrable no
 * dispara su `click` en un navegador real -- se ve como si el boton estuviera
 * roto. Todo control (decidir, ver el detalle) vive FUERA de la tarjeta.
 *
 * ACCESIBILIDAD: el gesto nunca es la unica via. Los botones de la barra y los
 * atajos de teclado hacen lo mismo, y con `prefers-reduced-motion` el arrastre
 * se apaga entero.
 */

import { motion, useMotionValue, useReducedMotion, useTransform } from 'motion/react';
import type { PanInfo } from 'motion/react';
import type { ReactElement } from 'react';
import type { ProjectMatchCard, SwipeAction } from '@contracts';
import { leerAfinidad } from '@shared/lib/afinidad';
import { cn } from '@shared/lib/cn';
import { formatCOPCompact } from '@shared/lib/format-money';

/** Cuantas tarjetas se apilan. Debe coincidir con `VISIBLES` de la pantalla. */
const PROFUNDIDAD_MAXIMA = 3;

/** Distancia en px a partir de la cual soltar cuenta como decision. */
const UMBRAL_ARRASTRE = 110;
/** Velocidad que dispara la decision aunque no se llegue al umbral. */
const UMBRAL_VELOCIDAD = 550;

export interface ProjectCardProps {
  tarjeta: ProjectMatchCard;
  /** Posicion en el mazo: 0 es la de arriba. */
  profundidad: number;
  /** Solo la tarjeta de arriba responde al arrastre. */
  activa: boolean;
  onDecidir: (accion: SwipeAction) => void;
}

export function ProjectCard({
  tarjeta,
  profundidad,
  activa,
  onDecidir,
}: ProjectCardProps): ReactElement {
  const reducirMovimiento = useReducedMotion() ?? false;
  const x = useMotionValue(0);

  // La rotacion sigue al dedo: es lo que hace que el gesto se sienta fisico.
  const rotate = useTransform(x, [-260, 0, 260], [-11, 0, 11]);
  const opacidadLike = useTransform(x, [40, 150], [0, 1]);
  const opacidadPass = useTransform(x, [-150, -40], [1, 0]);

  const { ficha, match } = tarjeta;
  const afinidad = leerAfinidad(match);
  // En varios proyectos el sector ES la ciudad (Tocancipa, Girardot): repetirlo
  // da "TOCANCIPA · TOCANCIPA", que se lee como un bug de datos.
  const ubicacion =
    ficha.ubicacion.toLowerCase() === ficha.ciudad.toLowerCase()
      ? ficha.ciudad
      : `${ficha.ubicacion} · ${ficha.ciudad}`;
  const precio =
    ficha.precio.hasta === null
      ? `desde ${formatCOPCompact(ficha.precio.desde)}`
      : `${formatCOPCompact(ficha.precio.desde)} – ${formatCOPCompact(ficha.precio.hasta)}`;

  function alSoltar(_evento: unknown, info: PanInfo): void {
    const decide =
      Math.abs(info.offset.x) > UMBRAL_ARRASTRE ||
      Math.abs(info.velocity.x) > UMBRAL_VELOCIDAD;
    if (!decide) return;
    onDecidir(info.offset.x > 0 ? 'like' : 'pass');
  }

  return (
    <motion.article
      className={cn(
        'absolute inset-0 overflow-hidden rounded-card border border-border bg-surface shadow-card',
        activa ? 'cursor-grab active:cursor-grabbing' : 'pointer-events-none',
      )}
      style={{
        x: activa ? x : 0,
        rotate: activa ? rotate : 0,
        // SIN ESTO EL MAZO SE PINTA AL REVES: las tarjetas se montan en orden
        // de profundidad, y como hermanas absolutas la ULTIMA del DOM queda
        // arriba. O sea, la mas profunda tapaba a la activa: se veia un
        // proyecto y el panel de detalle mostraba otro.
        zIndex: PROFUNDIDAD_MAXIMA - profundidad,
      }}
      animate={{
        scale: 1 - profundidad * 0.035,
        y: profundidad * 12,
        opacity: profundidad > 2 ? 0 : 1,
      }}
      transition={{ type: 'spring', stiffness: 320, damping: 32 }}
      drag={activa && !reducirMovimiento ? 'x' : false}
      dragElastic={0.55}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={alSoltar}
      exit={{ x: x.get() > 0 ? 520 : -520, opacity: 0, transition: { duration: 0.24 } }}
      aria-hidden={!activa}
    >
      {/* --- Render del proyecto, extraido de su propio brochure --- */}
      <div className="relative h-[62%] w-full overflow-hidden bg-surface-3">
        <img
          src={ficha.imagen}
          alt={`Render del proyecto ${ficha.nombre}`}
          className="size-full object-cover"
          draggable={false}
          loading={profundidad === 0 ? 'eager' : 'lazy'}
        />

        {/* Afinidad: bloque plano amarillo, como los del sistema. Es el numero
            que ordena el mazo, asi que no se esconde -- pero tampoco viaja solo:
            si se calculo con datos incompletos lo dice ahi mismo, porque un
            porcentaje sin contexto se lee como una medicion cerrada. */}
        <div
          className="absolute top-0 right-0 flex flex-col items-end bg-brand-500 px-3 py-2 text-[#0d0d0d]"
          title={afinidad.explicacion}
        >
          <span className="flex items-baseline gap-0.5">
            <span className="text-xl leading-none font-bold tabular-nums">
              {afinidad.porcentaje}
            </span>
            <span className="text-xs font-bold">%</span>
          </span>
          {afinidad.rotulo !== null && (
            <span className="label-mono text-[10px] leading-tight">{afinidad.rotulo}</span>
          )}
        </div>

        {/* La advertencia de presupuesto va PEGADA al porcentaje, no en el
            detalle: el usuario decide con el pulgar sobre esta pantalla, y un
            proyecto que no le alcanza puede puntuar alto igual. */}
        {afinidad.advertenciaCapacidad !== null && (
          <span className="label-mono absolute right-0 bottom-0 left-0 bg-[#0d0d0d]/85 px-3 py-1.5 text-center text-[11px] text-white">
            {afinidad.advertenciaCapacidad}
          </span>
        )}

        {/* Una sola etiqueta: VIS es la unica que cambia la conversacion
            (define el tope de precio y el acceso al subsidio). El resto vive
            en el detalle, donde hay espacio para leerlo. */}
        {ficha.esVIS && (
          <span className="label-mono absolute top-0 left-0 bg-[#0d0d0d] px-3 py-2 text-white">
            VIS
          </span>
        )}

        {/* --- Sellos del gesto --- */}
        <motion.span
          style={{ opacity: opacidadLike }}
          className="label-mono pointer-events-none absolute top-1/2 left-6 -rotate-12 border-4 border-success bg-white/90 px-3 py-1 text-xl text-success"
          aria-hidden="true"
        >
          Me sirve
        </motion.span>
        <motion.span
          style={{ opacity: opacidadPass }}
          className="label-mono pointer-events-none absolute top-1/2 right-6 rotate-12 border-4 border-danger bg-white/90 px-3 py-1 text-xl text-danger"
          aria-hidden="true"
        >
          Paso
        </motion.span>
      </div>

      {/* --- Datos duros. Sin degradados encima de la foto: el texto vive en
          su propio bloque blanco y se lee siempre igual. --- */}
      <div className="flex h-[38%] flex-col justify-between gap-2 p-5">
        <div>
          <p className="label-mono truncate text-accent">{ubicacion}</p>
          <h3 className="mt-1 truncate text-xl">{ficha.nombre}</h3>
        </div>

        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="truncate text-lg font-bold tabular-nums">{precio}</p>
            <p className="label-mono text-text-subtle">
              {ficha.precio.esEstimado ? 'estimado' : 'publicado'}
            </p>
          </div>
          <p className="shrink-0 text-right text-xs text-text-muted tabular-nums">
            {ficha.areaHasta === null
              ? `${String(ficha.areaDesde)} m²`
              : `${String(ficha.areaDesde)}–${String(ficha.areaHasta)} m²`}
            <br />
            {ficha.habitacionesDesde === ficha.habitacionesHasta
              ? `${String(ficha.habitacionesDesde)} hab`
              : `${String(ficha.habitacionesDesde)}–${String(ficha.habitacionesHasta)} hab`}
          </p>
        </div>
      </div>
    </motion.article>
  );
}
