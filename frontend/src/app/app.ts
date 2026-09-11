import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NotificacionesComponent } from './core/components/notificaciones/notificaciones';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NotificacionesComponent],
  template: `
    <a class="skip-link" href="#contenido">Saltar al contenido principal</a>
    <router-outlet />
    <app-notificaciones />
  `,
  styles: `
    :host {
      display: block;
      min-height: 100vh;
    }
  `,
})
export class AppComponent {}