/**
 * Estadísticas de presentación para Inicio/Progreso (capa model, F2.2).
 *
 * TODO deriva de `EducationJourney` real (metas, puntos, etapas) — nada de
 * `Math.random()` ni datos fijos independientes del progreso. El mock pide
 * métricas que el contrato no modela (evaluaciones, tiempo de aprendizaje):
 * en vez de inventar un backend nuevo para una demo, se mapean de forma
 * honesta sobre lo que sí existe:
 *   - "Lecciones" = metas tipo 'educacion' (contenido curado).
 *   - "Evaluaciones/retos" = metas de accion (ahorro/documentacion/afiliacion).
 *   - "Tiempo de aprendizaje" = estimado a partir de los puntos ganados.
 * Son proyecciones deterministas de datos reales, no una feature nueva.
 */

import type { LucideIcon } from 'lucide-react';
import type { EducationJourney, EtapaId, Meta } from '@contracts';
import { ETAPA_COPY } from './etapa-copy';

export interface ResumenCamino {
  etapasCompletadas: number;
  etapasEnProgreso: number;
  etapasPendientes: number;
  etapasTotales: number;
}

function metasDe(etapaId: EtapaId, metas: readonly Meta[]): Meta[] {
  return metas.filter((meta) => meta.etapa === etapaId);
}

// Mirror exacto de `metasQueCuentan` en Munin_back (domain/journey.ts): las
// metas opcionales no cuentan para el progreso del lead.
function metasQueCuentan(metas: readonly Meta[]): Meta[] {
  return metas.filter((meta) => meta.opcional !== true);
}

export function resumenCamino(journey: EducationJourney): ResumenCamino {
  const etapas = journey.etapas ?? [];
  let completadas = 0;
  let enProgreso = 0;

  for (const etapa of etapas) {
    const propias = metasDe(etapa.id, journey.metas);
    if (propias.length === 0) continue;
    if (propias.every((meta) => meta.completada)) completadas += 1;
    else if (propias.some((meta) => meta.completada)) enProgreso += 1;
  }
  // La primera etapa sin completar del todo (aunque 0 metas hechas) es "la actual".
  const primeraIncompleta = etapas.find((etapa) => {
    const propias = metasDe(etapa.id, journey.metas);
    return propias.length === 0 || !propias.every((meta) => meta.completada);
  });
  if (primeraIncompleta !== undefined && enProgreso === 0) enProgreso = 1;

  return {
    etapasCompletadas: completadas,
    etapasEnProgreso: enProgreso,
    etapasPendientes: Math.max(0, etapas.length - completadas - enProgreso),
    etapasTotales: etapas.length,
  };
}

export interface ResumenAprendizaje {
  leccionesCompletadas: number;
  leccionesTotales: number;
  evaluacionesAprobadas: number;
  evaluacionesTotales: number;
  promedioAciertos: number;
  tiempoMinutos: number;
}

export function resumenAprendizaje(journey: EducationJourney): ResumenAprendizaje {
  const lecciones = journey.metas.filter((meta) => meta.tipo === 'educacion');
  const evaluaciones = journey.metas.filter((meta) => meta.tipo !== 'educacion');

  return {
    leccionesCompletadas: lecciones.filter((meta) => meta.completada).length,
    leccionesTotales: lecciones.length,
    evaluacionesAprobadas: evaluaciones.filter((meta) => meta.completada).length,
    evaluacionesTotales: evaluaciones.length,
    promedioAciertos: Math.round(journey.progreso * 100),
    // ~2 minutos de foco por cada 10 puntos ganados: estimado, no cronometrado.
    tiempoMinutos: Math.round((journey.puntosTotales / 10) * 2),
  };
}

export function formatTiempo(minutos: number): string {
  const horas = Math.floor(minutos / 60);
  const restoMinutos = minutos % 60;
  if (horas === 0) return `${String(restoMinutos)} min`;
  return `${String(horas)} h ${String(restoMinutos)} min`;
}

export interface AreaConocimiento {
  etapa: EtapaId;
  titulo: string;
  icono: LucideIcon;
  porcentaje: number;
  nivel: 'Dominado' | 'Avanzado' | 'Intermedio' | 'Básico' | 'Inicial';
}

function nivelDe(porcentaje: number): AreaConocimiento['nivel'] {
  if (porcentaje >= 100) return 'Dominado';
  if (porcentaje >= 70) return 'Avanzado';
  if (porcentaje >= 40) return 'Intermedio';
  if (porcentaje >= 15) return 'Básico';
  return 'Inicial';
}

export function conocimientoPorArea(journey: EducationJourney): AreaConocimiento[] {
  const etapas = journey.etapas ?? [];
  return etapas
    .map((etapa) => {
      const propias = metasDe(etapa.id, journey.metas);
      const porcentaje =
        propias.length === 0 ? 0 : Math.round((propias.filter((m) => m.completada).length / propias.length) * 100);
      const copy = ETAPA_COPY[etapa.id];
      return { etapa: etapa.id, titulo: copy.titulo, icono: copy.icono, porcentaje, nivel: nivelDe(porcentaje) };
    })
    .sort((a, b) => b.porcentaje - a.porcentaje);
}

/**
 * Un array vacío significa "sin suficiente historial real todavía" (menos de
 * dos metas-que-cuentan completadas con `completadaEn`), NUNCA "0% de
 * progreso". El consumidor (`progreso-screen.tsx`) debe tratarlo como un
 * empty-state propio, no graficar un punto suelto ni rellenar con ceros.
 */
export interface PuntoEvolucion {
  etiqueta: string;
  porcentaje: number;
}

/** Con 0 o 1 fecha real no hay curva que trazar, solo un punto suelto. */
const PUNTOS_MINIMOS_PARA_CURVA = 2;

/**
 * Serie de "evolución" derivada 100% de `Meta.completadaEn` real (adenda
 * A15): ordena las metas-que-cuentan ya completadas por su fecha real de
 * finalización y acumula, en cada una, el % de metas-que-cuentan completadas
 * hasta ese punto. Ya no fabrica una rampa hacia atrás desde el progreso de
 * hoy — antes de A15 no existía la fecha real de cada meta, ahora sí.
 */
export function evolucionAprendizaje(journey: EducationJourney): PuntoEvolucion[] {
  const queCuentan = metasQueCuentan(journey.metas);
  const total = queCuentan.length;
  if (total === 0) return [];

  const completadasConFecha = queCuentan
    .filter((meta): meta is Meta & { completadaEn: string } => meta.completadaEn !== undefined)
    .sort((a, b) => new Date(a.completadaEn).getTime() - new Date(b.completadaEn).getTime());

  if (completadasConFecha.length < PUNTOS_MINIMOS_PARA_CURVA) return [];

  return completadasConFecha.map((meta, indice) => ({
    etiqueta: new Date(meta.completadaEn).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' }),
    porcentaje: Math.round(((indice + 1) / total) * 100),
  }));
}

export interface DistribucionTiempo {
  etapa: EtapaId;
  titulo: string;
  minutos: number;
  proporcion: number;
}

export function distribucionTiempo(journey: EducationJourney): DistribucionTiempo[] {
  const { tiempoMinutos } = resumenAprendizaje(journey);
  const etapas = journey.etapas ?? [];
  const puntosPorEtapa = etapas.map((etapa) => ({
    etapa: etapa.id,
    puntos: metasDe(etapa.id, journey.metas)
      .filter((meta) => meta.completada)
      .reduce((suma, meta) => suma + meta.puntos, 0),
  }));
  const totalPuntos = puntosPorEtapa.reduce((suma, item) => suma + item.puntos, 0);

  if (totalPuntos === 0) return [];

  return puntosPorEtapa
    .filter((item) => item.puntos > 0)
    .map((item) => {
      const proporcion = item.puntos / totalPuntos;
      return {
        etapa: item.etapa,
        titulo: ETAPA_COPY[item.etapa].titulo,
        minutos: Math.round(tiempoMinutos * proporcion),
        proporcion,
      };
    })
    .sort((a, b) => b.proporcion - a.proporcion);
}
