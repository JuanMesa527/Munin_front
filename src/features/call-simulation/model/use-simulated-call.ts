/**
 * Maquina de estados de la llamada simulada (F5). Capa: model.
 *
 * `idle -> marcando -> sonando -> en_llamada -> colgada -> veredicto`.
 * Sin transiciones directas `idle -> en_llamada` ni `en_llamada -> marcando`
 * (spec call-simulation-overlay, "Call State Machine Has No Illegal Transitions").
 *
 * Colgar durante `marcando`/`sonando` (antes de que resuelva la apertura) va
 * directo a `colgada`, sin turnos de por medio (spec, "Hanging up before
 * connecting is a valid short-circuit"). Si la apertura ya estaba en vuelo
 * cuando el closer colgo, se descarta best-effort al backend (limpieza de la
 * sesion), pero nunca se le muestra al closer un veredicto de una llamada que
 * el mismo aborto.
 */

import { useCallback, useMemo, useRef, useState } from 'react';
import type { BriefingSheet, CallDifficulty, CallScorecard, CallTurn } from '@contracts';
import { endCall, sendCallTurn, startCall } from '../api/call-simulation.api';
import { buildPersonaContext } from './build-persona-context';

/**
 * Lectura indirecta de un ref. Existe para romper el "estrechamiento" que TS
 * hace de `canceladaRef.current` a traves de un `await`: como dentro de
 * `iniciar()` no ve ninguna reasignacion visible entre el `await` y la
 * lectura, lo trata como si siguiera siendo el literal que se le asigno antes
 * — sin saber que `colgar()` (otro closure, potencialmente concurrente) pudo
 * mutarlo mientras tanto. Pasar por una llamada de funcion invalida esa
 * narrowing incorrecta.
 */
function leerRef<T>(ref: { current: T }): T {
  return ref.current;
}

export type CallUiState = 'idle' | 'marcando' | 'sonando' | 'en_llamada' | 'colgada' | 'veredicto';

export interface SimulatedCallState {
  readonly estado: CallUiState;
  /** `null` hasta que el backend crea la sesion. */
  readonly callId: string | null;
  readonly turnos: readonly CallTurn[];
  readonly interes: number;
  readonly scorecard: CallScorecard | null;
  readonly error: string | null;
  readonly enviandoTurno: boolean;
  iniciar: (dificultad: CallDifficulty) => Promise<void>;
  enviarTurno: (closerDijo: string) => Promise<boolean>;
  colgar: () => Promise<void>;
}

export function useSimulatedCall(briefing: BriefingSheet): SimulatedCallState {
  const [estado, setEstado] = useState<CallUiState>('idle');
  // Espejo en estado del `callIdRef`: el ref sirve para leerlo dentro de los
  // callbacks sin recrearlos, pero la UI necesita RE-RENDERIZAR cuando la
  // llamada obtiene id (el dictado lo manda para archivar el audio, A14).
  const [callId, setCallId] = useState<string | null>(null);
  const [turnos, setTurnos] = useState<CallTurn[]>([]);
  const [interes, setInteres] = useState(0);
  const [scorecard, setScorecard] = useState<CallScorecard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [enviandoTurno, setEnviandoTurno] = useState(false);

  // Refs, no state: se leen desde callbacks async donde un closure viejo del
  // estado de React llevaria a colgar dos veces o a enviar un turno a una
  // llamada que el usuario ya cerro.
  const callIdRef = useRef<string | null>(null);
  const canceladaRef = useRef(false);

  const persona = useMemo(() => buildPersonaContext(briefing), [briefing]);

  const iniciar = useCallback(
    async (dificultad: CallDifficulty) => {
      setError(null);
      canceladaRef.current = false;
      setEstado('marcando');
      setEstado('sonando');

      try {
        const sesion = await startCall(briefing.lead.id, dificultad, persona);

        if (leerRef(canceladaRef)) {
          // El closer colgo mientras la apertura estaba en vuelo: se limpia
          // la sesion del backend best-effort, sin mostrar nada al closer.
          void endCall(sesion.callId).catch(() => undefined);
          return;
        }

        callIdRef.current = sesion.callId;
        setCallId(sesion.callId);
        setTurnos([sesion.apertura]);
        setInteres(sesion.interes);
        setEstado('en_llamada');
      } catch {
        if (!leerRef(canceladaRef)) {
          setError('No pudimos iniciar la llamada. Intenta de nuevo.');
          setEstado('colgada');
        }
      }
    },
    [briefing.lead.id, persona],
  );

  /**
   * Devuelve si el turno LLEGO. La UI lo necesita para decidir si puede
   * limpiar el input: un turno fallido con el texto ya borrado obliga al
   * closer a volver a escribir —o a volver a dictar— lo que acaba de decir,
   * que es el peor momento posible para pedirselo.
   */
  const enviarTurno = useCallback(async (closerDijo: string): Promise<boolean> => {
    const texto = closerDijo.trim();
    const callId = callIdRef.current;
    if (texto.length === 0 || callId === null) return false;

    setEnviandoTurno(true);
    setError(null);
    try {
      const turno = await sendCallTurn(callId, texto);
      setTurnos((previos) => [...previos, turno]);
      setInteres(turno.interes);
      return true;
    } catch {
      setError('No pudimos enviar tu respuesta. Intenta de nuevo.');
      return false;
    } finally {
      setEnviandoTurno(false);
    }
  }, []);

  const colgar = useCallback(async () => {
    const callId = callIdRef.current;

    if (callId === null) {
      // Todavia no hay sesion en el backend (marcando/sonando): corte directo.
      canceladaRef.current = true;
      setEstado('colgada');
      return;
    }

    setEstado('colgada');
    try {
      const resultado = await endCall(callId);
      setScorecard(resultado);
      setEstado('veredicto');
    } catch {
      setError('No pudimos cerrar la llamada. Tu progreso no se perdio, pero no hay veredicto.');
    }
  }, []);

  return {
    estado,
    callId,
    turnos,
    interes,
    scorecard,
    error,
    enviandoTurno,
    iniciar,
    enviarTurno,
    colgar,
  };
}
