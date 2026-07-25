/**
 * Tarjeta de una meta gamificada (capa ui, F2.2).
 *
 * Metas de ahorro acumulan un monto; el resto (educacion, documentacion,
 * afiliacion) son booleanas: "hecho" o "todavía no". La logica de si eso
 * alcanza para completar la meta es del BACKEND (`trackProgress`), esta
 * tarjeta solo manda el evento y pinta lo que llega.
 */

import { useState, type ReactElement, type SubmitEvent } from 'react';
import type { Meta } from '@contracts';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Field, ProgressBar } from '@shared/ui';
import { formatCOP } from '@shared/lib/format-money';

export interface MetaCardProps {
  meta: Meta;
  onRegistrarAhorro: (valor: number) => void;
  onCompletar: () => void;
  isPending: boolean;
}

const TIPO_TIENE_MONTO_COP = new Set<Meta['tipo']>(['ahorro']);

export function MetaCard({ meta, onRegistrarAhorro, onCompletar, isPending }: MetaCardProps): ReactElement {
  const [monto, setMonto] = useState('');
  const esAhorro = TIPO_TIENE_MONTO_COP.has(meta.tipo);

  function registrarAhorro(evento: SubmitEvent<HTMLFormElement>): void {
    evento.preventDefault();
    const valor = Number(monto);
    if (!Number.isFinite(valor) || valor <= 0) return;
    onRegistrarAhorro(valor);
    setMonto('');
  }

  return (
    <Card id={`meta-${meta.id}`} accent={meta.completada ? 'success' : 'none'}>
      <CardHeader>
        <div>
          <CardTitle>{meta.titulo}</CardTitle>
          <p className="mt-1 text-sm text-text-muted">{meta.descripcion}</p>
        </div>
        {meta.completada && <Badge tone="success">Completada</Badge>}
      </CardHeader>

      <CardContent>
        {esAhorro && (
          <ProgressBar
            value={meta.alcanzado}
            max={meta.objetivo}
            label={`${formatCOP(meta.alcanzado)} de ${formatCOP(meta.objetivo)}`}
            tone="accent"
          />
        )}

        {!meta.completada && esAhorro && (
          <form onSubmit={registrarAhorro} className="mt-3 flex items-end gap-2">
            <div className="flex-1">
              <Field
                label="Registrar un aporte"
                type="number"
                min={1}
                inputMode="numeric"
                placeholder="Ej. 200000"
                value={monto}
                onChange={(evento) => {
                  setMonto(evento.target.value);
                }}
              />
            </div>
            <Button type="submit" variant="accent" loading={isPending}>
              Registrar
            </Button>
          </form>
        )}

        {!meta.completada && !esAhorro && (
          <Button
            variant="accent"
            className="mt-1"
            loading={isPending}
            onClick={onCompletar}
          >
            Ya lo hice
          </Button>
        )}

        <p className="mt-3 text-xs text-text-subtle">+{meta.puntos} puntos al completarla</p>
      </CardContent>
    </Card>
  );
}
