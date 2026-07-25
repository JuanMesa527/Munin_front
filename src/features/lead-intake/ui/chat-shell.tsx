/**
 * Cascaron del chat de F1 (capa ui) — tasks.md 3.9.
 *
 * Presentacional puro: recibe mensajes/paso/progreso/perfil por props y
 * notifica la eleccion del usuario por callbacks. Nunca llama `fetch`, nunca
 * decide el siguiente paso — eso lo hace `model/` a partir de lo que responde
 * el backend.
 *
 * Layout full-bleed Colsubsidio: header/progreso/composer de borde a borde;
 * el hilo centra mensajes en `max-w-3xl`.
 */

import { ArrowUp, House } from 'lucide-react';
import {
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentProps,
  type ReactElement,
} from 'react';
import type { ChatMessage, ConversationStep, LeadProfile } from '@contracts';
import { ChatBubble, ProgressBar, QuickReplies, TypingIndicator } from '@shared/ui';
import { cn } from '@shared/lib/cn';
import { etiquetaProgresoPaso, resumenPerfil } from './chat-copy';

export interface ChatShellProps {
  messages: readonly ChatMessage[];
  /** `null` en un turno terminal: ya no hay nada que preguntar. */
  step: ConversationStep | null;
  /** `ConversationTurn.progreso`, 0-1. */
  progreso: number;
  /** Perfil parcial para el resumen vivo bajo el header. */
  profile: LeadProfile;
  /** `true` mientras `model/` espera la respuesta del backend a un turno. */
  isSending: boolean;
  onQuickReply: (value: string) => void;
  onFreeText: (texto: string) => void;
  title?: string | undefined;
  className?: string | undefined;
}

function BotAvatar({ size = 'md' }: { size?: 'md' | 'lg' }): ReactElement {
  return (
    <span
      className={cn(
        'flex items-center justify-center rounded-full bg-brand text-text shadow-bubble',
        size === 'lg' ? 'size-11' : 'size-9',
      )}
    >
      <House aria-hidden="true" className={size === 'lg' ? 'size-5' : 'size-4'} strokeWidth={2.5} />
    </span>
  );
}

/** Reserva el hueco del avatar cuando el mensaje del bot no lo muestra. */
function AvatarSpacer({ size = 'md' }: { size?: 'md' | 'lg' }): ReactElement {
  return <span aria-hidden="true" className={size === 'lg' ? 'size-11' : 'size-9'} />;
}

export function ChatShell({
  messages,
  step,
  progreso,
  profile,
  isSending,
  onQuickReply,
  onFreeText,
  title = 'Asistente de Vivienda',
  className,
}: ChatShellProps): ReactElement {
  const [texto, setTexto] = useState('');
  const idCampo = useId();
  const finHiloRef = useRef<HTMLDivElement>(null);
  const resumen = resumenPerfil(profile);
  const etiquetaPaso = etiquetaProgresoPaso(step?.slot ?? null, progreso);
  const chipsPrimarios =
    step !== null && step.quickReplies.length >= 2 && step.quickReplies.length <= 3;
  const tieneChips = step !== null && step.quickReplies.length > 0;

  useEffect(() => {
    finHiloRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isSending]);

  const manejarEnvio: ComponentProps<'form'>['onSubmit'] = (evento) => {
    evento.preventDefault();
    const limpio = texto.trim();
    if (limpio.length === 0) return;
    onFreeText(limpio);
    setTexto('');
  };

  return (
    <div className={cn('flex h-full flex-col overflow-hidden bg-surface', className)}>
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex w-full max-w-3xl items-center gap-4 px-4 py-4 sm:px-6">
          {/*
            Logo oficial de Colsubsidio. No lo cambies sin confirmar con producto.
          */}
          <img
            src="/colsubsidio-logo.png"
            alt="Colsubsidio"
            className="h-7 w-auto shrink-0"
            width={146}
            height={28}
          />
          <span aria-hidden="true" className="h-9 w-px bg-border" />
          <div className="min-w-0">
            <p className="truncate font-display text-base font-bold text-text">{title}</p>
            <p className="flex items-center gap-1.5 font-mono text-xs tracking-wide text-text-subtle uppercase">
              <span className="inline-block size-2 rounded-full bg-success" aria-hidden="true" />
              En línea
            </p>
          </div>
        </div>

        {resumen.length > 0 && (
          <div className="border-t border-border bg-surface-3">
            <div
              className="mx-auto flex w-full max-w-3xl flex-wrap gap-2 px-4 py-2.5 sm:px-6"
              aria-label="Resumen del perfil"
            >
              {resumen.map((parte) => (
                <span
                  key={parte}
                  className="rounded-pill bg-surface px-2.5 py-1 font-mono text-[0.6875rem] font-medium tracking-wide text-text-muted"
                >
                  {parte}
                </span>
              ))}
            </div>
          </div>
        )}
      </header>

      <div className="border-b border-border bg-surface px-4 py-2 sm:px-6">
        <div className="mx-auto w-full max-w-3xl">
          <ProgressBar
            value={progreso}
            label={etiquetaPaso}
            ariaLabel="Progreso del perfilamiento"
            size="sm"
            className="rounded-none"
          />
        </div>
      </div>

      <div className="chat-canvas flex-1 overflow-y-auto scrollbar-slim">
        <div className="mx-auto w-full max-w-3xl px-4 pt-5 sm:px-6">
          <p className="mb-4 text-center text-xs leading-relaxed text-text-subtle">
            Puedes responder con las opciones o contarme varios datos de una vez
            (afiliación, ciudad, ingresos…).
          </p>
        </div>
        <ul
          role="log"
          aria-live="polite"
          aria-label="Conversación"
          className="mx-auto flex w-full max-w-3xl flex-col gap-3 px-4 pb-5 sm:px-6"
        >
          {messages.map((mensaje, indice) => {
            const anterior = indice > 0 ? messages[indice - 1] : undefined;
            const mismoEmisorQueAnterior = anterior?.emisor === mensaje.emisor;
            const enPrimerGrupoBot =
              mensaje.emisor === 'bot' &&
              messages[0]?.emisor === 'bot' &&
              messages.slice(0, indice).every((m) => m.emisor === 'bot');
            const mostrarAvatar =
              mensaje.emisor === 'bot' && anterior?.emisor !== 'bot';
            const tamanoAvatar = enPrimerGrupoBot ? 'lg' : 'md';

            return (
              <ChatBubble
                key={mensaje.id}
                emisor={mensaje.emisor}
                texto={mensaje.texto}
                enviadoEn={mensaje.enviadoEn}
                estado={mensaje.emisor === 'usuario' ? 'entregado' : undefined}
                className={mismoEmisorQueAnterior ? '-mt-1.5' : undefined}
                avatar={
                  mensaje.emisor === 'bot'
                    ? mostrarAvatar
                      ? <BotAvatar size={tamanoAvatar} />
                      : <AvatarSpacer size={tamanoAvatar} />
                    : undefined
                }
              />
            );
          })}
          {isSending && (
            <li className="flex animate-rise items-end gap-2">
              <BotAvatar />
              <TypingIndicator />
            </li>
          )}
          <li aria-hidden="true" className="h-px list-none">
            <div ref={finHiloRef} />
          </li>
        </ul>
      </div>

      {step !== null && (
        <div className="border-t border-border bg-surface">
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-3 px-4 py-4 sm:px-6">
            {tieneChips && (
              <QuickReplies
                options={step.quickReplies}
                onSelect={onQuickReply}
                disabled={isSending}
                emphasis={chipsPrimarios ? 'primary' : 'default'}
                label="Respuestas rápidas"
              />
            )}

            {step.permiteTextoLibre && (
              <form onSubmit={manejarEnvio} className="flex flex-col gap-1.5">
                {tieneChips && (
                  <p className="text-xs text-text-subtle">
                    O cuéntame con tus palabras (puedes dar varios datos a la vez)
                  </p>
                )}
                <div className="flex items-center gap-2">
                  <label htmlFor={idCampo} className="sr-only">
                    Escribe tu respuesta
                  </label>
                  <input
                    id={idCampo}
                    type="text"
                    value={texto}
                    disabled={isSending}
                    placeholder="Cuéntame con tus palabras…"
                    autoComplete="off"
                    onChange={(evento) => {
                      setTexto(evento.currentTarget.value);
                    }}
                    className={cn(
                      'focus-ring min-w-0 flex-1 rounded-pill border px-4 py-3',
                      'text-[0.9375rem] text-text placeholder:text-text-subtle',
                      'disabled:opacity-50',
                      tieneChips
                        ? 'border-border/80 bg-surface-2'
                        : 'border-border bg-surface-2',
                    )}
                  />
                  <button
                    type="submit"
                    disabled={isSending || texto.trim().length === 0}
                    aria-label="Enviar mensaje"
                    className={cn(
                      'focus-ring flex size-12 shrink-0 items-center justify-center rounded-full',
                      'bg-brand text-text transition-opacity duration-150',
                      'disabled:pointer-events-none disabled:opacity-40',
                    )}
                  >
                    <ArrowUp aria-hidden="true" className="size-5" strokeWidth={2.5} />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
