/**
 * Reproduce el audio de la replica del lead simulado. Capa: model.
 *
 * `CallTurn.audio` es `null` cuando `SPEECH_PROVIDER=none` o Polly fallo: este
 * hook simplemente no reproduce nada en ese caso, sin marcar error (spec
 * call-simulation-overlay, "Audio Playback Failure Falls Back to Text Display").
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type { CallTurnAudio } from '@contracts';

export interface AudioPlaybackState {
  readonly hablando: boolean;
  readonly silenciado: boolean;
  reproducir: (audio: CallTurnAudio | null) => void;
  alternarSilencio: () => void;
}

export function useAudioPlayback(): AudioPlaybackState {
  const [hablando, setHablando] = useState(false);
  const [silenciado, setSilenciado] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const silenciadoRef = useRef(false);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  const reproducir = useCallback((audio: CallTurnAudio | null) => {
    if (audio === null || silenciadoRef.current) return;

    audioRef.current?.pause();
    const elemento = new Audio(`data:${audio.contentType};base64,${audio.base64}`);
    audioRef.current = elemento;
    elemento.onplay = () => {
      setHablando(true);
    };
    elemento.onended = () => {
      setHablando(false);
    };
    elemento.onerror = () => {
      // Un MP3 corrupto o un navegador que no lo soporta: la UI ya tiene el
      // texto de la replica, asi que esto degrada en silencio.
      setHablando(false);
    };
    void elemento.play().catch(() => {
      setHablando(false);
    });
  }, []);

  const alternarSilencio = useCallback(() => {
    setSilenciado((previo) => {
      const siguiente = !previo;
      silenciadoRef.current = siguiente;
      if (siguiente) {
        audioRef.current?.pause();
        setHablando(false);
      }
      return siguiente;
    });
  }, []);

  return { hablando, silenciado, reproducir, alternarSilencio };
}
