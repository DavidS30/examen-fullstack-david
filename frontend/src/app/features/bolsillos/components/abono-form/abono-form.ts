import { Component, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-abono-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './abono-form.html',
  styleUrl: './abono-form.scss',
})
export class AbonoFormComponent {
  private readonly fb = inject(FormBuilder);

  readonly disabled = input<boolean>(false);
  readonly errorServidor = input<string | null>(null);
  readonly abonar = output<number>();

  readonly form = this.fb.nonNullable.group({
    monto: [0, [Validators.required, Validators.min(1)]],
  });

  submit(): void {
    if (this.form.invalid) {
      return;
    }
    this.abonar.emit(this.form.getRawValue().monto);
    this.form.reset({ monto: 0 });
  }
}