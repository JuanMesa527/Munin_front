/**
 * Cubre el patrón click-to-play: miniatura primero, iframe de YouTube recién
 * después del click (nunca al montar).
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { LessonVideoPlayer } from './lesson-video-player';

const VIDEO_ID = 'dQw4w9WgXcQ';
const TITULO = 'Cómo funciona el SFV';

describe('LessonVideoPlayer', () => {
  it('muestra la miniatura y el botón de play, sin iframe, al montar', () => {
    render(<LessonVideoPlayer videoId={VIDEO_ID} titulo={TITULO} />);

    expect(
      screen.getByRole('button', { name: `Reproducir video: ${TITULO}` }),
    ).toBeInTheDocument();
    expect(screen.getByAltText(TITULO)).toHaveAttribute(
      'src',
      `https://i.ytimg.com/vi/${VIDEO_ID}/hqdefault.jpg`,
    );
    expect(screen.queryByTitle(TITULO)).not.toBeInTheDocument();
  });

  it('monta el iframe de youtube-nocookie recién después del click', async () => {
    const user = userEvent.setup();
    render(<LessonVideoPlayer videoId={VIDEO_ID} titulo={TITULO} />);

    await user.click(screen.getByRole('button', { name: `Reproducir video: ${TITULO}` }));

    const iframe = await screen.findByTitle(TITULO);
    expect(iframe).toHaveAttribute(
      'src',
      `https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1`,
    );
  });
});
