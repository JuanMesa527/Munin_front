/**
 * Formato de moneda colombiana para presentacion (capa shared).
 *
 * REGLA DURA: el valor que llega YA viene normalizado en pesos enteros. La
 * trampa de datos del reto (el Excel trae `523.620` para ~523 millones) se
 * corrige UNA sola vez en el pipeline offline de `analysis/`. El front NUNCA
 * multiplica ni divide por mil: si un numero se ve raro, el bug esta arriba.
 */

import type { COP } from '@contracts';

/** Texto cuando no hay dato. Guion largo, no cero: cero significa cero. */
export const SIN_DATO = '—';

/**
 * No se usa `style: 'currency'` a proposito: segun la version de ICU mete
 * espacio duro o el codigo "COP" y el diseno pide exactamente `$523.620.000`.
 */
const formatoEntero = new Intl.NumberFormat('es-CO', {
  maximumFractionDigits: 0,
});

const formatoCompacto = new Intl.NumberFormat('es-CO', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
});

/** `523_620_000` -> `"$523.620.000"`. */
export function formatCOP(valor: COP | null | undefined): string {
  if (valor === null || valor === undefined || !Number.isFinite(valor)) return SIN_DATO;

  const signo = valor < 0 ? '-' : '';
  return `${signo}$${formatoEntero.format(Math.abs(Math.round(valor)))}`;
}

/**
 * `523_620_000` -> `"$523,6 M"`. Para tarjetas y ejes de grafico donde el
 * numero completo rompe el layout.
 */
export function formatCOPCompact(valor: COP | null | undefined): string {
  if (valor === null || valor === undefined || !Number.isFinite(valor)) return SIN_DATO;

  const signo = valor < 0 ? '-' : '';
  const abs = Math.abs(valor);

  if (abs >= 1_000_000_000) {
    return `${signo}$${formatoCompacto.format(abs / 1_000_000_000)} MM`;
  }
  if (abs >= 1_000_000) {
    return `${signo}$${formatoCompacto.format(abs / 1_000_000)} M`;
  }
  if (abs >= 10_000) {
    return `${signo}$${formatoCompacto.format(abs / 1_000)} K`;
  }
  return formatCOP(valor);
}
