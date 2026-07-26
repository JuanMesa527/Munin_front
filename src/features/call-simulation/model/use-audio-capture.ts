/**
 * Dictado del closer por push-to-talk. Capa: model..
 *
 * REEMPLAZA a la Web Speech API, que NO es un motor local sino un mando a
 * distancia al servicio en la nube de cada fabricante: Chrome habla con el de
 * Google y funciona, Edge enruta al suyo y en macOS devuelve `network` siempre,
 * Firefox no la implementa. Aqui la unica API del navegador que se usa es la
 * captura de audio, que si es universal; transcribe nuestro backend.
 *
 * POR QUE WEB AUDIO Y NO `MediaRecorder`: `MediaRecorder` produce un
 * CONTENEDOR, y no el mismo en todas partes — WebM/Opus en Chrome, Edge y
 * Firefox, MP4/AAC en Safari. Amazon Transcribe no acepta ninguno de los dos
 * (quiere PCM, OGG-Opus o FLAC), asi que habria que transcodificar en el
 * servidor con ffmpeg. Web Audio entrega las MUESTRAS crudas, iguales en todos
 * los navegadores, y las convertimos a PCM 16-bit aqui mismo: cero
 * transcodificacion y cero dependencia binaria en el backend.
 *
 * El ciclo es deliberadamente de dos tiempos — grabar, y despues transcribir —
 * porque el texto cae en un input EDITABLE. El closer corrige lo que el motor
 * entendio mal antes de enviarle el turno al lead simulado.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { transcribeUtterance } from '../api/call-simulation.api';

export interface AudioCaptureOptions {
  /** Recibe el texto ya transcrito, listo para concatenar al input. */
  onTexto: (texto: string) => void;
  /**
   * Llamada en curso, para que el backend archive este tramo de voz (A14).
   * `null` mientras no haya sesion: el dictado funciona igual, solo que ese
   * audio no queda grabado.
   */
  callId: string | null;
}

export interface AudioCaptureState {
  readonly soportado: boolean;
  readonly grabando: boolean;
  readonly transcribiendo: boolean;
  /** Segundos grabados del tramo en curso. Alimenta el contador de la UI. */
  readonly segundos: number;
  readonly error: string | null;
  iniciar: () => void;
  /** Cierra el tramo y lo manda a transcribir. */
  detenerYTranscribir: () => void;
  /** Descarta el tramo sin transcribir (cambio de opinion, colgar). */
  cancelar: () => void;
  limpiarError: () => void;
}

/**
 * Transcribe acepta 8-48 kHz. 16 kHz es el estandar de voz: por encima solo se
 * paga ancho de banda, porque el habla no lleva informacion util mas arriba.
 */
const SAMPLE_RATE_OBJETIVO = 16000;

/**
 * Corte duro del tramo. Coincide con el tope del DTO del backend: mejor cortar
 * aqui con un aviso que mandar un payload que el servidor va a rechazar.
 */
const MAX_SEGUNDOS = 30;

const ERROR_BLOQUEADO =
  'El navegador bloqueó el micrófono. Ábrelo en el candado de la barra de direcciones → Micrófono → Permitir, y vuelve a intentar.';
const ERROR_SIN_MICRO = 'No se encontró ningún micrófono conectado.';

/**
 * El worklet corre en el hilo de audio y no puede importar nada del bundle, asi
 * que su codigo viaja como texto y se carga desde un blob. Evita tener que
 * publicar un archivo suelto en `public/` y que Vite lo trate como asset.
 *
 * Convierte float32 [-1,1] a int16 con signo, que es exactamente el `pcm` que
 * espera Transcribe. El clamp no es decorativo: un pico por encima de 1.0
 * desborda el entero y suena como un chasquido.
 */
const CODIGO_WORKLET = `
class ColectorPcm extends AudioWorkletProcessor {
  process(inputs) {
    const canal = inputs[0] && inputs[0][0];
    if (canal && canal.length > 0) {
      const pcm = new Int16Array(canal.length);
      for (let i = 0; i < canal.length; i += 1) {
        const muestra = Math.max(-1, Math.min(1, canal[i]));
        pcm[i] = muestra < 0 ? muestra * 0x8000 : muestra * 0x7fff;
      }
      this.port.postMessage(pcm, [pcm.buffer]);
    }
    return true;
  }
}
registerProcessor('colector-pcm', ColectorPcm);
`;

interface RecursosCaptura {
  readonly contexto: AudioContext;
  readonly stream: MediaStream;
  readonly nodo: AudioWorkletNode;
}

function soportaCaptura(): boolean {
  if (typeof window === 'undefined') return false;
  const media = navigator.mediaDevices as MediaDevices | undefined;
  return media !== undefined && typeof window.AudioContext === 'function';
}

/** Une los trozos int16 en un solo buffer y lo pasa a base64. */
function aBase64(trozos: readonly Int16Array[]): string {
  const total = trozos.reduce((suma, trozo) => suma + trozo.length, 0);
  const unido = new Int16Array(total);
  let offset = 0;
  for (const trozo of trozos) {
    unido.set(trozo, offset);
    offset += trozo.length;
  }

  // Se recorre en bloques porque `String.fromCharCode(...miles de args)`
  // desborda la pila de llamadas con audios de pocos segundos.
  const bytes = new Uint8Array(unido.buffer);
  const BLOQUE = 8192;
  let binario = '';
  for (let inicio = 0; inicio < bytes.length; inicio += BLOQUE) {
    binario += String.fromCharCode(...bytes.subarray(inicio, inicio + BLOQUE));
  }
  return btoa(binario);
}

export function useAudioCapture(options: AudioCaptureOptions): AudioCaptureState {
  const [grabando, setGrabando] = useState(false);
  const [transcribiendo, setTranscribiendo] = useState(false);
  const [segundos, setSegundos] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const recursosRef = useRef<RecursosCaptura | null>(null);
  const trozosRef = useRef<Int16Array[]>([]);
  const sampleRateRef = useRef(SAMPLE_RATE_OBJETIVO);
  /** Evita que un `detener` tardio pise a un `cancelar` ya ejecutado. */
  const descartadoRef = useRef(false);

  const onTextoRef = useRef(options.onTexto);
  useEffect(() => {
    onTextoRef.current = options.onTexto;
  }, [options.onTexto]);

  // Igual que el callback: el `callId` cambia cuando la llamada conecta, y el
  // ciclo de captura vive mas que ese render.
  const callIdRef = useRef(options.callId);
  useEffect(() => {
    callIdRef.current = options.callId;
  }, [options.callId]);

  const soportado = soportaCaptura();

  /** Suelta microfono y contexto. Idempotente: se llama desde varios caminos. */
  const liberar = useCallback((): Int16Array[] => {
    const recursos = recursosRef.current;
    recursosRef.current = null;
    const capturado = trozosRef.current;
    trozosRef.current = [];

    if (recursos !== null) {
      recursos.nodo.port.onmessage = null;
      recursos.nodo.disconnect();
      // Apagar las pistas es lo que quita el punto rojo de "grabando" del
      // navegador. Sin esto el closer cree que lo seguimos escuchando.
      for (const pista of recursos.stream.getTracks()) pista.stop();
      void recursos.contexto.close();
    }

    setGrabando(false);
    setSegundos(0);
    return capturado;
  }, []);

  useEffect(() => {
    return () => {
      descartadoRef.current = true;
      liberar();
    };
  }, [liberar]);

  const iniciar = useCallback(() => {
    setError(null);

    if (!soportaCaptura()) {
      setError('Este navegador no puede capturar audio. Escribe tu respuesta.');
      return;
    }
    if (!window.isSecureContext) {
      setError('El micrófono solo funciona en https o en localhost. Escribe tu respuesta.');
      return;
    }
    if (recursosRef.current !== null) return;

    descartadoRef.current = false;
    trozosRef.current = [];

    void (async () => {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true, channelCount: 1 },
        });
      } catch (causa) {
        const nombre = causa instanceof Error ? causa.name : '';
        setError(
          nombre === 'NotFoundError' || nombre === 'DevicesNotFoundError'
            ? ERROR_SIN_MICRO
            : ERROR_BLOQUEADO,
        );
        return;
      }

      // Si el navegador no acepta la frecuencia pedida, se usa la nativa y se
      // le dice al backend cual fue: Transcribe acepta el rango completo, y
      // resamplear a mano seria peor que pagar unos KB de mas.
      let contexto: AudioContext;
      try {
        contexto = new AudioContext({ sampleRate: SAMPLE_RATE_OBJETIVO });
      } catch {
        contexto = new AudioContext();
      }
      sampleRateRef.current = contexto.sampleRate;

      const url = URL.createObjectURL(new Blob([CODIGO_WORKLET], { type: 'text/javascript' }));
      try {
        await contexto.audioWorklet.addModule(url);
      } catch {
        for (const pista of stream.getTracks()) pista.stop();
        void contexto.close();
        setError('No se pudo iniciar la captura de audio en este navegador.');
        return;
      } finally {
        URL.revokeObjectURL(url);
      }

      // El closer pudo cancelar mientras se pedia el permiso.
      if (descartadoRef.current) {
        for (const pista of stream.getTracks()) pista.stop();
        void contexto.close();
        return;
      }

      const nodo = new AudioWorkletNode(contexto, 'colector-pcm');
      nodo.port.onmessage = (evento: MessageEvent<Int16Array>) => {
        trozosRef.current.push(evento.data);
      };
      contexto.createMediaStreamSource(stream).connect(nodo);
      // El worklet no produce salida; conectarlo al destino es lo que lo
      // mantiene corriendo en los navegadores que podan el grafo inactivo.
      nodo.connect(contexto.destination);

      recursosRef.current = { contexto, stream, nodo };
      setGrabando(true);
      setSegundos(0);
    })();
  }, []);

  const cancelar = useCallback(() => {
    descartadoRef.current = true;
    liberar();
  }, [liberar]);

  const detenerYTranscribir = useCallback(() => {
    if (recursosRef.current === null) return;

    const sampleRate = sampleRateRef.current;
    const trozos = liberar();
    const muestras = trozos.reduce((suma, trozo) => suma + trozo.length, 0);

    // Menos de ~0,2 s no es habla, es el rebote del clic. Se descarta sin
    // gastar una llamada a Transcribe (que se cobra por segundo).
    if (muestras < sampleRate / 5) return;

    setTranscribiendo(true);
    void transcribeUtterance({ base64: aBase64(trozos), sampleRate }, callIdRef.current)
      .then((resultado) => {
        if (resultado.texto.trim().length === 0) {
          setError('No se entendió nada. Intenta de nuevo o escribe tu respuesta.');
          return;
        }
        onTextoRef.current(resultado.texto.trim());
      })
      .catch((causa: unknown) => {
        const mensaje = causa instanceof Error ? causa.message : '';
        setError(
          mensaje.length > 0
            ? mensaje
            : 'No pudimos transcribir tu audio. Intenta de nuevo o escribe tu respuesta.',
        );
      })
      .finally(() => {
        setTranscribiendo(false);
      });
  }, [liberar]);

  const detenerRef = useRef(detenerYTranscribir);
  useEffect(() => {
    detenerRef.current = detenerYTranscribir;
  }, [detenerYTranscribir]);

  /**
   * Contador del tramo y corte duro al llegar al tope, en el MISMO intervalo.
   * El corte no puede vivir en un efecto que observe `segundos`: eso es un
   * `setState` sincrono dentro del cuerpo del efecto (renders en cascada).
   * El conteo va en una variable local del intervalo, no en el estado, para
   * que reprogramarlo no dependa del valor que React tenga renderizado.
   */
  useEffect(() => {
    if (!grabando) return undefined;

    let transcurridos = 0;
    const id = window.setInterval(() => {
      transcurridos += 1;
      setSegundos(transcurridos);
      if (transcurridos >= MAX_SEGUNDOS) {
        setError(`El tramo se cortó a los ${String(MAX_SEGUNDOS)} s. Se transcribió lo grabado.`);
        detenerRef.current();
      }
    }, 1000);

    return () => {
      window.clearInterval(id);
    };
  }, [grabando]);

  const limpiarError = useCallback(() => {
    setError(null);
  }, []);

  return {
    soportado,
    grabando,
    transcribiendo,
    segundos,
    error,
    iniciar,
    detenerYTranscribir,
    cancelar,
    limpiarError,
  };
}
