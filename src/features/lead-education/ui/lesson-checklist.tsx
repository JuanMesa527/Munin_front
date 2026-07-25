/**
 * Checklist marcable dentro de una lección (capa ui, F2.2).
 *
 * Estado SOLO de esta sesión de lectura (no se persiste ni manda al backend):
 * el objetivo es que la persona repase la lista marcando lo que ya tiene, no
 * llevar un registro — para eso ya existe `meta-doc`/`MetaCard`.
 */

import { useId, useState, type ReactElement } from 'react';
import { Card } from '@shared/ui';
import { cn } from '@shared/lib/cn';

export interface LessonChecklistProps {
  items: string[];
}

export function LessonChecklist({ items }: LessonChecklistProps): ReactElement | null {
  const idBase = useId();
  const [marcados, setMarcados] = useState<ReadonlySet<number>>(new Set());

  if (items.length === 0) return null;

  function alternar(indice: number): void {
    setMarcados((actual) => {
      const siguiente = new Set(actual);
      if (siguiente.has(indice)) siguiente.delete(indice);
      else siguiente.add(indice);
      return siguiente;
    });
  }

  return (
    <Card className="shadow-card">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-bold text-text">Repasá la lista</p>
        <p className="text-xs text-text-subtle">
          {marcados.size} de {items.length}
        </p>
      </div>

      <ul className="mt-3 flex flex-col gap-2">
        {items.map((item, indice) => {
          const id = `${idBase}-${String(indice)}`;
          const marcado = marcados.has(indice);
          return (
            <li key={item} className="flex items-start gap-2.5">
              <input
                id={id}
                type="checkbox"
                checked={marcado}
                onChange={() => {
                  alternar(indice);
                }}
                className="focus-ring mt-0.5 size-5 shrink-0 rounded-sm accent-brand-600"
              />
              <label
                htmlFor={id}
                className={cn(
                  'text-sm leading-snug text-text',
                  marcado && 'text-text-subtle line-through',
                )}
              >
                {item}
              </label>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
