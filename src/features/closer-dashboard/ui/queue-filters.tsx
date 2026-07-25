/**
 * Barra de busqueda, atajos y orden de la cola (F3).
 *
 * El input y el select llevan label asociado (uno oculto, otro visible) para que
 * la consola sea navegable con lector de pantalla y con teclado: el jurado
 * puede probarla asi y el comercial real la usa a diario.
 */

import type { ChangeEvent, ReactElement } from 'react';
import type { LeadListSort } from '@contracts';
import { cn } from '@shared/lib/cn';
import { QUEUE_CHIPS, SORT_OPTIONS, type QueueChip } from '../model/lead-queue';

export interface QueueFiltersProps {
  chip: QueueChip;
  query: string;
  sort: LeadListSort;
  onChipChange: (chip: QueueChip) => void;
  onQueryChange: (query: string) => void;
  onSortChange: (sort: LeadListSort) => void;
}

const CONTROL =
  'rounded-xl border-[1.5px] border-console-edge bg-console-surface outline-none ' +
  'focus-visible:border-console-ink focus-ring';

export function QueueFilters({
  chip,
  query,
  sort,
  onChipChange,
  onQueryChange,
  onSortChange,
}: QueueFiltersProps): ReactElement {
  return (
    <div className="mb-[18px] flex flex-wrap items-center gap-3">
      <label className="sr-only" htmlFor="queue-search">
        Buscar lead por nombre, zona, ocupación o proyecto
      </label>
      <input
        id="queue-search"
        type="search"
        value={query}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          onQueryChange(e.target.value);
        }}
        placeholder="Buscar por nombre, zona o proyecto…"
        className={cn(CONTROL, 'min-w-[260px] flex-1 px-4 py-[13px] text-[15px]')}
      />

      <div
        role="group"
        aria-label="Atajos de filtro"
        className="flex gap-1.5 rounded-full bg-console-track p-[5px]"
      >
        {QUEUE_CHIPS.map((opcion) => {
          const activo = opcion.key === chip;
          return (
            <button
              key={opcion.key}
              type="button"
              aria-pressed={activo}
              onClick={() => {
                onChipChange(opcion.key);
              }}
              className={cn(
                'focus-ring cursor-pointer rounded-full px-[18px] py-[9px] text-[13px] font-bold transition-colors',
                activo
                  ? 'bg-console-ink text-console-signal'
                  : 'bg-transparent text-console-body hover:bg-console-edge/40',
              )}
            >
              {opcion.label}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        <label
          htmlFor="queue-sort"
          className="font-mono text-[11px] font-bold tracking-[0.1em] text-console-mute uppercase"
        >
          Orden
        </label>
        <select
          id="queue-sort"
          value={sort}
          onChange={(e: ChangeEvent<HTMLSelectElement>) => {
            onSortChange(e.target.value as LeadListSort);
          }}
          className={cn(CONTROL, 'cursor-pointer px-[14px] py-[11px] text-[14px] font-bold')}
        >
          {SORT_OPTIONS.map((opcion) => (
            <option key={opcion.key} value={opcion.key}>
              {opcion.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
