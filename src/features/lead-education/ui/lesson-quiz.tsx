/**
 * Comprobación de comprensión de una lección (capa ui, F2.2).
 *
 * Preguntas de opción múltiple, una a la vez: al elegir una opción se muestra
 * de inmediato si es correcta y la explicación — es una comprobación chica,
 * no un motor de examen con puntaje ni reintentos.
 */

import { Check, X } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useState, type ReactElement } from 'react';
import type { PreguntaQuiz } from '@contracts';
import { Button, Card } from '@shared/ui';
import { cn } from '@shared/lib/cn';

export interface LessonQuizProps {
  preguntas: PreguntaQuiz[];
}

export function LessonQuiz({ preguntas }: LessonQuizProps): ReactElement | null {
  const [indice, setIndice] = useState(0);
  const [seleccion, setSeleccion] = useState<number | null>(null);
  const reducirMovimiento = useReducedMotion() ?? false;

  if (preguntas.length === 0) return null;

  const pregunta = preguntas[indice];
  if (pregunta === undefined) return null;

  const esCorrecta = seleccion === pregunta.respuestaCorrectaIndice;
  const esUltima = indice === preguntas.length - 1;

  function elegir(opcionIndice: number): void {
    if (seleccion !== null) return; // ya respondió esta pregunta
    setSeleccion(opcionIndice);
  }

  function siguiente(): void {
    setIndice((actual) => Math.min(actual + 1, preguntas.length - 1));
    setSeleccion(null);
  }

  return (
    <Card className="shadow-card">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-bold text-text">Comprueba lo que aprendiste</p>
        <p className="text-xs text-text-subtle">
          Pregunta {indice + 1} de {preguntas.length}
        </p>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={indice}
          initial={reducirMovimiento ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="mt-3 flex flex-col gap-2"
        >
          <p className="text-sm font-medium text-text">{pregunta.pregunta}</p>

          <div className="flex flex-col gap-2" role="radiogroup" aria-label={pregunta.pregunta}>
            {pregunta.opciones.map((opcion, opcionIndice) => {
              const esElegida = seleccion === opcionIndice;
              const esLaCorrecta = opcionIndice === pregunta.respuestaCorrectaIndice;
              const mostrarEstado = seleccion !== null && (esElegida || esLaCorrecta);

              return (
                <button
                  key={opcion}
                  type="button"
                  role="radio"
                  aria-checked={esElegida}
                  disabled={seleccion !== null}
                  onClick={() => {
                    elegir(opcionIndice);
                  }}
                  className={cn(
                    'focus-ring flex items-center justify-between gap-2 rounded-field border px-3 py-2 text-left text-sm',
                    mostrarEstado && esLaCorrecta && 'border-success bg-success-soft text-success',
                    mostrarEstado &&
                      esElegida &&
                      !esLaCorrecta &&
                      'border-danger bg-danger-soft text-danger',
                    !mostrarEstado && 'border-border bg-surface text-text hover:bg-surface-3',
                    seleccion !== null && !mostrarEstado && 'opacity-60',
                  )}
                >
                  {opcion}
                  {mostrarEstado && esLaCorrecta && (
                    <Check aria-hidden="true" className="size-4 shrink-0" />
                  )}
                  {mostrarEstado && esElegida && !esLaCorrecta && (
                    <X aria-hidden="true" className="size-4 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {seleccion !== null && (
            <div
              className={cn(
                'mt-1 rounded-card p-3 text-xs',
                esCorrecta ? 'bg-success-soft text-success' : 'bg-warning-soft text-warning',
              )}
            >
              <p className="font-semibold">{esCorrecta ? '¡Correcto!' : 'No exactamente.'}</p>
              <p className="mt-0.5 text-text-muted">{pregunta.explicacion}</p>
            </div>
          )}

          {seleccion !== null && !esUltima && (
            <Button variant="secondary" size="sm" className="self-end" onClick={siguiente}>
              Siguiente pregunta
            </Button>
          )}
        </motion.div>
      </AnimatePresence>
    </Card>
  );
}
