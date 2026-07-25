/**
 * FactorBars - la prueba visual del principio GLASS-BOX (capa shared).
 *
 * Regla 13 del equipo: si una clasificacion no se puede explicar, no se
 * muestra. Este componente es donde esa regla se vuelve pixeles: dibuja
 * `ScoreResult.factores` como un grafico divergente alrededor de un eje
 * central, con lo que SUMA a la derecha y lo que RESTA a la izquierda,
 * ordenado por impacto real y con el peso de cada factor a la vista.
 *
 * Aqui NO se calcula nada del score: el aporte con signo (`contribucion`) y el
 * `peso` los produce una funcion pura y determinista del backend, calibrada
 * contra los compradores reales. El LLM no participa en ningun momento.
 *
 * ACCESIBILIDAD: la informacion completa esta en TEXTO (nombre, valor, aporte,
 * peso). Las barras van `aria-hidden` porque son redundantes: quien usa lector
 * de pantalla recibe exactamente los mismos datos, no una version pobre.
 */

import { motion, useReducedMotion } from 'motion/react';
import type { Factor } from '@contracts';
import { useId, type ReactElement } from 'react';
import { cn } from '../lib/cn';

const formatoPeso = new Intl.NumberFormat('es-CO', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const formatoAporte = new Intl.NumberFormat('es-CO', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
  // El signo SIEMPRE visible: es la mitad del mensaje de esta vista.
  signDisplay: 'always',
});

/** Tupla explicita: Motion espera un bezier de 4 numeros, no un `number[]`. */
const EASE_SUAVE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export interface FactorBarsProps {
  /** `ScoreResult.factores`. No se muta: se ordena sobre una copia. */
  factores: readonly Factor[];
  /** Cuantos factores mostrar, ya ordenados por impacto. Por defecto, todos. */
  limite?: number | undefined;
  title?: string | undefined;
  /** `ScoreResult.weightsVersion`: hace auditable el score en el tiempo. */
  weightsVersion?: string | undefined;
  className?: string | undefined;
}

export function FactorBars({
  factores,
  limite,
  title = 'Por qué este puntaje',
  weightsVersion,
  className,
}: FactorBarsProps): ReactElement {
  const reducirMovimiento = useReducedMotion() ?? false;
  const idTitulo = useId();

  // Copia antes de ordenar: mutar props es un bug silencioso que aparece dos
  // pantallas despues.
  const ordenados = [...factores]
    .sort((a, b) => Math.abs(b.contribucion) - Math.abs(a.contribucion))
    .slice(0, limite ?? factores.length);

  // El aporte mas grande en valor absoluto define la escala de las dos mitades,
  // asi las barras son comparables entre si.
  const maxAbs = ordenados.reduce(
    (maximo, factor) => Math.max(maximo, Math.abs(factor.contribucion)),
    0,
  );

  if (ordenados.length === 0) {
    return (
      <p className={cn('text-sm text-text-muted', className)}>
        Todavía no hay factores para explicar este puntaje.
      </p>
    );
  }

  return (
    // La region se nombra con el propio titulo (no con un aria-label duplicado)
    // para que el lector de pantalla no lea el mismo texto dos veces.
    <section className={cn('flex flex-col gap-3', className)} aria-labelledby={idTitulo}>
      <header className="flex flex-wrap items-center justify-between gap-2">
        <h3 id={idTitulo} className="text-sm font-semibold text-text">
          {title}
        </h3>

        {/* Leyenda: el signo del aporte tambien esta en el texto de cada fila,
            el color nunca es el unico indicador (WCAG 1.4.1). */}
        <p className="flex items-center gap-3 text-xs text-text-muted">
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden="true" className="size-2 rounded-sm bg-success" />
            Suma
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden="true" className="size-2 rounded-sm bg-danger" />
            Resta
          </span>
        </p>
      </header>

      <ul className="flex flex-col gap-2.5">
        {ordenados.map((factor, indice) => {
          const suma = factor.contribucion >= 0;
          const anchoRelativo = maxAbs > 0 ? (Math.abs(factor.contribucion) / maxAbs) * 50 : 0;

          return (
            <li key={`${factor.nombre}-${String(indice)}`} className="flex flex-col gap-1">
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="min-w-0 truncate">
                  <span className="font-medium text-text">{factor.nombre}</span>
                  <span className="text-text-muted"> · {factor.valor}</span>
                </span>

                <span className="flex shrink-0 items-baseline gap-2">
                  <span className="font-mono text-[0.6875rem] text-text-subtle">
                    peso {formatoPeso.format(factor.peso)}
                  </span>
                  <span
                    className={cn(
                      'font-semibold tabular-nums',
                      suma ? 'text-success' : 'text-danger',
                    )}
                  >
                    {formatoAporte.format(factor.contribucion)}
                  </span>
                </span>
              </div>

              {/* Grafico divergente: el eje central es el cero. */}
              <div
                aria-hidden="true"
                className="relative h-2 overflow-hidden rounded-pill bg-surface-3"
              >
                <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-border-strong" />
                <motion.span
                  className={cn(
                    'absolute inset-y-0 block rounded-pill',
                    suma ? 'left-1/2 bg-success' : 'right-1/2 bg-danger',
                  )}
                  initial={{ width: '0%' }}
                  animate={{ width: `${String(anchoRelativo)}%` }}
                  transition={
                    reducirMovimiento
                      ? { duration: 0 }
                      : { duration: 0.5, delay: indice * 0.05, ease: EASE_SUAVE }
                  }
                />
              </div>
            </li>
          );
        })}
      </ul>

      {weightsVersion !== undefined && (
        <p className="text-[0.6875rem] text-text-subtle">
          Modelo de puntaje {weightsVersion} · calibrado con compradores reales, sin consultar
          centrales de riesgo.
        </p>
      )}
    </section>
  );
}
