/**
 * Tests de como se LEE un porcentaje de afinidad.
 *
 * Lo que se protege aqui no es aritmetica -- el porcentaje ya viene calculado
 * del backend -- sino la promesa del glass-box: que el numero nunca aparezca
 * afirmando mas de lo que se midio.
 */

import { describe, expect, it } from 'vitest';
import type { ProjectMatch } from '@contracts';
import { leerAfinidad } from './afinidad';

function match(overrides: Partial<ProjectMatch> = {}): ProjectMatch {
  return {
    proyectoId: 'proy-1',
    similitud: 0.86,
    razon: 'Te lo mostramos porque cabe en tu techo estimado.',
    nombre: 'Proyecto Prueba',
    etapa: 'Etapa 1',
    precioDesde: 180_000_000,
    tipologia: 'VIS · 3 hab',
    confianza: 1,
    datosFaltantes: [],
    cabeEnCapacidad: true,
    ...overrides,
  };
}

describe('leerAfinidad', () => {
  it('deja el numero solo cuando se calculo con el perfil completo', () => {
    const lectura = leerAfinidad(match());

    expect(lectura.porcentaje).toBe(86);
    expect(lectura.nivel).toBe('calculada');
    expect(lectura.rotulo).toBeNull();
    expect(lectura.advertenciaCapacidad).toBeNull();
  });

  it('rotula como parcial y nombra que falto', () => {
    const lectura = leerAfinidad(
      match({ confianza: 0.6, datosFaltantes: ['tu capacidad de pago'] }),
    );

    expect(lectura.nivel).toBe('parcial');
    expect(lectura.rotulo).toBe('parcial');
    expect(lectura.explicacion).toContain('tu capacidad de pago');
  });

  it('marca parcial a un lead sin ciudad (0.75), que es un cuarto del calculo', () => {
    // Caso medido contra el catalogo real: sin ciudad, el top salia en 88% y
    // se presentaba como cerrado. Un cuarto del puntaje era relleno neutro.
    const lectura = leerAfinidad(
      match({ similitud: 0.88, confianza: 0.75, datosFaltantes: ['tu ciudad'] }),
    );

    expect(lectura.nivel).toBe('parcial');
    expect(lectura.explicacion).toContain('tu ciudad');
  });

  it('no molesta cuando solo falta el eje mas liviano', () => {
    // Estilo de vida pesa 0.08: senalarlo seria ruido, no transparencia.
    const lectura = leerAfinidad(
      match({ confianza: 0.92, datosFaltantes: ['tu composicion de hogar'] }),
    );

    expect(lectura.nivel).toBe('calculada');
    expect(lectura.rotulo).toBeNull();
  });

  it('el 50% de un lead sin datos NO se presenta como una medicion', () => {
    // El caso que motivo todo esto: el puntaje tiene piso porque los ejes sin
    // dato puntuan neutro, asi que "no sabemos nada de ti" sale como 50%.
    const lectura = leerAfinidad(
      match({ similitud: 0.5, confianza: 0, datosFaltantes: ['tu ciudad'] }),
    );

    expect(lectura.nivel).toBe('sin-base');
    expect(lectura.rotulo).toBe('sin calcular');
    expect(lectura.explicacion).toContain('no esta calculado');
    // "estimado" o "aproximado" sugieren una medicion imprecisa; aqui no hubo
    // medicion, y la diferencia es justamente lo que hay que comunicar.
    expect(lectura.explicacion).not.toContain('estimado');
    expect(lectura.explicacion).not.toContain('aproximado');
  });

  it('advierte cuando el proyecto no cabe en la capacidad, aunque puntue alto', () => {
    const lectura = leerAfinidad(match({ similitud: 0.81, cabeEnCapacidad: false }));

    expect(lectura.porcentaje).toBe(81);
    expect(lectura.advertenciaCapacidad).toContain('Por encima de tu capacidad');
  });

  it('NO advierte nada cuando no se pudo evaluar la capacidad', () => {
    // `null` es "no sabemos si le alcanza". Advertir ahi seria afirmar que no
    // le alcanza, que es exactamente el error opuesto y igual de caro.
    const lectura = leerAfinidad(match({ cabeEnCapacidad: null }));

    expect(lectura.advertenciaCapacidad).toBeNull();
  });

  it('siempre puede explicar el numero, sea cual sea el nivel', () => {
    for (const confianza of [0, 0.4, 0.77, 1]) {
      const lectura = leerAfinidad(match({ confianza, datosFaltantes: ['tu ciudad'] }));
      expect(lectura.explicacion.length).toBeGreaterThan(0);
    }
  });
});
