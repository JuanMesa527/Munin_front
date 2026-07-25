import { describe, expect, it } from 'vitest';
import type { ContenidoEducativo } from '@contracts';
import { resolverPasoInicial } from './use-lesson-reader';

const CONTENIDOS: readonly ContenidoEducativo[] = [
  { id: 'cont-descubrir-a', etapa: 'descubrir', titulo: 'A', cuerpo: '...', tipoContenido: 'concepto' },
  { id: 'cont-descubrir-b', etapa: 'descubrir', titulo: 'B', cuerpo: '...', tipoContenido: 'concepto' },
  { id: 'cont-capacidad-a', etapa: 'capacidad', titulo: 'C', cuerpo: '...', tipoContenido: 'concepto' },
];

describe('resolverPasoInicial', () => {
  it('sin contenidoId arranca en el primer paso', () => {
    expect(resolverPasoInicial(CONTENIDOS, 'descubrir')).toBe(0);
  });

  it('resuelve el índice del contenido dentro de SU etapa, no del catálogo completo', () => {
    expect(resolverPasoInicial(CONTENIDOS, 'descubrir', 'cont-descubrir-b')).toBe(1);
  });

  it('ignora contenidos de otras etapas al calcular el índice', () => {
    expect(resolverPasoInicial(CONTENIDOS, 'capacidad', 'cont-capacidad-a')).toBe(0);
  });

  it('cae al primer paso si el contenidoId no existe en esa etapa', () => {
    expect(resolverPasoInicial(CONTENIDOS, 'descubrir', 'no-existe')).toBe(0);
  });

  it('cae al primer paso si el contenidoId pertenece a otra etapa', () => {
    expect(resolverPasoInicial(CONTENIDOS, 'descubrir', 'cont-capacidad-a')).toBe(0);
  });
});
