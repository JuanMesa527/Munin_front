/**
 * Tarjeta de microlearning curado (capa ui, F2.2).
 *
 * Contenido DETERMINISTA (viene del backend, no de un LLM en vivo): la demo
 * es autogestionada y no depende de red ni de una API key.
 *
 * Clickable: abre el lector paso a paso (`LessonReaderModal`) en la lección
 * exacta que se tocó, en vez de mostrar el `cuerpo` truncado y pasivo.
 */

import type { ReactElement } from 'react';
import type { ContenidoEducativo, EtapaId } from '@contracts';
import { Badge, Card, CardContent, CardHeader, CardTitle } from '@shared/ui';
import { ETIQUETA_POR_TIPO, ICONO_POR_TIPO } from '../model/contenido-tipo';

export interface ContenidoEducativoCardProps {
  contenido: ContenidoEducativo;
  onAbrir: (etapaId: EtapaId, contenidoId: string) => void;
}

export function ContenidoEducativoCard({
  contenido,
  onAbrir,
}: ContenidoEducativoCardProps): ReactElement {
  return (
    <Card padding="sm" interactive className="p-0">
      <button
        type="button"
        onClick={() => {
          onAbrir(contenido.etapa, contenido.id);
        }}
        className="focus-ring w-full rounded-card p-3 text-left hover:bg-surface-2"
      >
        <CardHeader>
          <CardTitle className="text-sm">{contenido.titulo}</CardTitle>
          <Badge tone="neutral" size="sm" icon={ICONO_POR_TIPO[contenido.tipoContenido]}>
            {ETIQUETA_POR_TIPO[contenido.tipoContenido]}
          </Badge>
        </CardHeader>
        <CardContent>{contenido.cuerpo}</CardContent>
      </button>
    </Card>
  );
}
