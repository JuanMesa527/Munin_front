/**
 * Formato de fechas para presentacion (capa shared).
 *
 * El backend siempre manda ISO-8601 en UTC; aqui se traduce a la zona del
 * navegador. `ahora` es un parametro con default para que las pruebas no
 * dependan del reloj de la maquina.
 */

import type { IsoDateTime } from '@contracts';
import { SIN_DATO } from './format-money';

const formatoRelativo = new Intl.RelativeTimeFormat('es-CO', { numeric: 'auto' });

const formatoHora = new Intl.DateTimeFormat('es-CO', {
  hour: '2-digit',
  minute: '2-digit',
});

const formatoFechaCorta = new Intl.DateTimeFormat('es-CO', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

interface Division {
  readonly segundos: number;
  readonly unidad: Intl.RelativeTimeFormatUnit;
}

/** De mayor a menor: se elige la primera unidad en la que el delta es >= 1. */
const DIVISIONES: readonly Division[] = [
  { segundos: 31_536_000, unidad: 'year' },
  { segundos: 2_592_000, unidad: 'month' },
  { segundos: 604_800, unidad: 'week' },
  { segundos: 86_400, unidad: 'day' },
  { segundos: 3_600, unidad: 'hour' },
  { segundos: 60, unidad: 'minute' },
];

function parse(iso: IsoDateTime): Date | null {
  const fecha = new Date(iso);
  return Number.isNaN(fecha.getTime()) ? null : fecha;
}

/**
 * `"hace 5 minutos"`, `"ayer"`, `"hace 2 meses"`. Con `numeric: 'auto'` el
 * Intl entrega las formas naturales del espanol en vez de "hace 1 dia".
 */
export function formatRelative(iso: IsoDateTime, ahora: Date = new Date()): string {
  const fecha = parse(iso);
  if (fecha === null) return SIN_DATO;

  const deltaSegundos = (fecha.getTime() - ahora.getTime()) / 1000;
  const absoluto = Math.abs(deltaSegundos);

  if (absoluto < 45) return 'hace un momento';

  for (const division of DIVISIONES) {
    if (absoluto >= division.segundos) {
      const cantidad = Math.round(deltaSegundos / division.segundos);
      return formatoRelativo.format(cantidad, division.unidad);
    }
  }

  return formatoRelativo.format(Math.round(deltaSegundos), 'second');
}

/**
 * `"10:42 a. m."`. La usan las burbujas del chat.
 * PROPUESTA AL EQUIPO: no esta en el manifiesto pero el mock de WhatsApp la
 * necesita en cada mensaje; se deja aqui para no duplicarla en cada feature.
 */
export function formatTimeOfDay(iso: IsoDateTime): string {
  const fecha = parse(iso);
  return fecha === null ? SIN_DATO : formatoHora.format(fecha);
}

/** `"24 jul 2026"`. Para la ficha del closer, donde la fecha exacta importa. */
export function formatShortDate(iso: IsoDateTime): string {
  const fecha = parse(iso);
  return fecha === null ? SIN_DATO : formatoFechaCorta.format(fecha);
}
