/**
 * Como se LEE un porcentaje de afinidad. Capa: shared/lib (puro).
 *
 * Existe porque el numero solo miente por omision en dos direcciones, y las
 * tres pantallas que lo muestran (baraja F2.1, cola del closer F3, ficha de
 * llamada F4) tienen que decir exactamente lo mismo:
 *
 *  1. TIENE PISO. Los ejes que no se pudieron evaluar puntuan neutro (0.5) en
 *     vez de cero, porque castigar por no saber esconderia proyectos validos.
 *     Efecto colateral: un lead del que no sabemos nada saca ~50% contra todo
 *     el catalogo. Ese 50% se lee como "medio compatible" y significa
 *     "no sabemos". `confianza` es lo que separa los dos casos.
 *
 *  2. NO IMPLICA QUE ALCANCE. El eje de capacidad se hunde gradualmente, asi
 *     que un proyecto por encima del techo estimado conserva un puntaje alto y
 *     puede quedar segundo en la baraja. Mostrar ese 81% sin decir que no le
 *     alcanza es justo lo que el glass-box viene a impedir.
 *
 * Nada de esto se decide aqui: el backend calcula `confianza`, `datosFaltantes`
 * y `cabeEnCapacidad` (`ProjectMatch`), y este modulo solo elige las palabras.
 */

import type { ProjectMatch } from '@contracts';

/**
 * Debajo de esto el numero no puede presentarse solo.
 *
 * Calibrado contra los pesos reales del motor (capacidad .40, ubicacion .25,
 * hogar .15, vivienda .12, estilo de vida .08): a 0.9 se marca como parcial
 * TODO lo que le falte algo mas que el eje mas liviano. Que falte el estilo de
 * vida (0.92) mueve poco y no vale la pena senalarlo; que falte la ciudad
 * (0.75) o la capacidad (0.60) cambia el numero de verdad.
 */
const CONFIANZA_MINIMA_PARA_PRESENTARSE_SOLO = 0.9;

export type NivelDeAfinidad = 'calculada' | 'parcial' | 'sin-base';

export interface LecturaDeAfinidad {
  /** El entero que se pinta. */
  porcentaje: number;
  nivel: NivelDeAfinidad;
  /** Rotulo corto que acompana al numero. `null` si el numero se basta solo. */
  rotulo: string | null;
  /**
   * Frase completa para lectores de pantalla y tooltips. Nunca es `null`: el
   * numero SIEMPRE tiene que poder explicarse cuando alguien pregunta.
   */
  explicacion: string;
  /** Advertencia de presupuesto, o `null` si cabe o no se pudo evaluar. */
  advertenciaCapacidad: string | null;
}

function enumerar(items: readonly string[]): string {
  const ultimo = items.at(-1);
  if (items.length <= 1 || ultimo === undefined) return ultimo ?? '';
  return `${items.slice(0, -1).join(', ')} y ${ultimo}`;
}

export function leerAfinidad(match: ProjectMatch): LecturaDeAfinidad {
  const porcentaje = Math.round(match.similitud * 100);

  const nivel: NivelDeAfinidad =
    match.confianza <= 0
      ? 'sin-base'
      : match.confianza < CONFIANZA_MINIMA_PARA_PRESENTARSE_SOLO
        ? 'parcial'
        : 'calculada';

  const faltantes = enumerar(match.datosFaltantes);

  // `sin-base` no dice "estimado" ni "aproximado": esas palabras sugieren una
  // medicion imprecisa, y aqui no hubo medicion.
  const explicacion =
    nivel === 'sin-base'
      ? `Este ${String(porcentaje)}% no esta calculado: falta ${faltantes || 'el dato de base'}. Sirve para ordenar la lista, no para decidir.`
      : nivel === 'parcial'
        ? `Calculado con parte de tu perfil: nos falta ${faltantes}. Los datos que faltan cuentan como neutros, asi que el porcentaje puede subir o bajar cuando los tengamos.`
        : `Calculado con tu perfil completo: capacidad de pago, ubicacion, tamano del hogar, tipo de vivienda y amenidades.`;

  return {
    porcentaje,
    nivel,
    explicacion,
    rotulo: nivel === 'sin-base' ? 'sin calcular' : nivel === 'parcial' ? 'parcial' : null,
    // `null` (no hay capacidad estimada) NO advierte nada: no sabemos si le
    // alcanza, y "no sabemos" no autoriza a insinuar que no.
    advertenciaCapacidad:
      match.cabeEnCapacidad === false ? 'Por encima de tu capacidad estimada' : null,
  };
}
