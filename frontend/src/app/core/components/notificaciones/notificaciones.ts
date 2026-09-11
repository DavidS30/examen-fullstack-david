import { Component, inject } from '@angular/core';
import { NotificacionService } from '../../services/notificacion.service';

@Component({
  selector: 'app-notificaciones',
  standalone: true,
  templateUrl: './notificaciones.html',
  styleUrl: './notificaciones.scss',
})
export class NotificacionesComponent {
  private readonly service = inject(NotificacionService);
  readonly notificaciones = this.service.notificaciones;

  cerrar(id: number): void {
    this.service.cerrar(id);
  }
}