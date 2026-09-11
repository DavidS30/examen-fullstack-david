import {
  Component,
  ElementRef,
  AfterViewInit,
  OnInit,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-bienvenida-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './bienvenida-modal.html',
  styleUrl: './bienvenida-modal.scss',
})
export class BienvenidaModalComponent implements OnInit, AfterViewInit {
  private static contador = 0;
  private readonly fb = inject(FormBuilder);

  readonly campoId = `bienvenida-nombre-${++BienvenidaModalComponent.contador}`;

  readonly titulo = input<string>('¿Cómo te llamas?');
  readonly botonTexto = input<string>('Empezar');
  readonly nombreInicial = input<string | null>(null);
  readonly permitirCancelar = input<boolean>(false);

  readonly guardarNombre = output<string>();
  readonly cancelar = output<void>();

  readonly form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.minLength(2), Validators.pattern(/\S/)]],
  });

  private readonly dialogo = viewChild<ElementRef<HTMLDialogElement>>('dialogo');
  private readonly inputNombre = viewChild<ElementRef<HTMLInputElement>>('inputNombre');

  ngOnInit(): void {
    const inicial = this.nombreInicial();
    if (inicial) {
      this.form.patchValue({ nombre: inicial });
    }
  }

  ngAfterViewInit(): void {
    const dialog = this.dialogo()?.nativeElement;
    if (typeof dialog?.showModal === 'function') {
      dialog.showModal();
    } else {
      // Fallback para entornos sin soporte nativo (p.ej. jsdom en tests).
      dialog?.setAttribute('open', '');
    }
    this.inputNombre()?.nativeElement.focus();
  }

  empezar(): void {
    if (this.form.invalid) {
      return;
    }
    const nombre = this.form.getRawValue().nombre.trim();
    if (nombre.length < 2) {
      return;
    }
    this.guardarNombre.emit(nombre);
  }

  onCancelarEvent(event: Event): void {
    if (!this.permitirCancelar()) {
      event.preventDefault();
      return;
    }
    this.cancelar.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target !== this.dialogo()?.nativeElement) {
      return;
    }
    if (this.permitirCancelar()) {
      this.cancelar.emit();
    }
  }
}