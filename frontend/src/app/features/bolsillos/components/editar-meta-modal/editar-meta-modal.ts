import { Component, ElementRef, AfterViewInit, OnInit, inject, input, output, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Bolsillo, EditarBolsilloRequest } from '../../../../core/models/bolsillo.model';
import { PesosPipe } from '../../../../core/pipes/pesos.pipe';

@Component({
  selector: 'app-editar-meta-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PesosPipe],
  templateUrl: './editar-meta-modal.html',
  styleUrl: './editar-meta-modal.scss',
})
export class EditarMetaModalComponent implements OnInit, AfterViewInit {
  private readonly fb = inject(FormBuilder);

  readonly bolsillo = input.required<Bolsillo>();
  readonly guardar = output<EditarBolsilloRequest>();
  readonly cancelar = output<void>();

  readonly form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    objetivo: [0, [Validators.required, Validators.min(1)]],
  });

  private readonly dialogo = viewChild<ElementRef<HTMLDialogElement>>('dialogo');

  ngOnInit(): void {
    const actual = this.bolsillo();
    this.form.patchValue({ nombre: actual.nombre, objetivo: actual.objetivo });
  }

  ngAfterViewInit(): void {
    const dialog = this.dialogo()?.nativeElement;
    if (typeof dialog?.showModal === 'function') {
      dialog.showModal();
    } else {
      // Fallback para entornos sin soporte nativo (p.ej. jsdom en tests).
      dialog?.setAttribute('open', '');
    }
  }

  enviar(): void {
    if (this.form.invalid) {
      return;
    }
    const { nombre, objetivo } = this.form.getRawValue();
    this.guardar.emit({ nombre: nombre.trim(), objetivo });
  }

  onCancelarEvent(event: Event): void {
    event.preventDefault();
    this.cancelar.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === this.dialogo()?.nativeElement) {
      this.cancelar.emit();
    }
  }
}