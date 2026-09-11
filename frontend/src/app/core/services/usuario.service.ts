import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private static readonly STORAGE_KEY = 'bolsillo:usuario';

  private readonly nombreSignal = signal<string | null>(null);
  readonly nombre = this.nombreSignal.asReadonly();

  constructor() {
    this.nombreSignal.set(window.localStorage.getItem(UsuarioService.STORAGE_KEY));
  }

  guardar(nombre: string): void {
    const limpio = nombre.trim();
    window.localStorage.setItem(UsuarioService.STORAGE_KEY, limpio);
    this.nombreSignal.set(limpio);
  }

  cambiar(): void {
    window.localStorage.removeItem(UsuarioService.STORAGE_KEY);
    this.nombreSignal.set(null);
  }
}