/**
 * Tres estados terminales de F1 (capa ui) — tasks.md 3.7.
 *
 * Presentacional puro: recibe el `ConversationTurn` terminal y pinta lo que
 * ya vino decidido por el backend. No calcula score, capacidad ni carril
 * (regla dura de `ui/`); `routing === null` (`DATA_UNAVAILABLE`, D3) es el
 * unico caso que NO tiene `FactorBars` ni switch de fixtures — ni siquiera
 * cuando el turno viene de un backend real (D9).
 *
 * La tarjeta viable sigue el boceto `Docs/Design.pdf`: bloque oscuro con la
 * cifra estimada en amarillo de marca. SIEMPRE dice "estimado", nunca
 * "aprobado" (EQUIPO.md §8): no prometemos un cupo que no otorgamos.
 */

import { FactorBars, ScoreGauge } from '@shared/ui';
import { formatCOP } from '@shared/lib/format-money';
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

/** Bloque heroe oscuro con la cifra estimada de vivienda (boceto). */
function HeroEstimado({ turn }: { turn: ConversationTurn }): ReactElement | null {
  const { profile } = turn;
  const precio = profile.capacidad?.precioMaximoEstimado ?? null;
  const tieneScore = profile.score !== null;
  if (precio === null && !tieneScore) return null;

  return (
    <div className="rounded-card bg-ink p-4 text-text-inverse">
      <p className="font-mono text-[0.6875rem] tracking-widest text-brand-primary uppercase">
        Tu perfil de vivienda
      </p>
      <div className="mt-2 flex items-center justify-between gap-4">
        <div className="min-w-0">
          {precio !== null ? (
            <>
              <p className="truncate font-display text-3xl font-bold text-brand-primary">
                {formatCOP(precio)}
              </p>
              <p className="mt-0.5 text-xs text-text-inverse/70">
                Precio de vivienda estimado con lo que nos contaste
              </p>
            </>
          ) : (
            <p className="text-sm text-text-inverse/80">
              Este es tu puntaje estimado según compradores reales.
            </p>
          )}
        </div>
        {tieneScore && profile.score !== null && (
          <ScoreGauge value={profile.score.valor} size="lg" label="puntaje" />
        )}
      </div>
    </div>
  );
}

export function IntakeOutcome({ turn, className }: IntakeOutcomeProps): ReactElement {
  const { profile, routing } = turn;

  // completado-sin-clasificar (D3/D9): sin routing no hay carril que explicar.
  // Nunca se ofrece un fixture aqui, ni siquiera etiquetado: ese fallback
  // vive solo en `model/` y solo ante NETWORK_ERROR/TIMEOUT_ERROR.
  if (routing === null) {
    return (
      <section
        className={cn('flex flex-col gap-3 rounded-card border border-border bg-surface p-5', className)}
        data-outcome="sin-clasificar"
      >
        <h2 className="font-display text-lg font-bold text-text">
          Por ahora no podemos darte un resultado
        </h2>
        <p className="text-sm text-text-muted">{ultimoMensajeBot(turn)}</p>
      </section>
    );
  }

  const esViable = routing.carril === 'viable';

  return (
    <section
      className={cn('flex flex-col gap-4 rounded-card border border-border bg-surface p-5', className)}
      data-outcome={esViable ? 'viable' : 'no-viable'}
    >
      <div className="flex flex-col gap-1">
        <span
          className={cn(
            'inline-flex w-fit items-center rounded-pill px-2.5 py-0.5 font-mono text-[0.6875rem] tracking-wide uppercase',
            esViable ? 'bg-tint-success text-success' : 'bg-tint-blue text-info',
          )}
        >
          {esViable ? 'Perfil viable' : 'Todavía no'}
        </span>
        <h2 className="font-display text-xl font-bold text-text">
          {esViable ? 'Tu perfil es viable' : 'Todavía no, pero vas por buen camino'}
        </h2>
      </div>

      <p className="text-sm text-text-muted">{routing.explicacion}</p>

      {esViable && <HeroEstimado turn={turn} />}

      {esViable && profile.proyectos.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="font-display text-sm font-semibold text-text">Proyectos que te pueden servir</p>
          <ul className="flex flex-col gap-2">
            {profile.proyectos.map((proyecto) => (
              <li
                key={proyecto.proyectoId}
                className="rounded-field border border-border bg-surface-2 p-3 text-sm text-text-muted"
              >
                {proyecto.razon}
              </li>
            ))}
          </ul>
        </div>
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
    </section>
  );
}
