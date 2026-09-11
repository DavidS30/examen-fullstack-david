import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NotificacionService } from './notificacion.service';

describe('NotificacionService', () => {
  let service: NotificacionService;

  beforeEach(() => {
    vi.useFakeTimers();
    service = new NotificacionService();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('exito_agregaUnaNotificacionDeTipoExito', () => {
    service.exito('Meta creada');

    expect(service.notificaciones().length).toBe(1);
    expect(service.notificaciones()[0].tipo).toBe('exito');
    expect(service.notificaciones()[0].mensaje).toBe('Meta creada');
  });

  it('error_agregaUnaNotificacionDeTipoError', () => {
    service.error('El monto excede el objetivo');

    expect(service.notificaciones()[0].tipo).toBe('error');
  });

  it('cerrar_eliminaLaNotificacionIndicada', () => {
    service.exito('Meta creada');
    const id = service.notificaciones()[0].id;

    service.cerrar(id);

    expect(service.notificaciones()).toEqual([]);
  });

  it('notificacion_seCierraAutomaticamenteTrasLaDuracion', () => {
    service.exito('Meta creada');
    service.error('Error de prueba');

    vi.advanceTimersByTime(5000);

    expect(service.notificaciones().length).toBe(1);
    expect(service.notificaciones()[0].tipo).toBe('error');

    vi.advanceTimersByTime(2000);

    expect(service.notificaciones()).toEqual([]);
  });
});