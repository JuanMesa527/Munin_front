/**
 * "Tips para avanzar más rápido" (capa ui, F2.2). Fila horizontal del mock.
 */

import { ArrowRight, CalendarDays, CheckCircle2, Target, Users } from 'lucide-react';
import type { ReactElement, ReactNode } from 'react';
import { Card } from '@shared/ui';
import { cn } from '@shared/lib/cn';

interface Tip {
  icono: ReactNode;
  titulo: string;
  clases: string;
}

const TIPS: readonly Tip[] = [
  {
    icono: <CalendarDays aria-hidden="true" className="size-5" />,
    titulo: 'Estudia un poco cada día',
    clases: 'bg-info-soft text-info',
  },
  {
    icono: <Target aria-hidden="true" className="size-5" />,
    titulo: 'Resuelve tus dudas',
    clases: 'bg-brand-100 text-brand-800',
  },
  {
    icono: <CheckCircle2 aria-hidden="true" className="size-5" />,
    titulo: 'Completa las lecciones',
    clases: 'bg-success-soft text-success',
  },
  {
    icono: <Users aria-hidden="true" className="size-5" />,
    titulo: 'Habla con tu asesor',
    clases: 'bg-accent-100 text-accent-700',
  },
];

export function TipsRow(): ReactElement {
  return (
    <section aria-labelledby="tips-titulo">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 id="tips-titulo" className="text-base font-bold text-text">
          Tips para avanzar más rápido
        </h2>
        <button
          type="button"
          aria-label="Ver más tips"
          className="focus-ring hidden size-9 items-center justify-center rounded-full border border-border bg-surface text-text-muted shadow-sm hover:bg-surface-3 sm:inline-flex"
        >
          <ArrowRight aria-hidden="true" className="size-4" />
        </button>
      </div>

      <Card padding="md" className="shadow-card">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TIPS.map((tip) => (
            <li key={tip.titulo} className="flex items-center gap-3">
              <span
                className={cn(
                  'flex size-11 shrink-0 items-center justify-center rounded-full',
                  tip.clases,
                )}
              >
                {tip.icono}
              </span>
              <p className="text-sm leading-snug font-semibold text-text">{tip.titulo}</p>
            </li>
          ))}
        </ul>
      </Card>
    </section>
  );
}
