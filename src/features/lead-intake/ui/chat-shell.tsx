/**
 * Cascaron del chat de F1 (capa ui) — tasks.md 3.9.
 *
 * Presentacional puro: recibe mensajes/paso/progreso por props y notifica la
 * eleccion del usuario por callbacks. Nunca llama `fetch`, nunca decide el
 * siguiente paso — eso lo hace `model/` a partir de lo que responde el
 * backend. Chips y texto libre conviven siempre que el paso lo permita
 * (regla UX: nunca se siente un interrogatorio).
 */

import { useId, useState, type ComponentProps, type ReactElement } from 'react';
import type { ChatMessage, ConversationStep } from '@contracts';
import { ChatBubble, Field, ProgressBar, QuickReplies, TypingIndicator } from '@shared/ui';
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

export function ChatShell({
  messages,
  step,
  progreso,
  isSending,
  onQuickReply,
  onFreeText,
  title = 'Asistente de vivienda',
  className,
}: ChatShellProps): ReactElement {
  const [texto, setTexto] = useState('');
  const idFormulario = useId();

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
    <div className={cn('flex h-full flex-col overflow-hidden rounded-card border border-border', className)}>
      <header className="flex items-center gap-3 bg-whatsapp-header px-4 py-3 text-text-inverse">
        <span
          aria-hidden="true"
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-primary font-display text-sm font-bold text-ink"
        >
          CV
        </span>
        <div className="min-w-0">
          <p className="truncate font-display text-sm font-semibold">{title}</p>
          <p className="text-xs opacity-80">en línea</p>
        </div>
      </header>

      <div className="border-b border-border px-4 py-2">
        <ProgressBar value={progreso} showValue ariaLabel="Progreso del perfilamiento" size="sm" />
      </div>

      <ul
        role="log"
        aria-live="polite"
        aria-label="Conversación"
        className="chat-canvas flex flex-1 flex-col gap-2 overflow-y-auto scrollbar-slim px-3 py-4"
      >
        {messages.map((mensaje) => (
          <ChatBubble
            key={mensaje.id}
            emisor={mensaje.emisor}
            texto={mensaje.texto}
            enviadoEn={mensaje.enviadoEn}
            estado={mensaje.emisor === 'usuario' ? 'entregado' : undefined}
          />
        ))}
        {isSending && <TypingIndicator />}
      </ul>

      {step !== null && (
        <div className="flex flex-col gap-2 border-t border-border bg-surface px-3 py-3">
          {step.quickReplies.length > 0 && (
            <QuickReplies
              options={step.quickReplies}
              onSelect={onQuickReply}
              disabled={isSending}
              label="Respuestas rápidas"
            />
          )}

          {step.permiteTextoLibre && (
            <form onSubmit={manejarEnvio} className="flex items-end gap-2">
              <div className="flex-1">
                <Field
                  label="Tu respuesta"
                  name={idFormulario}
                  value={texto}
                  disabled={isSending}
                  placeholder="Escribe tu respuesta…"
                  onChange={(evento) => {
                    setTexto(evento.currentTarget.value);
                  }}
                />
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
