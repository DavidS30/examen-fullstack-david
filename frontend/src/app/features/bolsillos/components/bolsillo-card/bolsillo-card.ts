import { Component, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Bolsillo } from '../../../../core/models/bolsillo.model';
import { BolsillosStoreService } from '../../../../core/services/bolsillos.store';
import { extraerMensajeError } from '../../../../core/utils/errores';
import { AbonoFormComponent } from '../abono-form/abono-form';

@Component({
  selector: 'app-bolsillo-card',
  standalone: true,
  imports: [CommonModule, AbonoFormComponent],
  templateUrl: './bolsillo-card.html',
  styleUrl: './bolsillo-card.scss',
})
export class BolsilloCardComponent {
  private readonly store = inject(BolsillosStoreService);

  readonly bolsillo = input.required<Bolsillo>();
  readonly abonando = signal<boolean>(false);
  readonly errorAbono = signal<string | null>(null);

  abonar(monto: number): void {
    this.errorAbono.set(null);
    this.abonando.set(true);
    this.store.abonar(this.bolsillo().id, { monto }).subscribe({
      next: () => this.abonando.set(false),
      error: (err: unknown) => {
        this.abonando.set(false);
        this.errorAbono.set(extraerMensajeError(err));
      },
    });
  }
}