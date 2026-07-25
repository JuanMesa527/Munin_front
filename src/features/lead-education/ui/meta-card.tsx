/**
 * Tarjeta de una meta gamificada (capa ui, F2.2).
 *
 * Metas de ahorro acumulan un monto; el resto (educacion, documentacion,
 * afiliacion) son booleanas: "hecho" o "todavía no". La logica de si eso
 * alcanza para completar la meta es del BACKEND (`trackProgress`), esta
 * tarjeta solo manda el evento y pinta lo que llega.
 */

import { useState, type ReactElement, type SubmitEvent } from 'react';
import type { Meta, RitmoAhorro } from '@contracts';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  DatePicker,
  Field,
  ProgressBar,
} from '@shared/ui';
import { formatRelative } from '@shared/lib/format-date';
import { formatCOP } from '@shared/lib/format-money';

export interface MetaCardProps {
  meta: Meta;
  onRegistrarAhorro: (valor: number) => void;
  onCompletar: () => void;
  /** Solo se llama para metas `tipo: 'ahorro'`; el resto no configura fecha. */
  onConfigurarFechaObjetivo?: ((fechaObjetivoIso: string) => void) | undefined;
  /** Ritmo derivado de `meta.aportes`/`meta.fechaObjetivo` (adenda A10). */
  ritmoAhorro?: RitmoAhorro | undefined;
  isPending: boolean;
}

const TIPO_TIENE_MONTO_COP = new Set<Meta['tipo']>(['ahorro']);
/** Cuantos aportes recientes se listan antes de recortar la tarjeta. */
const MAX_APORTES_VISIBLES = 5;

export function MetaCard({
  meta,
  onRegistrarAhorro,
  onCompletar,
  onConfigurarFechaObjetivo,
  ritmoAhorro,
  isPending,
}: MetaCardProps): ReactElement {
  const [monto, setMonto] = useState('');
  const [fechaObjetivo, setFechaObjetivo] = useState(meta.fechaObjetivo?.slice(0, 10) ?? '');
  const esAhorro = TIPO_TIENE_MONTO_COP.has(meta.tipo);
  const aportesRecientes = [...(meta.aportes ?? [])]
    .sort((a, b) => new Date(b.ocurridoEn).getTime() - new Date(a.ocurridoEn).getTime())
    .slice(0, MAX_APORTES_VISIBLES);

  function registrarAhorro(evento: SubmitEvent<HTMLFormElement>): void {
    evento.preventDefault();
    const valor = Number(monto);
    if (!Number.isFinite(valor) || valor <= 0) return;
    onRegistrarAhorro(valor);
    setMonto('');
  }

  function guardarFechaObjetivo(evento: SubmitEvent<HTMLFormElement>): void {
    evento.preventDefault();
    if (fechaObjetivo.length === 0 || onConfigurarFechaObjetivo === undefined) return;
    // `<input type="date">` entrega `YYYY-MM-DD`; el contrato viaja en
    // IsoDateTime completo, asi que se ancla a medianoche UTC.
    onConfigurarFechaObjetivo(new Date(`${fechaObjetivo}T00:00:00.000Z`).toISOString());
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

        {!meta.completada && esAhorro && onConfigurarFechaObjetivo !== undefined && (
          <form onSubmit={guardarFechaObjetivo} className="mt-3 flex items-end gap-2">
            <div className="flex-1">
              <DatePicker
                label="Fecha objetivo"
                value={fechaObjetivo}
                soloFuturo
                onChange={(valor) => {
                  setFechaObjetivo(valor);
                }}
              />
            </div>
            <Button type="submit" variant="secondary" loading={isPending}>
              Guardar meta
            </Button>
          </form>
        )}

        {esAhorro && aportesRecientes.length > 0 && (
          <ul className="mt-3 flex flex-col gap-1">
            {aportesRecientes.map((aporte) => (
              <li key={aporte.id} className="flex items-center justify-between gap-2 text-xs">
                <span className="font-medium text-text">{formatCOP(aporte.monto)}</span>
                <span className="text-text-muted">{formatRelative(aporte.ocurridoEn)}</span>
              </li>
            ))}
          </ul>
        )}

        {esAhorro && ritmoAhorro !== undefined && (
          <div className="mt-3 border-t border-border pt-3">
            {meta.fechaObjetivo === undefined ? (
              <p className="text-xs text-text-muted">
                Definí una fecha para tu meta para ver si vas a tiempo.
              </p>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs text-text-muted">
                  Ritmo:{' '}
                  <span className="font-semibold text-text">
                    {formatCOP(ritmoAhorro.ritmoMensualPromedio)}/mes
                  </span>
                  {ritmoAhorro.mesesRestantesAlRitmoActual !== null && (
                    <>
                      {' · '}
                      te faltan ~{ritmoAhorro.mesesRestantesAlRitmoActual}{' '}
                      {ritmoAhorro.mesesRestantesAlRitmoActual === 1 ? 'mes' : 'meses'}
                    </>
                  )}
                </p>
                <Badge tone={ritmoAhorro.enRitmoParaFecha === true ? 'success' : 'warning'}>
                  {ritmoAhorro.enRitmoParaFecha === true
                    ? 'Vas a tiempo'
                    : 'Necesitás acelerar el ritmo'}
                </Badge>
              </div>
            )}
          </div>
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
