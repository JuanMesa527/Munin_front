import { describe, expect, it } from 'vitest';
import { SMMLV_2026 } from '@contracts';
import { SIN_DATO } from './format-money';
import { formatSmmlv, toSmmlv } from './format-smmlv';

describe('toSmmlv', () => {
  it('convierte pesos a multiplos de SMMLV', () => {
    expect(toSmmlv(SMMLV_2026 * 4)).toBe(4);
  });
});

describe('formatSmmlv', () => {
  it('formatea con la sigla, usada por el plan del carril de nutrición (F2.2)', () => {
    expect(formatSmmlv(SMMLV_2026 * 2)).toBe('2 SMMLV');
  });

  it('sin dato devuelve el guion largo', () => {
    expect(formatSmmlv(null)).toBe(SIN_DATO);
    expect(formatSmmlv(undefined)).toBe(SIN_DATO);
  });
});
