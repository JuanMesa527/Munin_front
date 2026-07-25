/**
 * I/O de F2.1. Capa: api.
 *
 * Todo pasa por `@shared/api/http-client` y usa `API_ROUTES` del contrato:
 * ningun componente hace `fetch` a mano ni escribe una URL literal.
 */

import type {
  EnrichmentDeck,
  EnrichmentSummary,
  EnrichmentTelemetry,
  PreferenciaContacto,
  SwipeAction,
  SwipeEvent,
} from '@contracts';
import { API_ROUTES } from '@contracts';
import { apiGet, apiPost, sendBeacon, unwrap } from '@shared/api/http-client';

/** Telemetria de la tarjeta que viaja junto al swipe (adenda A10). */
export interface SwipeTelemetry {
  dwellMs?: number | undefined;
  abrioDetalle?: boolean | undefined;
  detalleMs?: number | undefined;
}

/** Cuantas tarjetas trae la baraja. Suficiente para elegir, no tantas como para cansar. */
export const TARJETAS_POR_BARAJA = 12;

export interface SwipeProgress {
  decididas: number;
  intentScore: number;
  ultimo: SwipeEvent;
}

export function fetchDeck(leadId: string): Promise<EnrichmentDeck> {
  return unwrap(
    apiGet<EnrichmentDeck>(API_ROUTES.enrichment.deck, {
      leadId,
      limite: TARJETAS_POR_BARAJA,
    }),
  );
}

export function postSwipe(
  leadId: string,
  proyectoId: string,
  accion: SwipeAction,
  telemetria?: SwipeTelemetry,
): Promise<SwipeProgress> {
  return unwrap(
    apiPost<SwipeProgress>(API_ROUTES.enrichment.swipe, {
      leadId,
      proyectoId,
      accion,
      ...telemetria,
    }),
  );
}

/**
 * Cierra F2.1. `preferenciaContacto` es opcional porque el cierre ocurre
 * automaticamente al agotar la baraja, ANTES de que el usuario elija cuando lo
 * llamamos; la pantalla de resumen vuelve a llamar con la preferencia cuando la
 * responde. Sin respuesta, la ficha del closer dice "Sin franja preferida" en
 * vez de inventar un horario.
 */
export function postSummary(
  leadId: string,
  preferenciaContacto?: PreferenciaContacto,
): Promise<EnrichmentSummary> {
  return unwrap(
    apiPost<EnrichmentSummary>(API_ROUTES.enrichment.summary, {
      leadId,
      ...(preferenciaContacto === undefined ? {} : { preferenciaContacto }),
    }),
  );
}

/**
 * Manda el lote de telemetria de atencion (vistas + resumen de sesion). Es
 * fire-and-forget: se prefiere `sendBeacon` para que sobreviva al cierre de la
 * pestana, con `apiPost` de respaldo si el navegador no lo soporta. Nunca lanza:
 * la telemetria jamas puede romperle el flujo al usuario.
 */
export function flushTelemetry(payload: EnrichmentTelemetry): void {
  const enviado = sendBeacon(API_ROUTES.enrichment.telemetry, payload);
  if (!enviado) {
    void apiPost(API_ROUTES.enrichment.telemetry, payload);
  }
}
