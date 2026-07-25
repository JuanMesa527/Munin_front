/**
 * Tarjetas de resumen de la cola (F3).
 *
 * Cuatro cifras que contestan lo primero que pregunta un comercial al abrir:
 * cuantos tengo, que tan buenos son, cuantos son afiliados (regla 90/10) y
 * cuantos veniamos de perder y recuperamos por nutricion.
 */

import type { ReactElement } from 'react';
import { cn } from '@shared/lib/cn';
import type { QueueStats } from '../model/lead-queue';

type TileTone = 'ink' | 'plain' | 'signal';

interface TileProps {
  label: string;
  value: string;
  hint: string;
  tone: TileTone;
}

const TONO: Record<TileTone, { caja: string; label: string; hint: string }> = {
  ink: {
    caja: 'bg-console-ink text-console-paper',
    label: 'text-console-signal',
    hint: 'text-console-edge',
  },
  plain: {
    caja: 'bg-console-surface border border-console-line text-console-ink',
    label: 'text-console-mute',
    hint: 'text-console-body',
  },
  signal: {
    caja: 'bg-console-signal-soft border border-console-signal text-console-ink',
    label: 'text-console-signal-deep',
    hint: 'text-console-body',
  },
};

function StatTile({ label, value, hint, tone }: TileProps): ReactElement {
  const t = TONO[tone];

  return (
    <div className={cn('rounded-[18px] px-6 py-[22px]', t.caja)}>
      <div
        className={cn(
          'mb-[10px] font-mono text-[11px] font-bold tracking-[0.12em] uppercase',
          t.label,
        )}
      >
        {label}
      </div>
      <div className="text-[40px] leading-none font-bold tracking-[-0.03em] tabular-nums">
        {value}
      </div>
      <div className={cn('mt-2 text-[13px]', t.hint)}>{hint}</div>
    </div>
  );
}

export interface QueueStatsPanelProps {
  stats: QueueStats;
}

export function QueueStatsPanel({ stats }: QueueStatsPanelProps): ReactElement {
  return (
    <div className="mb-[30px] grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
      <StatTile
        tone="ink"
        label="Viables en cola"
        value={String(stats.total)}
        hint="listos para contactar"
      />
      <StatTile
        tone="plain"
        label="Score promedio"
        value={String(stats.avgScore)}
        hint="calibrado con 4.142 compras reales"
      />
      <StatTile
        tone="plain"
        label="Afiliados"
        value={`${String(stats.pctAfiliados)}%`}
        hint="margen de la regla 90/10 sano"
      />
      <StatTile
        tone="signal"
        label="Recuperados"
        value={String(stats.nutridos)}
        hint="eran no viables y se nutrieron"
      />
    </div>
  );
}
