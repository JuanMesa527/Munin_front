/**
 * "Tu asistente IA" visual del mock (capa ui, F2.2).
 *
 * Por debajo sigue siendo FAQ curada (`buscarRespuesta`): sin LLM en vivo,
 * sin red. El nombre del mock se respeta en la UI; las respuestas nunca se
 * inventan (glass-box + demo segura).
 */

import { Bot, Send } from 'lucide-react';
import { useState, type ReactElement, type SubmitEvent } from 'react';
import type { ContenidoEducativo } from '@contracts';
import { Card } from '@shared/ui';
import { buscarRespuesta } from '../model/buscar-respuesta';

export interface FaqWidgetProps {
  contenidos: readonly ContenidoEducativo[];
}

const SUGERENCIAS = ['¿Qué es el subsidio?', '¿Cómo ahorro más rápido?', '¿Qué es un crédito hipotecario?'];

export function FaqWidget({ contenidos }: FaqWidgetProps): ReactElement {
  const [pregunta, setPregunta] = useState('');
  const [respuesta, setRespuesta] = useState<ContenidoEducativo | null>(null);
  const [sinResultado, setSinResultado] = useState(false);

  function preguntar(texto: string): void {
    const encontrado = buscarRespuesta(texto, contenidos);
    setRespuesta(encontrado);
    setSinResultado(encontrado === null);
  }

  function alEnviar(evento: SubmitEvent<HTMLFormElement>): void {
    evento.preventDefault();
    if (pregunta.trim().length === 0) return;
    preguntar(pregunta);
  }

  return (
    <Card className="flex h-full min-h-[14rem] flex-col shadow-card">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-text">Tu asistente IA</p>
          <p className="mt-1 text-sm leading-snug text-text-muted">
            ¿Tienes dudas sobre créditos o subsidios? Estoy aquí para ayudarte.
          </p>
        </div>
        <span
          aria-hidden="true"
          className="flex size-14 shrink-0 items-center justify-center rounded-full bg-accent-600 text-white"
        >
          <Bot className="size-7" />
        </span>
      </div>

      <div className="mt-3 flex flex-1 flex-col justify-end gap-2">
        {respuesta !== null && (
          <div className="rounded-card bg-surface-3 p-3 text-sm">
            <p className="font-semibold text-text">{respuesta.titulo}</p>
            <p className="mt-1 text-text-muted">{respuesta.cuerpo}</p>
          </div>
        )}

        {sinResultado && (
          <p className="text-xs text-text-subtle">
            Todavía no tengo contenido curado para eso. Prueba con una de las sugerencias.
          </p>
        )}

        {!respuesta && !sinResultado && (
          <div className="flex flex-wrap gap-1.5">
            {SUGERENCIAS.map((sugerencia) => (
              <button
                key={sugerencia}
                type="button"
                onClick={() => {
                  setPregunta('');
                  preguntar(sugerencia);
                }}
                className="focus-ring rounded-pill border border-border px-2.5 py-1 text-xs text-text-muted hover:bg-surface-3"
              >
                {sugerencia}
              </button>
            ))}
          </div>
        )}
      </div>

      <form onSubmit={alEnviar} className="mt-4 flex gap-2">
        <input
          type="text"
          value={pregunta}
          onChange={(evento) => {
            setPregunta(evento.target.value);
          }}
          placeholder="Escribe tu pregunta..."
          aria-label="Escribe tu pregunta"
          className="focus-ring w-full min-w-0 flex-1 rounded-pill border border-border bg-surface-2 px-4 py-2.5 text-sm text-text placeholder:text-text-subtle"
        />
        <button
          type="submit"
          aria-label="Enviar pregunta"
          className="focus-ring flex size-11 shrink-0 items-center justify-center rounded-full bg-ink text-white hover:opacity-90"
        >
          <Send aria-hidden="true" className="size-4" />
        </button>
      </form>
    </Card>
  );
}
