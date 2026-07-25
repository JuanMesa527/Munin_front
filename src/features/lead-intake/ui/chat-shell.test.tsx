/**
 * RED (tasks.md 3.8): chips de respuesta rapida y texto libre son
 * interactivos al mismo tiempo; `ProgressBar` refleja `progreso`.
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { ChatMessage, ConversationStep } from '@contracts';
import { ChatShell } from './chat-shell';

const AHORA = '2026-07-25T14:00:00.000Z';

const PASO: ConversationStep = {
  id: 'paso-afiliacion',
  slot: 'afiliacion',
  tipo: 'pregunta',
  permiteTextoLibre: true,
  quickReplies: [
    { label: 'Sí, soy afiliado', value: 'true' },
    { label: 'No, no soy afiliado', value: 'false' },
  ],
};

const MENSAJES: ChatMessage[] = [
  { id: 'm1', texto: '¿Estás afiliado a Colsubsidio?', quickReplies: PASO.quickReplies, emisor: 'bot', enviadoEn: AHORA },
];

describe('ChatShell', () => {
  it('renderiza chips y texto libre interactivos a la vez, y envia lo que se elige', async () => {
    const user = userEvent.setup();
    const onQuickReply = vi.fn();
    const onFreeText = vi.fn();

    render(
      <ChatShell
        messages={MENSAJES}
        step={PASO}
        progreso={0.12}
        isSending={false}
        onQuickReply={onQuickReply}
        onFreeText={onFreeText}
      />,
    );

    const chip = screen.getByRole('button', { name: 'Sí, soy afiliado' });
    expect(chip).toBeEnabled();
    await user.click(chip);
    expect(onQuickReply).toHaveBeenCalledWith('true');

    const campoTexto = screen.getByRole('textbox');
    expect(campoTexto).toBeEnabled();
    await user.type(campoTexto, 'Sí{enter}');
    expect(onFreeText).toHaveBeenCalledWith('Sí');
  });

  it('la barra de progreso refleja `progreso`', () => {
    render(
      <ChatShell
        messages={MENSAJES}
        step={PASO}
        progreso={0.5}
        isSending={false}
        onQuickReply={vi.fn()}
        onFreeText={vi.fn()}
      />,
    );

    const barra = screen.getByRole('progressbar');
    expect(barra).toHaveAttribute('aria-valuenow', '50');
  });

  it('muestra el indicador de escritura mientras se envia una respuesta', () => {
    render(
      <ChatShell
        messages={MENSAJES}
        step={PASO}
        progreso={0.12}
        isSending
        onQuickReply={vi.fn()}
        onFreeText={vi.fn()}
      />,
    );

    expect(screen.getByRole('status', { name: /escribiendo/i })).toBeInTheDocument();
  });

  it('sin `step` (turno terminal) no muestra chips ni campo de texto libre', () => {
    render(
      <ChatShell
        messages={MENSAJES}
        step={null}
        progreso={1}
        isSending={false}
        onQuickReply={vi.fn()}
        onFreeText={vi.fn()}
      />,
    );

    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.queryByRole('group')).not.toBeInTheDocument();
  });
});
