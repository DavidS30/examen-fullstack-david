import { describe, it, expect, beforeEach } from 'vitest';
import { UsuarioService } from './usuario.service';

describe('UsuarioService', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('constructor_sinValorGuardado_nombreEsNull', () => {
    expect(new UsuarioService().nombre()).toBeNull();
  });

  it('guardar_recortaElNombreYLoPersisteEnLocalStorage', () => {
    const service = new UsuarioService();

    service.guardar('  Ana  ');

    expect(service.nombre()).toBe('Ana');
    expect(window.localStorage.getItem('bolsillo:usuario')).toBe('Ana');
  });

  it('constructor_conValorGuardado_recuperaElNombre', () => {
    window.localStorage.setItem('bolsillo:usuario', 'Carlos');

    expect(new UsuarioService().nombre()).toBe('Carlos');
  });

  it('cambiar_eliminaElValorGuardadoYLimpiaLaSenal', () => {
    const service = new UsuarioService();
    service.guardar('Ana');

    service.cambiar();

    expect(service.nombre()).toBeNull();
    expect(window.localStorage.getItem('bolsillo:usuario')).toBeNull();
  });
});