/**
 * Checklist del guion de llamada (F4).
 *
 * El closer marca cada punto mientras habla. El progreso es puramente local: no
 * se persiste porque es un apoyo durante la llamada, no un registro del CRM.
 */

import { useCallback, useMemo, useState } from 'react';

export interface TalkingPointsState {
  readonly cubiertos: ReadonlySet<number>;
  readonly total: number;
  readonly hechos: number;
  /** 0-100 para la barra de progreso. */
  readonly porcentaje: number;
  toggle: (indice: number) => void;
}

export function useTalkingPoints(total: number): TalkingPointsState {
  const [cubiertos, setCubiertos] = useState<ReadonlySet<number>>(() => new Set<number>());

  const toggle = useCallback((indice: number) => {
    setCubiertos((previo) => {
      const siguiente = new Set(previo);
      if (siguiente.has(indice)) siguiente.delete(indice);
      else siguiente.add(indice);
      return siguiente;
    });
  }, []);

  const hechos = cubiertos.size;

  const porcentaje = useMemo(
    () => (total === 0 ? 0 : Math.round((hechos / total) * 100)),
    [hechos, total],
  );

  return { cubiertos, total, hechos, porcentaje, toggle };
}
