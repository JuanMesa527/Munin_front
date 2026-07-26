/**
 * RED (tasks.md 4.1): un error de render dentro del boundary muestra un mensaje
 * amable, nunca una pagina en blanco ni el stack.
 */
import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest';
import { ErrorBoundary } from './error-boundary';

function Bomb(): never {
  throw new Error('boom-de-prueba');
}

describe('ErrorBoundary', () => {
  let consoleErrorSpy: MockInstance<typeof console.error>;

  beforeEach(() => {
    // React tambien loguea el error de render por su cuenta; lo silenciamos
    // para no ensuciar la salida del test, no para esconder el comportamiento.
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('muestra un mensaje amable y nunca el stack cuando un hijo lanza al renderizar', () => {
    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>,
    );

    expect(screen.getByText(/algo sali[oó] mal/i)).toBeInTheDocument();
    expect(screen.queryByText('boom-de-prueba')).not.toBeInTheDocument();
    expect(document.body.textContent).not.toContain('at Bomb');
  });

  it('renderiza los hijos normalmente cuando no hay error', () => {
    render(
      <ErrorBoundary>
        <p>todo bien</p>
      </ErrorBoundary>,
    );

    expect(screen.getByText('todo bien')).toBeInTheDocument();
  });
});
