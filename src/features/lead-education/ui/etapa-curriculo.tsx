/**
 * Currículo ordenado de una etapa (capa ui, F2.2).
 *
 * Reemplaza la grilla pasiva de `ContenidoEducativoCard` en la pantalla
 * "Mi camino": una lista ORDENADA de lecciones, cada una clickable, que abre
 * el lector paso a paso (`LessonReaderModal`) en esa lección exacta.
 *
 * Estado de dos baldes nada más (completada / en progreso), reusando el
 * mismo lenguaje visual de círculo+check que `CirculoEtapa` en
 * `camino-a-mi-hogar.tsx` — no se inventa un vocabulario visual nuevo.
 */

import { Check } from 'lucide-react';
import type { ReactElement } from 'react';
import type { ContenidoEducativo, Meta } from '@contracts';
import { Badge, Card, CardHeader, CardTitle } from '@shared/ui';
import { cn } from '@shared/lib/cn';
import type { EtapaCopy } from '../model/etapa-copy';
import { ETIQUETA_POR_TIPO, ICONO_POR_TIPO } from '../model/contenido-tipo';

export interface EtapaCurriculoProps {
  etapaCopy: EtapaCopy;
  contenidos: readonly ContenidoEducativo[];
  metaEducativa?: Meta | undefined;
  onAbrirLector: (contenidoId?: string) => void;
}

export function EtapaCurriculo({
  etapaCopy,
  contenidos,
  metaEducativa,
  onAbrirLector,
}: EtapaCurriculoProps): ReactElement {
  const completada = metaEducativa?.completada ?? false;
  // Currículo adaptativo: una meta opcional no bloquea nada, así que no tiene
  // sentido mostrarla como "pendiente" — se lo decimos directo.
  const esOpcional = metaEducativa?.opcional === true && !completada;
  const Icono = etapaCopy.icono;

  return (
    <Card className="shadow-card">
      <CardHeader className="items-center">
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className={cn(
              'flex size-10 shrink-0 items-center justify-center rounded-full',
              completada ? 'bg-brand text-ink' : 'bg-accent-600 text-white',
            )}
          >
            {completada ? <Check className="size-5" strokeWidth={3} /> : <Icono className="size-5" />}
          </span>
          <div className="min-w-0">
            <CardTitle>{etapaCopy.titulo}</CardTitle>
            <p className="text-xs text-text-muted">
              {contenidos.length} {contenidos.length === 1 ? 'lección' : 'lecciones'}
            </p>
          </div>
        </div>
        <Badge tone={completada ? 'success' : esOpcional ? 'neutral' : 'accent'} size="sm">
          {completada ? 'Completada' : esOpcional ? 'No hace falta para ti' : 'En progreso'}
        </Badge>
      </CardHeader>

      <ol className="flex flex-col divide-y divide-border">
        {contenidos.map((contenido, indice) => (
          <li key={contenido.id}>
            <button
              type="button"
              onClick={() => {
                onAbrirLector(contenido.id);
              }}
              className="focus-ring flex w-full items-center gap-3 rounded-card px-1 py-3 text-left hover:bg-surface-2"
            >
              <span
                aria-hidden="true"
                className="flex size-7 shrink-0 items-center justify-center rounded-full bg-surface-3 text-xs font-bold text-text-muted"
              >
                {indice + 1}
              </span>
              <span className="min-w-0 flex-1 truncate text-sm font-semibold text-text">
                {contenido.titulo}
              </span>
              <Badge tone="neutral" size="sm" icon={ICONO_POR_TIPO[contenido.tipoContenido]}>
                {ETIQUETA_POR_TIPO[contenido.tipoContenido]}
              </Badge>
            </button>
          </li>
        ))}
      </ol>
    </Card>
  );
}
