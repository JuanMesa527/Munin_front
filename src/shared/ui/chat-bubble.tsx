/**
 * Burbuja de mensaje del chat de perfilamiento (design system, capa shared).
 *
 * Lenguaje visual Colsubsidio: bot en superficie blanca con borde, usuario en
 * amarillo de marca con tinta (nunca blanco sobre amarillo). Conserva cola SVG
 * y hora inline como en un chat real.
 *
 * ACCESIBILIDAD: el contenedor del hilo (en la feature) debe ser
 * `role="log" aria-live="polite"` para que los mensajes nuevos se anuncien
 * sin robar el foco. Aqui cada burbuja es un `<li>` por defecto.
 */

import { Check, CheckCheck } from 'lucide-react';
import type { ChatMessage, IsoDateTime } from '@contracts';
import type { ReactElement, ReactNode } from 'react';
import { cn } from '../lib/cn';
import { formatTimeOfDay } from '../lib/format-date';

export type Emisor = ChatMessage['emisor'];
export type EstadoEnvio = 'enviado' | 'entregado' | 'leido';

export interface ChatBubbleProps {
  emisor: Emisor;
  /** Texto del mensaje. Para contenido rico usa `children`. */
  texto?: string | undefined;
  enviadoEn?: IsoDateTime | undefined;
  /** Solo aplica a mensajes salientes; el bot no muestra checks. */
  estado?: EstadoEnvio | undefined;
  /** Avatar del bot, a la izquierda de la burbuja. Ignorado para el usuario. */
  avatar?: ReactNode;
  children?: ReactNode;
  className?: string | undefined;
}

function Checks({ estado }: { estado: EstadoEnvio }): ReactElement {
  if (estado === 'enviado') {
    return <Check aria-hidden="true" className="size-3.5" />;
  }
  return (
    <CheckCheck
      aria-hidden="true"
      className={cn('size-3.5', estado === 'leido' && 'text-info')}
    />
  );
}

export function ChatBubble({
  emisor,
  texto,
  enviadoEn,
  estado,
  avatar,
  children,
  className,
}: ChatBubbleProps): ReactElement {
  const esUsuario = emisor === 'usuario';

  return (
    <li
      className={cn(
        'flex w-full items-end gap-2',
        esUsuario ? 'justify-end' : 'justify-start',
        className,
      )}
    >
      {!esUsuario && avatar !== undefined && (
        <span aria-hidden="true" className="mb-0.5 shrink-0">
          {avatar}
        </span>
      )}
      <div
        className={cn(
          'relative max-w-[85%] rounded-bubble px-3.5 py-2.5 shadow-bubble sm:max-w-[75%]',
          'animate-rise text-[0.9375rem] leading-snug text-text',
          esUsuario ? 'rounded-tr-sm bg-brand' : 'rounded-tl-sm bg-surface',
        )}
      >
        {/* Cola de la burbuja: SVG en vez de borde rotado para que no se vea
            aserrada al hacer zoom. Hereda el color de la burbuja. */}
        <svg
          aria-hidden="true"
          viewBox="0 0 8 13"
          className={cn(
            'absolute top-0 h-[13px] w-[8px]',
            esUsuario ? 'right-[-7px] text-brand' : 'left-[-7px] text-surface',
          )}
        >
          <path
            d={esUsuario ? 'M0 0 L8 0 L0 13 Z' : 'M8 0 L0 0 L8 13 Z'}
            fill="currentColor"
          />
        </svg>

        <div className="wrap-break-word whitespace-pre-wrap">
          {texto}
          {children}
          {/* Espaciador inline: reserva el hueco de la hora en la ultima linea,
              igual que un chat tipico, para que el texto no quede debajo. */}
          {enviadoEn !== undefined && (
            <span
              aria-hidden="true"
              className={cn(
                'inline-block select-none',
                esUsuario && estado !== undefined ? 'w-[5.5rem]' : 'w-[4.25rem]',
              )}
            />
          )}
        </div>

        {enviadoEn !== undefined && (
          <span className="absolute right-2.5 bottom-1.5 flex items-center gap-1 text-[0.6875rem] text-text-subtle">
            <time dateTime={enviadoEn}>{formatTimeOfDay(enviadoEn)}</time>
            {esUsuario && estado !== undefined && <Checks estado={estado} />}
          </span>
        )}
      </div>
    </li>
  );
}
