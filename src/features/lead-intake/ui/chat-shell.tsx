/**
 * Cascaron del chat de F1 (capa ui) — tasks.md 3.9.
 *
 * Presentacional puro: recibe mensajes/paso/progreso por props y notifica la
 * eleccion del usuario por callbacks. Nunca llama `fetch`, nunca decide el
 * siguiente paso — eso lo hace `model/` a partir de lo que responde el
 * backend. Chips y texto libre conviven siempre que el paso lo permita
 * (regla UX: nunca se siente un interrogatorio).
 *
 * El layout sigue el boceto `Docs/Design.pdf`: header claro con la marca,
 * hilo con avatares del bot, burbujas estilo WhatsApp y un composer con
 * boton de envio, todo dentro de la columna tipo telefono que arma la pantalla.
 */

import { ArrowUp, House } from 'lucide-react';
import { useId, useState, type ComponentProps, type ReactElement } from 'react';
import type { ChatMessage, ConversationStep } from '@contracts';
import { ChatBubble, ProgressBar, QuickReplies, TypingIndicator } from '@shared/ui';
import { cn } from '@shared/lib/cn';

export interface ChatShellProps {
  messages: readonly ChatMessage[];
  /** `null` en un turno terminal: ya no hay nada que preguntar. */
  step: ConversationStep | null;
  /** `ConversationTurn.progreso`, 0-1. */
  progreso: number;
  /** `true` mientras `model/` espera la respuesta del backend a un turno. */
  isSending: boolean;
  onQuickReply: (value: string) => void;
  onFreeText: (texto: string) => void;
  title?: string | undefined;
  className?: string | undefined;
}

/** Avatar circular del bot, a la izquierda de cada burbuja del bot (boceto). */
function BotAvatar(): ReactElement {
  return (
    <span className="flex size-8 items-center justify-center rounded-full bg-brand-primary text-ink shadow-bubble">
      <House aria-hidden="true" className="size-4" strokeWidth={2.5} />
    </span>
  );
}

export function ChatShell({
  messages,
  step,
  progreso,
  isSending,
  onQuickReply,
  onFreeText,
  title = 'Asistente de Vivienda',
  className,
}: ChatShellProps): ReactElement {
  const [texto, setTexto] = useState('');
  const idCampo = useId();

  // Sin anotar el tipo del evento a proposito: `FormEvent` esta deprecado en
  // los tipos de React 19 (@typescript-eslint/no-deprecated); dejamos que
  // TypeScript lo infiera desde `onSubmit`.
  const manejarEnvio: ComponentProps<'form'>['onSubmit'] = (evento) => {
    evento.preventDefault();
    const limpio = texto.trim();
    if (limpio.length === 0) return;
    onFreeText(limpio);
    setTexto('');
  };

  return (
    <div className={cn('flex h-full flex-col overflow-hidden bg-surface', className)}>
      <header className="flex items-center gap-3 border-b border-border bg-whatsapp-header px-4 py-3">
        {/*
          Logo oficial de Colsubsidio: uso autorizado explicitamente por el
          dueno de producto para esta demo, aun cuando CLAUDE.md §8 normalmente
          lo prohibe. NO lo "corrijas" sin confirmar con producto.
        */}
        <img
          src="/colsubsidio-logo.png"
          alt="Colsubsidio"
          className="h-5 w-auto shrink-0"
          width={131}
          height={25}
        />
        <span aria-hidden="true" className="h-8 w-px bg-border" />
        <div className="min-w-0">
          <p className="truncate font-display text-sm font-bold text-text">{title}</p>
          <p className="flex items-center gap-1.5 font-mono text-[0.6875rem] tracking-wide text-text-subtle uppercase">
            <span className="inline-block size-2 rounded-full bg-success" aria-hidden="true" />
            En línea · 30X
          </p>
        </div>
      </header>

      <ProgressBar
        value={progreso}
        ariaLabel="Progreso del perfilamiento"
        size="sm"
        className="rounded-none"
      />

      <ul
        role="log"
        aria-live="polite"
        aria-label="Conversación"
        className="chat-canvas flex flex-1 flex-col gap-2.5 overflow-y-auto scrollbar-slim px-3 py-4"
      >
        {messages.map((mensaje) => (
          <ChatBubble
            key={mensaje.id}
            emisor={mensaje.emisor}
            texto={mensaje.texto}
            enviadoEn={mensaje.enviadoEn}
            estado={mensaje.emisor === 'usuario' ? 'entregado' : undefined}
            avatar={mensaje.emisor === 'bot' ? <BotAvatar /> : undefined}
          />
        ))}
        {isSending && (
          <li className="flex items-end gap-2">
            <BotAvatar />
            <TypingIndicator />
          </li>
        )}
      </ul>

      {step !== null && (
        <div className="flex flex-col gap-2.5 border-t border-border bg-surface px-3 py-3">
          {step.quickReplies.length > 0 && (
            <QuickReplies
              options={step.quickReplies}
              onSelect={onQuickReply}
              disabled={isSending}
              label="Respuestas rápidas"
            />
          )}

          {step.permiteTextoLibre && (
            <form onSubmit={manejarEnvio} className="flex items-center gap-2">
              <label htmlFor={idCampo} className="sr-only">
                Escribe tu respuesta
              </label>
              <input
                id={idCampo}
                type="text"
                value={texto}
                disabled={isSending}
                placeholder="Escribe tu mensaje…"
                autoComplete="off"
                onChange={(evento) => {
                  setTexto(evento.currentTarget.value);
                }}
                className={cn(
                  'focus-ring min-w-0 flex-1 rounded-pill border border-border bg-surface-2 px-4 py-2.5',
                  'text-[0.9375rem] text-text placeholder:text-text-subtle',
                  'disabled:opacity-50',
                )}
              />
              <button
                type="submit"
                disabled={isSending || texto.trim().length === 0}
                aria-label="Enviar mensaje"
                className={cn(
                  'focus-ring flex size-11 shrink-0 items-center justify-center rounded-full',
                  'bg-brand-primary text-ink transition-opacity duration-150',
                  'disabled:pointer-events-none disabled:opacity-40',
                )}
              >
                <ArrowUp aria-hidden="true" className="size-5" strokeWidth={2.5} />
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
