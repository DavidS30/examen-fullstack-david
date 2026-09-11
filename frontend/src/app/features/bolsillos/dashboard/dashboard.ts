import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BolsillosStoreService } from '../../../core/services/bolsillos.store';
import { extraerMensajeError } from '../../../core/utils/errores';
import { BolsilloCardComponent } from '../components/bolsillo-card/bolsillo-card';
import { MetaAlcanzadaModalComponent } from '../components/meta-alcanzada-modal/meta-alcanzada-modal';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    BolsilloCardComponent,
    MetaAlcanzadaModalComponent,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardPage implements OnInit, OnDestroy {
  private readonly store = inject(BolsillosStoreService);
  private readonly fb = inject(FormBuilder);

  readonly bolsillos = this.store.bolsillos;
  readonly cargando = this.store.cargando;
  readonly errorCarga = this.store.errorCarga;
  readonly metaAlcanzada = this.store.metaAlcanzada;

  readonly errorCrear = signal<string | null>(null);

  readonly crearForm = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    objetivo: [0, [Validators.required, Validators.min(1)]],
  });

  ngOnInit(): void {
    this.store.iniciar();
  }

  ngOnDestroy(): void {
    this.store.detener();
  }

  crearBolsillo(): void {
    if (this.crearForm.invalid) {
      return;
    }
    this.errorCrear.set(null);
    const { nombre, objetivo } = this.crearForm.getRawValue();
    this.store.crear({ nombre, objetivo }).subscribe({
      error: (err: unknown) => this.errorCrear.set(extraerMensajeError(err)),
    });
    this.crearForm.reset({ nombre: '', objetivo: 0 });
  }

  cerrarModal(): void {
    this.store.cerrarMetaAlcanzada();
  }
}