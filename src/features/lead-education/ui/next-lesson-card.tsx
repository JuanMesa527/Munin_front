/**
 * Lección destacada del mock (capa ui, F2.2): tarjeta azul con CTA Continuar.
 *
 * Prefiere un `ContenidoEducativo` de la etapa activa; si no hay, cae a la
 * meta pendiente. Las etiquetas "Video" / "Interactivo" son presentacion del
 * mock — el contenido sigue siendo curado y determinista.
 */

import { ArrowRight, BookOpen, Sparkles } from 'lucide-react';
import type { ReactElement } from 'react';
import type { ContenidoEducativo, Meta } from '@contracts';
import { Button } from '@shared/ui';

export interface NextLessonCardProps {
  meta: Meta;
  contenido?: ContenidoEducativo | undefined;
  ctaLabel: string;
  onContinuar: () => void;
  isPending: boolean;
}

export function NextLessonCard({
  meta,
  contenido,
  ctaLabel,
  onContinuar,
  isPending,
}: NextLessonCardProps): ReactElement {
  const titulo = contenido?.titulo ?? meta.titulo;

  return (
    <article className="relative flex min-h-[14rem] flex-col overflow-hidden rounded-card bg-accent-600 p-5 text-white shadow-pop sm:p-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-6 -bottom-8 size-40 rounded-full bg-accent-500/50 blur-2xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-4 right-4 flex size-24 items-center justify-center rounded-2xl bg-white/10 shadow-inner backdrop-blur-sm"
      >
        <BookOpen className="size-10" strokeWidth={1.5} />
      </div>

      <div className="relative z-10 flex flex-1 flex-col">
        <h3 className="max-w-[16rem] font-display text-xl leading-snug font-bold sm:text-2xl">
          {titulo}
        </h3>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-pill bg-white/15 px-2.5 py-1 text-[0.6875rem] font-semibold">
            <Sparkles aria-hidden="true" className="size-3" />
            Lectura interactiva
          </span>
        </div>

        <div className="mt-auto pt-6">
          <Button
            variant="secondary"
            className="border-transparent bg-white text-accent-800 hover:bg-white/90"
            iconRight={<ArrowRight aria-hidden="true" className="size-4" />}
            loading={isPending}
            onClick={onContinuar}
          >
            {ctaLabel}
          </Button>
        </div>
      </div>
    </article>
  );
}
