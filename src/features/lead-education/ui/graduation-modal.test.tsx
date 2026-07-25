/**
 * Cubre la celebración al graduarse del carril de nutrición (adenda F2.2):
 * confetti con los 3 colores de marca al abrirse, y el handoff a F2.1 recién
 * al confirmar — nunca antes.
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import confetti from 'canvas-confetti';
import { GraduationModal } from './graduation-modal';

vi.mock('canvas-confetti', () => ({ default: vi.fn() }));

describe('GraduationModal', () => {
  it('no dispara confetti ni se muestra mientras está cerrado', () => {
    render(<GraduationModal open={false} onVerProyectos={vi.fn()} />);

    expect(confetti).not.toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('dispara confetti con los 3 colores de marca al abrirse', () => {
    render(<GraduationModal open onVerProyectos={vi.fn()} />);

    expect(confetti).toHaveBeenCalledWith(
      expect.objectContaining({ colors: ['#ffd000', '#0067a3', '#2e9e4f'] }),
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('llama a onVerProyectos solo cuando el lead confirma', async () => {
    const user = userEvent.setup();
    const onVerProyectos = vi.fn();
    render(<GraduationModal open onVerProyectos={onVerProyectos} />);

    expect(onVerProyectos).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Ver proyectos' }));

    expect(onVerProyectos).toHaveBeenCalledTimes(1);
  });
});
