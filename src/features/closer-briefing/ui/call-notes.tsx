/**
 * "Notas de la llamada" (F4).
 *
 * MOCK: no hay CRM en el alcance del reto, asi que nada de esto se persiste. La
 * nota vive en estado local y se pierde al recargar, A PROPOSITO: guardarla en
 * localStorage dejaria datos de un titular en el disco del comercial sin base
 * legal ni control de retencion (regla 18 y §8 de EQUIPO.md).
 *
 * Los botones confirman en pantalla en vez de no hacer nada: un boton muerto en
 * la demo se lee como un bug frente al jurado.
 */

import { useState, type ReactElement } from 'react';
import { cn } from '@shared/lib/cn';
import { BriefingCard, CardEyebrow } from './briefing-card';

type Resultado = 'agendado' | 'sin_contacto';

const MENSAJE: Record<Resultado, string> = {
  agendado: 'Seguimiento agendado y nota adjunta a la ficha. (Demo: no se envía a un CRM.)',
  sin_contacto: 'Marcado como sin contacto. Volverá a la cola con menor prioridad. (Demo.)',
};

export function CallNotes(): ReactElement {
  const [nota, setNota] = useState('');
  const [resultado, setResultado] = useState<Resultado | null>(null);

  return (
    <BriefingCard>
      <CardEyebrow className="mb-3">Notas de la llamada</CardEyebrow>

      <label className="sr-only" htmlFor="call-notes">
        Notas de la llamada
      </label>
      <textarea
        id="call-notes"
        value={nota}
        onChange={(e) => {
          setNota(e.target.value);
          setResultado(null);
        }}
        placeholder="Escribe aquí lo que pactes con el cliente…"
        className="focus-ring min-h-[110px] w-full resize-y rounded-xl border-[1.5px] border-console-edge bg-console-surface p-3.5 text-[15px] leading-[1.5] outline-none focus-visible:border-console-ink"
      />

      <div className="mt-3.5 flex gap-2.5">
        <button
          type="button"
          onClick={() => {
            setResultado('agendado');
          }}
          className={cn(
            'focus-ring flex-1 cursor-pointer rounded-full bg-console-ink px-3 py-[13px]',
            'text-[14px] font-bold text-console-signal transition-colors hover:bg-console-ink-3',
          )}
        >
          Guardar y agendar
        </button>
        <button
          type="button"
          onClick={() => {
            setResultado('sin_contacto');
          }}
          className="focus-ring cursor-pointer rounded-full border-[1.5px] border-console-edge bg-console-surface px-[18px] py-[13px] text-[14px] font-bold text-console-body transition-colors hover:border-console-ink hover:text-console-ink"
        >
          Sin contacto
        </button>
      </div>

      {resultado !== null && (
        <p
          role="status"
          className="mt-3 rounded-xl bg-console-green-soft px-3.5 py-2.5 text-[13px] font-bold text-console-green-deep"
        >
          {MENSAJE[resultado]}
        </p>
      )}
    </BriefingCard>
  );
}
