/**
 * Estado de UI del lector de lecciones paso a paso (capa model, F2.2).
 *
 * Puramente de presentación: no hace fetch (las pantallas ya tienen
 * `journey`/`contenidos` vía `useEducationJourney`). Solo decide qué etapa
 * está abierta en el modal y en qué paso arranca.
 */

import { useState } from 'react';
import type { ContenidoEducativo, EtapaId } from '@contracts';

export interface UseLessonReaderResult {
  etapaAbierta: EtapaId | undefined;
  pasoInicial: number;
  abrir: (etapaId: EtapaId, contenidoId?: string) => void;
  cerrar: () => void;
}

/**
 * Resuelve el índice (dentro de los contenidos de esa etapa, en orden de
 * catálogo) del `contenidoId` pedido. Sin `contenidoId`, o si no se encuentra,
 * arranca en el primer paso.
 */
export function resolverPasoInicial(
  contenidos: readonly ContenidoEducativo[],
  etapaId: EtapaId,
  contenidoId?: string,
): number {
  if (contenidoId === undefined) return 0;

  const deLaEtapa = contenidos.filter((contenido) => contenido.etapa === etapaId);
  const indice = deLaEtapa.findIndex((contenido) => contenido.id === contenidoId);
  return indice === -1 ? 0 : indice;
}

export function useLessonReader(contenidos: readonly ContenidoEducativo[]): UseLessonReaderResult {
  const [etapaAbierta, setEtapaAbierta] = useState<EtapaId | undefined>(undefined);
  const [pasoInicial, setPasoInicial] = useState(0);

  return {
    etapaAbierta,
    pasoInicial,
    abrir: (etapaId: EtapaId, contenidoId?: string): void => {
      setEtapaAbierta(etapaId);
      setPasoInicial(resolverPasoInicial(contenidos, etapaId, contenidoId));
    },
    cerrar: (): void => {
      setEtapaAbierta(undefined);
    },
  };
}
