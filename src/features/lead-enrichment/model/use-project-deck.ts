/**
 * Estado de la baraja de proyectos. Capa: model.
 *
 * Aqui NO se decide nada de negocio: el orden, la similitud, la razon y el
 * `intentScore` los calcula el backend (glass-box). Este hook lleva la cuenta
 * de en que tarjeta va el usuario, despacha las decisiones y MIDE la atencion:
 * cuanto miro cada tarjeta, si abrio el detalle y un resumen agregado de la
 * sesion que se envia al cerrar o al abandonar.
 *
 * La telemetria es SENAL GRUESA y sin PII (Ley 1581): tiempos y conteos, mas un
 * identificadores tecnicos del lead y proyecto. Nunca el user-agent crudo ni la
 * IP.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  EnrichmentDeck,
  EnrichmentSessionSummary,
  EnrichmentSummary,
  PreferenciaContacto,
  SwipeAction,
  ViewEvent,
} from '@contracts';
import { queryKeys } from '@shared/api/query-keys';
import { fetchDeck, flushTelemetry, postSummary, postSwipe } from '../api/enrichment.api';

export interface DeckState {
  deck: EnrichmentDeck | undefined;
  cargando: boolean;
  error: Error | null;
  /** Indice de la tarjeta que esta arriba del mazo. */
  indice: number;
  restantes: number;
  /** 0..1, para la barra de progreso. */
  avance: number;
  /** `true` cuando ya no quedan tarjetas por decidir. */
  terminado: boolean;
  intentScore: number;
  decidir: (accion: SwipeAction) => void;
  /** Avisa que el detalle de un proyecto se abrio (`true`) o cerro (`false`). */
  notificarDetalle: (abierto: boolean) => void;
  /** Cierra F2.1 y persiste el lead enriquecido. */
  cerrar: () => void;
  /**
   * Reenvia el cierre con la franja que el titular eligio en el resumen. Va
   * aparte de `cerrar` porque el cierre se dispara solo al agotar la baraja,
   * antes de que exista respuesta a "¿cuándo te llamamos?".
   */
  guardarPreferenciaContacto: (preferencia: PreferenciaContacto) => void;
  preferenciaGuardada: boolean;
  cerrando: boolean;
  /** `true` si el POST del resumen fallo: habilita reintentar el cierre. */
  cierreFallo: boolean;
  resumen: EnrichmentSummary | undefined;
}

/** Reloj monotonico para medir duraciones; cae a `Date.now` si no hay `performance`. */
function ahora(): number {
  return typeof performance !== 'undefined' ? performance.now() : Date.now();
}

function esDesktop(): boolean {
  return typeof window !== 'undefined' && window.innerWidth >= 1024;
}

export function useProjectDeck(leadId: string): DeckState {
  const cliente = useQueryClient();
  const [indice, setIndice] = useState(0);
  const [intentScore, setIntentScore] = useState(0);

  // --- Telemetria: todo en refs para no re-renderizar al medir tiempos. ---
  const sesionInicioPerf = useRef<number | null>(null);
  const sesionInicioIso = useRef<string | null>(null);
  const tarjetaDesde = useRef<number | null>(null);
  const detalleDesde = useRef<number | null>(null);
  const detalleAcumMs = useRef(0);
  const detalleUsado = useRef(false);
  const vistas = useRef<ViewEvent[]>([]);
  const conteos = useRef({ likes: 0, favoritos: 0, passes: 0 });
  const enviado = useRef(false);

  const consulta = useQuery({
    queryKey: queryKeys.enrichment.state(leadId),
    queryFn: () => fetchDeck(leadId),
    // La baraja no cambia mientras el usuario la recorre: recargarla a mitad
    // de camino le movería las tarjetas debajo del dedo.
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  const swipe = useMutation({
    mutationFn: (variables: {
      proyectoId: string;
      accion: SwipeAction;
      dwellMs?: number;
      abrioDetalle?: boolean;
      detalleMs?: number;
    }) =>
      postSwipe(leadId, variables.proyectoId, variables.accion, {
        dwellMs: variables.dwellMs,
        abrioDetalle: variables.abrioDetalle,
        detalleMs: variables.detalleMs,
      }),
    onSuccess: (progreso) => {
      setIntentScore(progreso.intentScore);
    },
  });

  const cierre = useMutation({
    mutationFn: (preferenciaContacto?: PreferenciaContacto) =>
      postSummary(leadId, preferenciaContacto),
  });

  const tarjetas = useMemo(() => consulta.data?.tarjetas ?? [], [consulta.data]);

  // Arranca el cronometro de la sesion y de la primera tarjeta al cargar la baraja.
  useEffect(() => {
    if (consulta.data !== undefined && sesionInicioPerf.current === null) {
      const t = ahora();
      sesionInicioPerf.current = t;
      sesionInicioIso.current = new Date().toISOString();
      tarjetaDesde.current = t;
    }
  }, [consulta.data]);

  /** Cierra el intervalo de detalle abierto y devuelve el total acumulado (ms). */
  const cerrarDetalleAbierto = useCallback((t: number): number => {
    if (detalleDesde.current !== null) {
      detalleAcumMs.current += t - detalleDesde.current;
      detalleDesde.current = null;
    }
    return Math.round(detalleAcumMs.current);
  }, []);

  const notificarDetalle = useCallback((abierto: boolean) => {
    if (abierto) {
      detalleDesde.current = ahora();
      detalleUsado.current = true;
    } else if (detalleDesde.current !== null) {
      detalleAcumMs.current += ahora() - detalleDesde.current;
      detalleDesde.current = null;
    }
  }, []);

  const decidir = useCallback(
    (accion: SwipeAction) => {
      const tarjeta = tarjetas[indice];
      if (tarjeta === undefined) return;

      const t = ahora();
      const iso = new Date().toISOString();
      const proyectoId = tarjeta.ficha.proyectoId;
      const dwellMs =
        tarjetaDesde.current !== null ? Math.max(0, Math.round(t - tarjetaDesde.current)) : 0;

      // Detalle: en escritorio el panel esta SIEMPRE visible junto a la tarjeta,
      // asi que se cuenta como visto todo el dwell; en movil solo si abrio la hoja.
      let detalleMs = cerrarDetalleAbierto(t);
      let abrioDetalle = detalleUsado.current;
      if (esDesktop()) {
        abrioDetalle = true;
        detalleMs = Math.max(detalleMs, dwellMs);
      }

      // Vistas granulares: la tarjeta y (si aplica) su detalle.
      vistas.current.push({ leadId, proyectoId, seccion: 'card', dwellMs, ocurridoEn: iso });
      if (abrioDetalle) {
        vistas.current.push({
          leadId,
          proyectoId,
          seccion: 'detalle',
          dwellMs: detalleMs,
          ocurridoEn: iso,
        });
      }

      if (accion === 'like') conteos.current.likes += 1;
      else if (accion === 'favorito') conteos.current.favoritos += 1;
      else conteos.current.passes += 1;

      // El indice avanza YA, sin esperar la red: la tarjeta tiene que salir
      // volando en el mismo gesto o la interaccion se siente rota. Si el POST
      // falla, el backend simplemente no registro ese swipe.
      setIndice((previo) => previo + 1);
      swipe.mutate({ proyectoId, accion, dwellMs, abrioDetalle, detalleMs });

      // Reinicia los cronometros para la siguiente tarjeta.
      tarjetaDesde.current = t;
      detalleAcumMs.current = 0;
      detalleUsado.current = false;
      detalleDesde.current = null;
    },
    [cerrarDetalleAbierto, indice, leadId, swipe, tarjetas],
  );

  /**
   * Arma y envia el lote de telemetria. Idempotente (solo la primera vez) y
   * BLINDADO: se llama desde la limpieza de un efecto y desde `pagehide`, asi
   * que un fallo aqui jamas puede propagarse y romper el desmontaje.
   */
  const flush = useCallback(() => {
    if (enviado.current || sesionInicioPerf.current === null) return;
    enviado.current = true;
    try {
      cerrarDetalleAbierto(ahora());

      const { likes, favoritos, passes } = conteos.current;
      const sesion: EnrichmentSessionSummary = {
        leadId,
        startedAt: sesionInicioIso.current ?? new Date().toISOString(),
        endedAt: new Date().toISOString(),
        totalTarjetas: tarjetas.length,
        decididas: likes + favoritos + passes,
        likes,
        favoritos,
        passes,
        intentScore,
        tiempoTotalMs: Math.max(0, Math.round(ahora() - sesionInicioPerf.current)),
      };

      flushTelemetry({ views: vistas.current, session: sesion });
    } catch {
      // best-effort: la telemetria no puede tumbar el flujo del usuario.
    }
  }, [cerrarDetalleAbierto, intentScore, leadId, tarjetas.length]);

  const cerrar = useCallback(() => {
    cierre.mutate(undefined, {
      onSuccess: () => {
        flush();
        void cliente.invalidateQueries({ queryKey: queryKeys.enrichment.all });
      },
    });
  }, [cierre, cliente, flush]);

  // Envio de respaldo: al abandonar (cerrar pestana, navegar) o al desmontar.
  useEffect(() => {
    const alSalir = (): void => {
      flush();
    };
    window.addEventListener('pagehide', alSalir);
    return () => {
      window.removeEventListener('pagehide', alSalir);
      flush();
    };
  }, [flush]);

  const total = tarjetas.length;
  const restantes = Math.max(0, total - indice);

  return {
    deck: consulta.data,
    cargando: consulta.isPending,
    error: consulta.error,
    indice,
    restantes,
    avance: total === 0 ? 0 : Math.min(1, indice / total),
    terminado: total > 0 && indice >= total,
    intentScore,
    decidir,
    notificarDetalle,
    cerrar,
    guardarPreferenciaContacto: (preferencia: PreferenciaContacto) => {
      cierre.mutate(preferencia);
    },
    preferenciaGuardada: cierre.data?.lead.contacto !== null && cierre.data !== undefined,
    cerrando: cierre.isPending,
    cierreFallo: cierre.isError,
    resumen: cierre.data,
  };
}
