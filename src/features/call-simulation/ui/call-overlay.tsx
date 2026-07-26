/**
 * Sobrecapa de la llamada simulada en vivo (F5).
 *
 * Envolvente inmersiva a proposito: durante el entrenamiento el closer no ve el
 * resto de la consola. El badge de simulación queda visible todo el tiempo, en
 * cualquier estado ("Simulation Is Clearly Labeled as Non-Real") — nada de esto
 * marca un telefono real.
 *
 * El micrófono NUNCA es la unica via: el input de texto esta siempre visible y
 * usable mientras la llamada esta activa (spec, "Microphone Failure Never
 * Blocks the Call"). Cuando el micro falla, el motivo se muestra — un boton que
 * no hace nada visible se lee como app rota.
 *
 * DICTADO EN DOS TIEMPOS: "Hablar" graba, "Listo" cierra el tramo y lo manda a
 * transcribir a NUESTRO backend. El texto cae en el input, donde el closer lo
 * corrige antes de enviarlo. No se usa la Web Speech API porque solo Chrome
 * presta el servicio detras de ella.
 *
 * A la derecha vive el `CallContextPanel`: la ficha del prospecto. El closer
 * entrena la llamada con la misma informacion que tendria al marcar de verdad,
 * no de memoria. En pantalla angosta se pliega a un boton "Ficha".
 */

import { useEffect, useRef, useState, type ReactElement } from 'react';
import type { BriefingSheet, CallDifficulty } from '@contracts';
import { cn } from '@shared/lib/cn';
import { useAudioCapture } from '../model/use-audio-capture';
import { useAudioPlayback } from '../model/use-audio-playback';
import { useSimulatedCall } from '../model/use-simulated-call';
import { CallContextPanel } from './call-context-panel';
import { CallScorecardView } from './call-scorecard';

export interface CallOverlayProps {
  briefing: BriefingSheet;
  dificultad: CallDifficulty;
  onClose: () => void;
}

const ETIQUETA_DIFICULTAD: Record<CallDifficulty, string> = {
  receptivo: 'Receptivo',
  realista: 'Realista',
  dificil: 'Difícil',
};

function formatearDuracion(segundosTotales: number): string {
  const mm = String(Math.floor(segundosTotales / 60)).padStart(2, '0');
  const ss = String(segundosTotales % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

export function CallOverlay({ briefing, dificultad, onClose }: CallOverlayProps): ReactElement {
  const call = useSimulatedCall(briefing);
  const audio = useAudioPlayback();
  const [texto, setTexto] = useState('');
  const [segundos, setSegundos] = useState(0);
  const [fichaAbierta, setFichaAbierta] = useState(false);
  const transcriptRef = useRef<HTMLDivElement | null>(null);
  const ultimoIndiceReproducidoRef = useRef(-1);

  // Lo transcrito se agrega al mismo input que el closer escribe a mano:
  // dictado y tecleo son un solo texto editable, y nada de lo dictado se
  // pierde por un fallo posterior del micro.
  const voz = useAudioCapture({
    onTexto: (fragmento) => {
      setTexto((previo) => (previo.length === 0 ? fragmento : `${previo} ${fragmento}`));
    },
    callId: call.callId,
  });

  // Autogestionado: el closer ya eligio dificultad en el picker anterior, la
  // llamada arranca sola al abrir la sobrecapa.
  useEffect(() => {
    void call.iniciar(dificultad);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- solo al montar
  }, []);

  useEffect(() => {
    if (call.estado !== 'en_llamada') return undefined;
    const id = window.setInterval(() => {
      setSegundos((previo) => previo + 1);
    }, 1000);
    return () => {
      window.clearInterval(id);
    };
  }, [call.estado]);

  // Reproduce SOLO el turno nuevo, nunca reproduce de nuevo uno ya sonado.
  useEffect(() => {
    const ultimo = call.turnos.at(-1);
    if (ultimo === undefined || ultimo.indice === ultimoIndiceReproducidoRef.current) return;
    ultimoIndiceReproducidoRef.current = ultimo.indice;
    audio.reproducir(ultimo.audio);
  }, [call.turnos, audio]);

  useEffect(() => {
    transcriptRef.current?.scrollTo({
      top: transcriptRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [call.turnos]);

  const valorEnviable = texto.trim();

  function enviar(): void {
    if (valorEnviable.length === 0 || call.enviandoTurno) return;
    // Un tramo a medio grabar al enviar es del turno que ya se fue: se tira.
    if (voz.grabando) voz.cancelar();

    // El input se limpia SOLO si el turno llego. Si el proveedor falla, lo
    // dictado sigue ahi y basta con volver a pulsar Enviar.
    void call.enviarTurno(valorEnviable).then((enviado) => {
      if (enviado) setTexto('');
    });
  }

  function alternarMicrofono(): void {
    if (voz.grabando) {
      voz.detenerYTranscribir();
      return;
    }
    voz.iniciar();
  }

  const enLlamadaOSonando =
    call.estado === 'marcando' || call.estado === 'sonando' || call.estado === 'en_llamada';

  // En el veredicto la ficha estorba: el scorecard ya trae su propia lectura
  // del lead y necesita el ancho completo.
  const muestraFicha = call.estado !== 'veredicto';

  /** Solo con la llamada contestada tiene sentido hablar o escribir. */
  const conectado = call.estado === 'en_llamada';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Llamada simulada de entrenamiento"
      className="fixed inset-0 z-50 flex flex-col bg-console-paper text-console-ink"
    >
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-console-line bg-console-surface px-5 py-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-pill border border-console-signal bg-console-signal-soft px-3 py-1 font-mono text-[11px] font-bold tracking-[0.12em] text-console-signal-text uppercase">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
            Simulación · no es una llamada real
          </span>
          <span className="text-[14px] text-console-body">
            {briefing.lead.identidad?.nombre ?? 'Lead'} · {ETIQUETA_DIFICULTAD[dificultad]}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {enLlamadaOSonando && (
            <span className="font-mono text-[13px] tabular-nums text-console-body">
              {formatearDuracion(segundos)}
            </span>
          )}

          {muestraFicha && (
            <button
              type="button"
              onClick={() => {
                setFichaAbierta((previo) => !previo);
              }}
              aria-pressed={fichaAbierta}
              className="focus-ring rounded-full border border-console-edge px-4 py-2 text-[13px] font-bold text-console-body transition-colors hover:border-console-ink hover:text-console-ink lg:hidden"
            >
              {fichaAbierta ? 'Ocultar ficha' : 'Ficha'}
            </button>
          )}

          {call.estado === 'veredicto' || call.estado === 'colgada' ? (
            <button
              type="button"
              onClick={onClose}
              className="focus-ring rounded-full border border-console-edge px-4 py-2 text-[13px] font-bold text-console-body transition-colors hover:border-console-ink hover:text-console-ink"
            >
              Cerrar
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                // Soltar el microfono antes de colgar: sin esto el punto rojo
                // de "grabando" del navegador se queda encendido en el veredicto.
                voz.cancelar();
                void call.colgar();
              }}
              className="focus-ring rounded-full bg-console-red px-4 py-2 text-[13px] font-bold text-white transition-colors hover:opacity-90"
            >
              Colgar
            </button>
          )}
        </div>
      </header>

      <div className="relative flex min-h-0 flex-1">
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="min-h-0 flex-1">
            {call.estado === 'veredicto' && call.scorecard !== null ? (
              <CallScorecardView scorecard={call.scorecard} briefing={briefing} />
            ) : call.estado === 'colgada' ? (
              <div className="flex h-full items-center justify-center px-6 text-center">
                <p className="text-console-body">
                  {call.error ?? 'Llamada finalizada antes de conectar.'}
                </p>
              </div>
            ) : (
              <div
                ref={transcriptRef}
                className="mx-auto flex h-full max-w-[720px] flex-col gap-4 overflow-y-auto px-5 py-6"
              >
                {call.turnos.length === 0 && (
                  <p className="text-center font-mono text-[12px] tracking-[0.1em] text-console-mute uppercase">
                    {call.estado === 'marcando' ? 'Marcando…' : 'Sonando…'}
                  </p>
                )}
                {call.turnos.map((turno) => (
                  <div key={turno.indice} className="flex flex-col gap-2">
                    {turno.closerDijo.length > 0 && (
                      <div className="max-w-[80%] self-end rounded-2xl rounded-br-sm bg-console-signal px-4 py-2.5 text-[14px] text-console-ink">
                        {turno.closerDijo}
                      </div>
                    )}
                    <div className="max-w-[80%] self-start rounded-2xl rounded-bl-sm border border-console-line bg-console-surface px-4 py-2.5 text-[14px] text-console-ink">
                      {turno.leadRespondio}
                    </div>
                  </div>
                ))}
                {audio.hablando && (
                  <span
                    aria-live="polite"
                    className="self-start font-mono text-[11px] tracking-[0.1em] text-console-mute uppercase"
                  >
                    Hablando…
                  </span>
                )}
              </div>
            )}
          </div>

          {/* La barra de controles aparece desde que empieza a marcar, no al
              conectar: si solo existe en `en_llamada`, mientras suena el
              timbre no hay micro ni silenciar en pantalla y se lee como que
              la app no los tiene. Se muestran deshabilitados hasta conectar. */}
          {enLlamadaOSonando && (
            <footer className="border-t border-console-line bg-console-surface px-5 py-4">
              {call.error !== null && (
                <p className="mb-2 text-[13px] text-console-red-deep">{call.error}</p>
              )}

              {/* El motivo del fallo de micro se dice completo: "no pasa nada al
              hacer clic" es el peor mensaje de error posible. */}
              {voz.error !== null && (
                <div className="mx-auto mb-2 flex max-w-[720px] items-start gap-3 rounded-xl border border-console-red/40 bg-console-red-soft px-3.5 py-2.5">
                  <p className="flex-1 text-[13px] leading-snug text-console-ink">{voz.error}</p>
                  <button
                    type="button"
                    onClick={voz.limpiarError}
                    className="focus-ring shrink-0 text-[12px] font-bold text-console-body hover:text-console-ink"
                  >
                    Entendido
                  </button>
                </div>
              )}

              {(voz.grabando || voz.transcribiendo) && (
                <p
                  aria-live="polite"
                  className="mx-auto mb-2 flex max-w-[720px] items-center gap-2 font-mono text-[11px] tracking-[0.1em] text-console-signal-text uppercase"
                >
                  {voz.grabando ? (
                    <>
                      <span
                        aria-hidden="true"
                        className="size-2 animate-pulse rounded-full bg-console-red"
                      />
                      Grabando {formatearDuracion(voz.segundos)} · pulsa «Listo» al terminar
                    </>
                  ) : (
                    'Transcribiendo…'
                  )}
                </p>
              )}

              <div className="mx-auto flex max-w-[720px] items-center gap-3">
                <button
                  type="button"
                  onClick={alternarMicrofono}
                  disabled={!voz.soportado || !conectado || voz.transcribiendo}
                  aria-pressed={voz.grabando}
                  aria-label={
                    voz.grabando ? 'Terminar de hablar y transcribir' : 'Hablar por micrófono'
                  }
                  title={
                    !voz.soportado
                      ? 'Este navegador no puede capturar audio. Escribe tu respuesta.'
                      : conectado
                        ? 'Graba lo que dirías; al terminar se transcribe y puedes corregirlo'
                        : 'Espera a que el lead conteste.'
                  }
                  className={cn(
                    'focus-ring flex h-11 shrink-0 items-center gap-2 rounded-full border-2 px-4 text-[13px] font-bold transition-colors',
                    voz.grabando
                      ? 'border-console-red bg-console-red text-white'
                      : 'border-console-edge text-console-body hover:border-console-ink hover:text-console-ink',
                    (!voz.soportado || !conectado || voz.transcribiendo) &&
                      'cursor-not-allowed opacity-45',
                  )}
                >
                  <span aria-hidden="true">{voz.transcribiendo ? '⏳' : '🎤'}</span>
                  <span>{voz.grabando ? 'Listo' : 'Hablar'}</span>
                </button>

                <input
                  type="text"
                  value={texto}
                  disabled={!conectado}
                  onChange={(evento) => {
                    setTexto(evento.target.value);
                  }}
                  onKeyDown={(evento) => {
                    if (evento.key === 'Enter') enviar();
                  }}
                  placeholder={
                    !conectado
                      ? 'Esperando a que el lead conteste…'
                      : voz.grabando
                        ? 'Te estamos grabando; al pulsar «Listo» aparece aquí…'
                        : 'Escribe lo que le dirías al lead…'
                  }
                  aria-label="Lo que le dices al lead"
                  className="focus-ring h-11 flex-1 rounded-full border border-console-edge bg-console-paper px-4 text-[14px] text-console-ink placeholder:text-console-mute disabled:opacity-55"
                />

                <button
                  type="button"
                  onClick={enviar}
                  disabled={!conectado || valorEnviable.length === 0 || call.enviandoTurno}
                  className="focus-ring h-11 shrink-0 rounded-full bg-console-signal px-5 text-[14px] font-bold text-console-ink transition-colors hover:bg-console-signal-dim disabled:pointer-events-none disabled:opacity-55"
                >
                  Enviar
                </button>

                <button
                  type="button"
                  onClick={audio.alternarSilencio}
                  aria-pressed={audio.silenciado}
                  aria-label={
                    audio.silenciado ? 'Activar la voz del lead' : 'Silenciar la voz del lead'
                  }
                  className="focus-ring shrink-0 rounded-full border border-console-edge px-4 py-2.5 text-[13px] font-bold text-console-body transition-colors hover:border-console-ink hover:text-console-ink"
                >
                  {audio.silenciado ? 'Oír al lead' : 'Silenciar al lead'}
                </button>
              </div>
            </footer>
          )}
        </div>

        {/* Ficha del prospecto: columna fija en escritorio, cajon plegable en
            pantalla angosta. Nunca tapa el input: es hermana, no sobrecapa. */}
        {muestraFicha && (
          <aside
            aria-label="Ficha del prospecto"
            className={cn(
              'w-full shrink-0 border-l border-console-line lg:block lg:w-[340px]',
              fichaAbierta ? 'absolute inset-0 z-10 bg-console-paper lg:static' : 'hidden',
            )}
          >
            <CallContextPanel briefing={briefing} />
          </aside>
        )}
      </div>
    </div>
  );
}
