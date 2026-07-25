/**
 * "Notas de la llamada" (F4).
 *
 * YA NO ES UN MOCK. Antes la nota vivia en estado de React, se perdia al
 * recargar y aun asi la UI respondia "nota adjunta a la ficha": le prometia al
 * comercial algo que no pasaba. Ahora el POST persiste nota + estado del lead y
 * el backend lo audita.
 *
 * El estado del lead y su `carril` son ejes distintos: `carril` dice si el lead
 * ES viable, la gestion dice que se HIZO con el. Por eso guardar aqui no
 * reclasifica a nadie.
 */

import { useState, type ReactElement } from 'react';
import type { EstadoGestion, RegistroGestion } from '@contracts';
import { cn } from '@shared/lib/cn';
import { registrarGestion } from '../api/closer-briefing.api';
import { BriefingCard, CardEyebrow } from './briefing-card';

const MENSAJE: Record<EstadoGestion, string> = {
  nuevo: 'Lead marcado como nuevo.',
  contactado: 'Contacto registrado y nota guardada en la ficha.',
  agendado: 'Seguimiento agendado y nota guardada en la ficha.',
  sin_contacto: 'Marcado como sin contacto. Volverá a la cola con menor prioridad.',
};

const ETIQUETA_ESTADO: Record<EstadoGestion, string> = {
  nuevo: 'Nuevo',
  contactado: 'Contactado',
  agendado: 'Agendado',
  sin_contacto: 'Sin contacto',
};

export interface CallNotesProps {
  leadId: string;
  /** Ultima gestion ya registrada, para que la tarjeta no arranque en blanco. */
  gestion: RegistroGestion | null;
}

export function CallNotes({ leadId, gestion }: CallNotesProps): ReactElement {
  const [nota, setNota] = useState(gestion?.nota ?? '');
  const [guardada, setGuardada] = useState<RegistroGestion | null>(gestion);
  const [guardando, setGuardando] = useState(false);
  const [fallo, setFallo] = useState(false);

  async function guardar(estado: EstadoGestion): Promise<void> {
    setGuardando(true);
    setFallo(false);
    const respuesta = await registrarGestion(leadId, estado, nota.trim() === '' ? null : nota);
    setGuardando(false);

    if (!respuesta.ok) {
      // Si falla NO se muestra el mensaje de exito: ese era justo el pecado de
      // la version mock.
      setFallo(true);
      return;
    }
    setGuardada(respuesta.data.gestion);
  }

  return (
    <BriefingCard>
      <CardEyebrow className="mb-3">Notas de la llamada</CardEyebrow>

      {guardada !== null && (
        <p className="mb-3 text-[13px] text-console-body">
          Estado actual:{' '}
          <span className="font-bold text-console-ink">{ETIQUETA_ESTADO[guardada.estado]}</span>
        </p>
      )}

      <label className="sr-only" htmlFor="call-notes">
        Notas de la llamada
      </label>
      <textarea
        id="call-notes"
        value={nota}
        onChange={(e) => {
          setNota(e.target.value);
        }}
        placeholder="Escribe aquí lo que pactes con el cliente…"
        className="focus-ring min-h-[110px] w-full resize-y rounded-xl border-[1.5px] border-console-edge bg-console-surface p-3.5 text-[15px] leading-[1.5] outline-none focus-visible:border-console-ink"
      />

      <div className="mt-3.5 flex gap-2.5">
        <button
          type="button"
          disabled={guardando}
          onClick={() => {
            void guardar('agendado');
          }}
          className={cn(
            'focus-ring flex-1 cursor-pointer rounded-full bg-console-ink px-3 py-[13px]',
            'text-[14px] font-bold text-console-signal transition-colors hover:bg-console-ink-3',
            guardando && 'cursor-wait opacity-70',
          )}
        >
          {guardando ? 'Guardando…' : 'Guardar y agendar'}
        </button>
        <button
          type="button"
          disabled={guardando}
          onClick={() => {
            void guardar('sin_contacto');
          }}
          className="focus-ring cursor-pointer rounded-full border-[1.5px] border-console-edge bg-console-surface px-[18px] py-[13px] text-[14px] font-bold text-console-body transition-colors hover:border-console-ink hover:text-console-ink"
        >
          Sin contacto
        </button>
      </div>

      {fallo && (
        <p
          role="alert"
          className="mt-3 rounded-xl border-[1.5px] border-console-edge px-3.5 py-2.5 text-[13px] font-bold text-console-ink"
        >
          No se pudo guardar. Vuelve a intentarlo.
        </p>
      )}

      {!fallo && guardada !== null && (
        <p
          role="status"
          className="mt-3 rounded-xl bg-console-green-soft px-3.5 py-2.5 text-[13px] font-bold text-console-green-deep"
        >
          {MENSAJE[guardada.estado]}
        </p>
      )}
    </BriefingCard>
  );
}
