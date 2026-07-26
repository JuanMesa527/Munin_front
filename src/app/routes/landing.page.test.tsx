/**
 * La portada tiene UN trabajo: que quien llega pueda entrar por cualquiera de
 * los dos carriles. Si un `to` se rompe en un refactor, la demo entera queda
 * sin puerta de entrada y nada mas lo detecta — el resto de tests montan las
 * pantallas directas, sin pasar por aqui.
 *
 * No se testea el diseno (colores, aurora, bifurcacion): eso cambia a
 * proposito y un test que lo fije solo estorba.
 */

import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { LandingPage } from './landing.page';

function renderizar() {
  const router = createMemoryRouter([{ path: '/', element: <LandingPage /> }], {
    initialEntries: ['/'],
  });
  return render(<RouterProvider router={router} />);
}

describe('LandingPage', () => {
  it('lleva al flujo del cliente', () => {
    renderizar();
    expect(screen.getByRole('link', { name: /Empezar la conversación/u })).toHaveAttribute(
      'href',
      '/cliente',
    );
  });

  it('lleva a la consola del closer', () => {
    renderizar();
    expect(screen.getByRole('link', { name: /Abrir la consola/u })).toHaveAttribute(
      'href',
      '/closer',
    );
  });

  it('deja la puerta como unica entrada a la consola', () => {
    renderizar();
    // La pildora "Consola closer" de la cabecera se quito a proposito: la
    // eleccion de rol pasa por las dos puertas y solo por ahi. Si vuelve a
    // aparecer un segundo atajo a /closer, que sea una decision explicita.
    const aConsola = screen
      .getAllByRole('link')
      .filter((enlace) => enlace.getAttribute('href') === '/closer');
    expect(aConsola).toHaveLength(1);
  });

  it('enlaza la política de tratamiento de datos', () => {
    renderizar();
    expect(screen.getByRole('link', { name: /Leer la política/u })).toHaveAttribute(
      'href',
      '/politica-de-datos',
    );
  });
});
