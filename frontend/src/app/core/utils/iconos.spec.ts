import { describe, it, expect } from 'vitest';
import { hashNombre, iconoPorNombre } from './iconos';

describe('hashNombre', () => {
  it('mismoNombre_devuelveElMismoHash', () => {
    expect(hashNombre('Viaje a Cartagena')).toBe(hashNombre('Viaje a Cartagena'));
  });

  it('nombresDistintos_puedenDarHashesDistintos', () => {
    expect(hashNombre('Ahorro')).not.toBe(hashNombre('Viaje'));
  });
});

describe('iconoPorNombre', () => {
  it('nombreConPalabraClave_devuelveElIconoDelTema', () => {
    expect(iconoPorNombre('Viaje a Cartagena')).toBe('✈️');
    expect(iconoPorNombre('Computador Gamer')).toBe('💻');
    expect(iconoPorNombre('Fondo de emergencia')).toBe('🪙');
    expect(iconoPorNombre('Mi casita propia')).toBe('🏠');
    expect(iconoPorNombre('Carro nuevo')).toBe('🚗');
  });

  it('nombreSinPalabraClave_devuelveUnIconoDelFallbackEstable', () => {
    const icono1 = iconoPorNombre('Proyecto personal');
    const icono2 = iconoPorNombre('Proyecto personal');
    expect(icono1).toBe(icono2);
    expect(['🪙', '🐷', '🌴', '✈️', '🏠', '💻', '🎓', '🚗', '💍', '🎁', '🏖️', '📱']).toContain(icono1);
  });
});