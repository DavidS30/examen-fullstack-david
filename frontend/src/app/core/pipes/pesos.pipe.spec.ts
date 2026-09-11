import { describe, it, expect } from 'vitest';
import { PesosPipe } from './pesos.pipe';

describe('PesosPipe', () => {
  const pipe = new PesosPipe();

  it('transform_valor_formateaEnPesosColombianos', () => {
    expect(pipe.transform(0)).toBe('$ 0');
    expect(pipe.transform(250)).toBe('$ 250');
    expect(pipe.transform(1000)).toBe('$ 1.000');
    expect(pipe.transform(1000000)).toBe('$ 1.000.000');
  });

  it('transform_sinDecimales_redondeaAlPeso', () => {
    expect(pipe.transform(250.6)).toBe('$ 251');
  });

  it('transform_nuloOVacio_devuelveCadenaVacia', () => {
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(undefined)).toBe('');
  });
});