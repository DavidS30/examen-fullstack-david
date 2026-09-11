import { Component, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-abono-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './abono-form.html',
  styleUrl: './abono-form.scss',
})
export class AbonoFormComponent {
  private static contador = 0;
  private readonly fb = inject(FormBuilder);

  readonly campoId = `monto-abono-${++AbonoFormComponent.contador}`;

  readonly disabled = input<boolean>(false);
  readonly errorServidor = input<string | null>(null);
  readonly abonar = output<number>();
  readonly cambioMonto = output<void>();

  readonly form = this.fb.nonNullable.group({
    monto: [0, [Validators.required, Validators.min(1)]],
  });

  constructor() {
    // Limpiar el error del servidor en cuanto el usuario edita el monto.
    this.form.controls.monto.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.cambioMonto.emit());
  }

  submit(): void {
    if (this.form.invalid) {
      return;
    }
    this.abonar.emit(this.form.getRawValue().monto);
    this.form.reset({ monto: 0 });
  }
}