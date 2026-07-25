/**
 * Reproductor de video de YouTube para pasos de lección (capa ui, F2.2).
 *
 * Click-to-play, no autoload: al montar solo se pide la miniatura
 * (`i.ytimg.com`), nunca el iframe de YouTube. El iframe (con sus cookies y
 * tracking de terceros) recién se monta cuando la persona hace click en el
 * botón de play — así abrir una lección no dispara tráfico de YouTube, ni
 * agrega peso de red dentro de un modal que ya está animando.
 *
 * `youtube-nocookie.com` (modo privacy-enhanced) en vez de `youtube.com`:
 * menos cookies de terceros antes de que la persona decida reproducir.
 *
 * Animación: mismo patrón que `lesson-reader-modal.tsx`
 * (`motion/react` + `useReducedMotion`, transición corta al intercambiar
 * miniatura por iframe).
 */

import { Play } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useState, type ReactElement } from 'react';
import { Skeleton } from '@shared/ui';
import { cn } from '@shared/lib/cn';

export interface LessonVideoPlayerProps {
  videoId: string;
  /** Usado como `title` accesible del iframe y en el `aria-label` del botón de play. */
  titulo: string;
}

export function LessonVideoPlayer({ videoId, titulo }: LessonVideoPlayerProps): ReactElement {
  const [reproduciendo, setReproduciendo] = useState(false);
  const [miniaturaCargada, setMiniaturaCargada] = useState(false);
  const reducirMovimiento = useReducedMotion() ?? false;

  return (
    <div className="aspect-video overflow-hidden rounded-card border border-border bg-surface-3 shadow-card">
      <AnimatePresence mode="wait" initial={false}>
        {reproduciendo ? (
          <motion.iframe
            key="iframe"
            src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`}
            title={titulo}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
            className="size-full border-0"
            initial={reducirMovimiento ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.24 }}
          />
        ) : (
          <motion.div
            key="miniatura"
            className="relative size-full"
            initial={reducirMovimiento ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.24 }}
          >
            {!miniaturaCargada && (
              <Skeleton variant="block" className="absolute inset-0 size-full" />
            )}

            <img
              src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
              alt={titulo}
              loading="lazy"
              onLoad={() => {
                setMiniaturaCargada(true);
              }}
              className={cn(
                'size-full object-cover transition-opacity duration-200',
                miniaturaCargada ? 'opacity-100' : 'opacity-0',
              )}
            />

            {/* Scrim oscuro: da contraste al botón de play sobre cualquier foto,
                mismo recurso que el hero de `onboarding-welcome-modal.tsx`. */}
            <div aria-hidden="true" className="absolute inset-0 bg-ink/30" />

            <button
              type="button"
              onClick={() => {
                setReproduciendo(true);
              }}
              aria-label={`Reproducir video: ${titulo}`}
              className="focus-ring absolute inset-0 flex items-center justify-center"
            >
              <span className="flex size-14 items-center justify-center rounded-full bg-accent-600 text-white shadow-pop ring-4 ring-white/30">
                <Play aria-hidden="true" className="size-6 fill-current" />
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
