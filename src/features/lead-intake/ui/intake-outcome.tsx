/**
 * Tres estados terminales de F1 (capa ui) — tasks.md 3.7.
 *
 * Presentacional puro: recibe el `ConversationTurn` terminal y pinta lo que
 * ya vino decidido por el backend. No calcula score, capacidad ni carril
 * (regla dura de `ui/`); `routing === null` (`DATA_UNAVAILABLE`, D3) es el
 * unico caso que NO tiene `FactorBars` ni switch de fixtures — ni siquiera
 * cuando el turno viene de un backend real (D9).
 */

import { Card, CardContent, CardHeader, CardTitle, FactorBars } from '@shared/ui';
import { cn } from '@shared/lib/cn';
import type { ConversationTurn, NonViableReason } from '@contracts';
import type { ReactElement } from 'react';

const RAZON_COPY: Record<NonViableReason, string> = {
  sin_capacidad: 'Tu capacidad de pago estimada todavía no alcanza para este momento.',
  ahorro_insuficiente: 'El ahorro que nos contaste todavía no es suficiente.',
  no_afiliado_sin_cupo: 'Por ahora no hay cupo disponible para compradores no afiliados.',
  score_bajo: 'Tu perfil todavía no alcanza el puntaje mínimo que buscamos.',
  datos_insuficientes: 'Nos faltó información para completar tu perfil.',
};

const MENSAJE_CIERRE_DEFECTO =
  'Por ahora no pudimos completar tu perfilamiento con la información disponible. No es un "no": vuelve a intentarlo más tarde.';

export interface IntakeOutcomeProps {
  /** Turno terminal (`siguientePaso === null`). `ui/` solo renderiza lo que trae. */
  turn: ConversationTurn;
  className?: string | undefined;
}

function ultimoMensajeBot(turn: ConversationTurn): string {
  for (let indice = turn.mensajes.length - 1; indice >= 0; indice -= 1) {
    const mensaje = turn.mensajes[indice];
    if (mensaje?.emisor === 'bot') return mensaje.texto;
  }
  return MENSAJE_CIERRE_DEFECTO;
}

export function IntakeOutcome({ turn, className }: IntakeOutcomeProps): ReactElement {
  const { profile, routing } = turn;

  // completado-sin-clasificar (D3/D9): sin routing no hay carril que explicar.
  // Nunca se ofrece un fixture aqui, ni siquiera etiquetado: ese fallback
  // vive solo en `model/` y solo ante NETWORK_ERROR/TIMEOUT_ERROR.
  if (routing === null) {
    return (
      <Card className={className} data-outcome="sin-clasificar">
        <CardHeader>
          <CardTitle>Por ahora no podemos darte un resultado</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{ultimoMensajeBot(turn)}</p>
        </CardContent>
      </Card>
    );
  }

  const esViable = routing.carril === 'viable';

  return (
    <Card
      className={className}
      accent={esViable ? 'brand' : 'accent'}
      data-outcome={esViable ? 'viable' : 'no-viable'}
    >
      <CardHeader>
        <CardTitle>{esViable ? 'Tu perfil es viable' : 'Todavía no, pero vas por buen camino'}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p>{routing.explicacion}</p>

        {esViable && profile.proyectos.length > 0 && (
          <ul className="flex flex-col gap-2">
            {profile.proyectos.map((proyecto) => (
              <li key={proyecto.proyectoId} className={cn('rounded-field bg-surface-3 p-3 text-sm')}>
                {proyecto.razon}
              </li>
            ))}
          </ul>
        )}

        {!esViable && routing.razones.length > 0 && (
          <ul className="flex flex-col gap-1.5 text-sm text-text-muted">
            {routing.razones.map((razon) => (
              <li key={razon}>{RAZON_COPY[razon]}</li>
            ))}
          </ul>
        )}

        {profile.score !== null && (
          <FactorBars factores={profile.score.factores} weightsVersion={profile.score.weightsVersion} />
        )}
      </CardContent>
    </Card>
  );
}
