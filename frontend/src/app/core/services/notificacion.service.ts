import { Injectable, signal } from '@angular/core';

export type TipoNotificacion = 'exito' | 'error';

export interface Notificacion {
  id: number;
  tipo: TipoNotificacion;
  mensaje: string;
}

const DURACION_EXITO_MS = 4000;
const DURACION_ERROR_MS = 6000;

@Injectable({ providedIn: 'root' })
export class NotificacionService {
  private static contador = 0;

  private readonly notificacionesSignal = signal<Notificacion[]>([]);
  readonly notificaciones = this.notificacionesSignal.asReadonly();

  exito(mensaje: string): void {
    this.mostrar('exito', mensaje, DURACION_EXITO_MS);
  }

  error(mensaje: string): void {
    this.mostrar('error', mensaje, DURACION_ERROR_MS);
  }

  cerrar(id: number): void {
    this.notificacionesSignal.update((lista) => lista.filter((n) => n.id !== id));
  }

  private mostrar(tipo: TipoNotificacion, mensaje: string, duracionMs: number): void {
    const notificacion: Notificacion = {
      id: ++NotificacionService.contador,
      tipo,
      mensaje,
    };
    this.notificacionesSignal.update((lista) => [...lista, notificacion]);
    setTimeout(() => this.cerrar(notificacion.id), duracionMs);
  }
}