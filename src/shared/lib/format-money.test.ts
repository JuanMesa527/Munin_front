import { describe, expect, it } from 'vitest';
import { formatCOP, formatCOPCompact, SIN_DATO } from './format-money';

describe('formatCOP', () => {
  it('formatea pesos enteros con separador de miles', () => {
    expect(formatCOP(523_620_000)).toBe('$523.620.000');
  });

  it('nunca multiplica ni divide por 1000: el valor entra tal cual', () => {
    expect(formatCOP(1_000_000)).toBe('$1.000.000');
  });

  it('redondea negativos con signo', () => {
    expect(formatCOP(-50_000)).toBe('-$50.000');
  });

  it('usa el guion largo cuando no hay dato', () => {
    expect(formatCOP(null)).toBe(SIN_DATO);
    expect(formatCOP(undefined)).toBe(SIN_DATO);
  });
});

describe('formatCOPCompact', () => {
  it('compacta a millones', () => {
    expect(formatCOPCompact(523_620_000)).toBe('$523,6 M');
  });

  it('compacta a miles de millones', () => {
    expect(formatCOPCompact(1_500_000_000)).toBe('$1,5 MM');
  });

  it('deja los montos chicos sin compactar', () => {
    expect(formatCOPCompact(5_000)).toBe(formatCOP(5_000));
  });
});
