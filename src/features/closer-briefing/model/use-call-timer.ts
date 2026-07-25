/**
 * Cronometro de la llamada en vivo (F4).
 *
 * Es un control MOCK: no marca, no graba y no se conecta a ninguna telefonia.
 * Existe porque el comercial necesita ver cuanto lleva hablando mientras lee la
 * ficha, y porque en la demo hace tangible que esta pantalla se usa DURANTE la
 * llamada y no antes.
 *
 * Al colgar se conserva el tiempo en pantalla (el closer quiere anotar cuanto
 * duro) y se reinicia al iniciar la siguiente.
 */

import { useCallback, useEffect, useState } from 'react';

export interface CallTimerState {
  readonly activa: boolean;
  readonly segundos: number;
  /** `mm:ss` listo para pintar. */
  readonly tiempo: string;
  toggle: () => void;
}

function formatear(total: number): string {
  const mm = String(Math.floor(total / 60)).padStart(2, '0');
  const ss = String(total % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

export function useCallTimer(): CallTimerState {
  const [activa, setActiva] = useState(false);
  const [segundos, setSegundos] = useState(0);

  // El effect solo se suscribe al reloj. El reinicio del contador ocurre en el
  // handler, no aqui: hacerlo dentro del effect dispara un render en cascada
  // (y `react-hooks/set-state-in-effect` lo marca, con razon).
  useEffect(() => {
    if (!activa) return undefined;

    const id = window.setInterval(() => {
      setSegundos((previo) => previo + 1);
    }, 1000);

    return () => {
      window.clearInterval(id);
    };
  }, [activa]);

  const toggle = useCallback(() => {
    if (activa) {
      // Al colgar se conserva el tiempo: el closer quiere anotar cuanto duro.
      setActiva(false);
      return;
    }
    setSegundos(0);
    setActiva(true);
  }, [activa]);

  return { activa, segundos, tiempo: formatear(segundos), toggle };
}
