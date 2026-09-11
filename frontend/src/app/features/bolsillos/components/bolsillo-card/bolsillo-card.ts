import { Component, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Bolsillo } from '../../../../core/models/bolsillo.model';
import { PesosPipe } from '../../../../core/pipes/pesos.pipe';
import { NotificacionService } from '../../../../core/services/notificacion.service';
import { BolsillosStoreService } from '../../../../core/services/bolsillos.store';
import { extraerMensajeError } from '../../../../core/utils/errores';
import { AbonoFormComponent } from '../abono-form/abono-form';

@Component({
  selector: 'app-bolsillo-card',
  standalone: true,
  imports: [CommonModule, PesosPipe, AbonoFormComponent],
  templateUrl: './bolsillo-card.html',
  styleUrl: './bolsillo-card.scss',
})
export class BolsilloCardComponent {
  private readonly store = inject(BolsillosStoreService);
  private readonly notificaciones = inject(NotificacionService);

  readonly bolsillo = input.required<Bolsillo>();
  readonly abonando = signal<boolean>(false);
  readonly errorAbono = signal<string | null>(null);
  readonly archivar = output<void>();

  abonar(monto: number): void {
    this.errorAbono.set(null);
    this.abonando.set(true);
    this.store.abonar(this.bolsillo().id, { monto }).subscribe({
      next: () => {
        this.abonando.set(false);
        this.notificaciones.exito('Abono registrado');
      },
      error: (err: unknown) => {
        this.abonando.set(false);
        const mensaje = extraerMensajeError(err);
        this.errorAbono.set(mensaje);
        this.notificaciones.error(mensaje);
      },
    });
  }

  limpiarErrorAbono(): void {
    this.errorAbono.set(null);
  }
}