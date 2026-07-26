/**
 * La tabla de rutas monta la portada de roles en `/`, el flujo del cliente en
 * `/cliente` (F1 → F2.1/F2.2, via `ClientFlowPage`), `/politica-de-datos`, y
 * las rutas del closer bajo `/closer/*` detras de `CloserGuard`.
 * Post-integracion F1+F2.1: el arbol ya NO es minimo — incluye la consola
 * comercial (F3/F4).
 */
import { describe, expect, it } from 'vitest';
import type { RouteObject } from 'react-router';
import { router } from './index';

/** Aplana el arbol de rutas recolectando todos los `path`, incluidos los hijos. */
function pathsDe(rutas: readonly RouteObject[]): string[] {
  return rutas.flatMap((ruta) => [
    ...(ruta.path === undefined ? [] : [ruta.path]),
    ...('children' in ruta && ruta.children ? pathsDe(ruta.children) : []),
  ]);
}

describe('app routes', () => {
  const paths = pathsDe(router.routes);

  it('monta la portada, el flujo del cliente y la política de datos', () => {
    expect(paths).toContain('/');
    expect(paths).toContain('/cliente');
    expect(paths).toContain('/politica-de-datos');
  });

  it('monta las rutas del closer (F3/F4) tras la integración', () => {
    expect(paths).toContain('/closer/login');
    expect(paths).toContain('/closer');
    expect(paths).toContain('/closer/leads/:leadId');
  });

  it('tiene un catch-all 404', () => {
    expect(paths).toContain('*');
  });
});
