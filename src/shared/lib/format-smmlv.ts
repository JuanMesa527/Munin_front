/**
 * Conversion a SMMLV para presentacion (capa shared).
 *
 * El SMMLV es la unidad de medida del negocio: el tope del Subsidio Familiar
 * de Vivienda es <= 4 SMMLV de ingreso del hogar. Mostrar el valor en SMMLV
 * junto al valor en pesos le ahorra al lead la cuenta mental.
 */

import { SMMLV_2026, type COP } from '@contracts';
import { SIN_DATO } from './format-money';

const formatoSmmlv = new Intl.NumberFormat('es-CO', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
});

/** Cuantos SMMLV representa un monto en pesos. Sin redondear: eso lo hace el formateador. */
export function toSmmlv(valor: COP): number {
  if (!Number.isFinite(valor)) return 0;
  return valor / SMMLV_2026;
}

/** `5_200_000` -> `"3,2 SMMLV"`. La sigla no se pluraliza. */
export function formatSmmlv(valor: COP | null | undefined): string {
  if (valor === null || valor === undefined || !Number.isFinite(valor)) return SIN_DATO;

  return `${formatoSmmlv.format(toSmmlv(valor))} SMMLV`;
}
