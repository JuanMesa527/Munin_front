/**
 * Copy de UI para slots del perfilamiento F1.
 * Solo presentacion: no decide orden ni validacion (eso vive en el backend).
 */

import type { LeadProfile, Slot } from '@contracts';
import { formatCOPCompact } from '@shared/lib/format-money';

/** Misma secuencia que pregunta el backend (`AskedSlot`). */
export const PASOS_PERFILAMIENTO: readonly Slot[] = [
  'nombre',
  'email',
  'telefono',
  'edad',
  'estadoCivil',
  'afiliacion',
  'rangoSalarial',
  'segmentoFamiliar',
  'ciudad',
  'ahorro',
  'capacidadAhorroMensual',
] as const;

const ETIQUETA_SLOT: Record<Slot, string> = {
  nombre: 'Nombre',
  email: 'Correo',
  telefono: 'Celular',
  edad: 'Edad',
  estadoCivil: 'Estado civil',
  afiliacion: 'Afiliación',
  rangoSalarial: 'Ingresos',
  segmento: 'Segmento',
  personasACargo: 'Personas a cargo',
  ciudad: 'Ciudad',
  segmentoFamiliar: 'Familia',
  ahorro: 'Ahorro',
  capacidadAhorroMensual: 'Ahorro mensual',
};

export function etiquetaSlot(slot: Slot): string {
  return ETIQUETA_SLOT[slot];
}

/**
 * "Paso 2 de 11 · Nombre". Si el paso no pide slot (saludo/cierre), solo
 * el contador derivado del progreso.
 */
export function etiquetaProgresoPaso(
  stepSlot: Slot | null,
  progreso: number,
): string {
  const total = PASOS_PERFILAMIENTO.length;
  if (stepSlot !== null) {
    const indice = PASOS_PERFILAMIENTO.indexOf(stepSlot);
    if (indice >= 0) {
      return `Paso ${String(indice + 1)} de ${String(total)} · ${etiquetaSlot(stepSlot)}`;
    }
  }
  const estimado = Math.min(total, Math.max(1, Math.round(progreso * total) || 1));
  return `Paso ${String(estimado)} de ${String(total)}`;
}

/** Chips del resumen vivo bajo el header. Vacío si aún no hay nada lleno. */
export function resumenPerfil(profile: LeadProfile): readonly string[] {
  const partes: string[] = [];

  if (profile.nombre !== null) partes.push(profile.nombre.split(/\s+/u)[0] ?? profile.nombre);
  if (profile.edad !== null) partes.push(`${String(profile.edad)} años`);
  if (profile.estadoCivil !== null) partes.push(profile.estadoCivil);

  if (profile.esAfiliado === true) partes.push('Afiliado');
  else if (profile.esAfiliado === false) partes.push('No afiliado');

  if (profile.rangoSalarial !== null) partes.push(profile.rangoSalarial);
  if (profile.segmentoFamiliar !== null) partes.push(profile.segmentoFamiliar);
  if (profile.ciudad !== null) partes.push(profile.ciudad);
  if (profile.ahorroDeclarado !== null) {
    partes.push(`Ahorro ${formatCOPCompact(profile.ahorroDeclarado)}`);
  }
  if (profile.capacidadAhorroMensual !== null) {
    partes.push(`Mensual ${formatCOPCompact(profile.capacidadAhorroMensual)}`);
  }

  return partes;
}
