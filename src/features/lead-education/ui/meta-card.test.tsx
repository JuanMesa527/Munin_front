/**
 * Cubre la configuracion de "fecha objetivo" con el `DatePicker` propio (ya no
 * el `<input type="date">` nativo): abrir el calendario, elegir un dia futuro
 * y confirmar que el ISO que llega a `onConfigurarFechaObjetivo` es el mismo
 * contrato que antes esperaba el backend (`YYYY-MM-DDT00:00:00.000Z`).
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { Meta } from '@contracts';
import { MetaCard } from './meta-card';

const META_AHORRO: Meta = {
  id: 'meta-1',
  titulo: 'Ahorra para tu cuota inicial',
  descripcion: 'Junta el 30% del precio de tu vivienda',
  tipo: 'ahorro',
  objetivo: 10_000_000,
  alcanzado: 2_000_000,
  completada: false,
  puntos: 100,
  badgeId: null,
};

const formatoDiaCompleto = new Intl.DateTimeFormat('es-CO', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

function fechaEnMesSiguiente(dia: number): Date {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  return new Date(hoy.getFullYear(), hoy.getMonth() + 1, dia);
}

function claveIso(fecha: Date): string {
  const ano = String(fecha.getFullYear());
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

describe('MetaCard — fecha objetivo', () => {
  it('abre el calendario propio, elige un dia futuro y dispara el ISO esperado', async () => {
    const user = userEvent.setup();
    const onConfigurarFechaObjetivo = vi.fn();

    render(
      <MetaCard
        meta={META_AHORRO}
        onRegistrarAhorro={vi.fn()}
        onCompletar={vi.fn()}
        onConfigurarFechaObjetivo={onConfigurarFechaObjetivo}
        isPending={false}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Fecha objetivo' }));
    await user.click(screen.getByRole('button', { name: 'Mes siguiente' }));

    const objetivo = fechaEnMesSiguiente(15);
    await user.click(screen.getByRole('button', { name: formatoDiaCompleto.format(objetivo) }));

    await user.click(screen.getByRole('button', { name: 'Guardar meta' }));

    expect(onConfigurarFechaObjetivo).toHaveBeenCalledWith(
      new Date(`${claveIso(objetivo)}T00:00:00.000Z`).toISOString(),
    );
  });

  it('no deja elegir un dia pasado del mes actual', async () => {
    const user = userEvent.setup();
    const hoy = new Date();

    // Este caso solo aplica si hoy no es el dia 1 del mes (si lo es, no hay dias pasados que probar).
    if (hoy.getDate() === 1) return;

    render(
      <MetaCard
        meta={META_AHORRO}
        onRegistrarAhorro={vi.fn()}
        onCompletar={vi.fn()}
        onConfigurarFechaObjetivo={vi.fn()}
        isPending={false}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Fecha objetivo' }));

    const ayer = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - 1);
    const diaPasado = screen.getByRole('button', { name: formatoDiaCompleto.format(ayer) });
    expect(diaPasado).toBeDisabled();
  });
});
