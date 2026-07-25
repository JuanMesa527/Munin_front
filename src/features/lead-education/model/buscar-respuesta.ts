/**
 * Búsqueda determinista sobre el contenido curado (capa model, F2.2).
 *
 * GLASS-BOX + DEMO SEGURA: nada de LLM en vivo. Empareja la pregunta contra
 * el contenido educativo ya cargado por coincidencia de palabras — mismo
 * espíritu que un buscador de FAQ, sin red y sin depender de una API key.
 */

import type { ContenidoEducativo } from '@contracts';

const PALABRAS_VACIAS = new Set([
  'que', 'qué', 'como', 'cómo', 'el', 'la', 'los', 'las', 'un', 'una', 'de', 'del',
  'y', 'o', 'a', 'en', 'es', 'son', 'para', 'por', 'con', 'mi', 'tu', 'me', 'se',
]);

function palabrasDe(texto: string): string[] {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/gu, '')
    .split(/[^a-z0-9]+/u)
    .filter((palabra) => palabra.length > 2 && !PALABRAS_VACIAS.has(palabra));
}

/** Encuentra el contenido curado que mejor responde la pregunta, o `null`. */
export function buscarRespuesta(
  pregunta: string,
  contenidos: readonly ContenidoEducativo[],
): ContenidoEducativo | null {
  const palabrasPregunta = palabrasDe(pregunta);
  if (palabrasPregunta.length === 0) return null;

  let mejor: ContenidoEducativo | null = null;
  let mejorPuntaje = 0;

  for (const contenido of contenidos) {
    const palabrasContenido = new Set(palabrasDe(`${contenido.titulo} ${contenido.cuerpo}`));
    const puntaje = palabrasPregunta.filter((palabra) => palabrasContenido.has(palabra)).length;
    if (puntaje > mejorPuntaje) {
      mejorPuntaje = puntaje;
      mejor = contenido;
    }
  }

  return mejor;
}
