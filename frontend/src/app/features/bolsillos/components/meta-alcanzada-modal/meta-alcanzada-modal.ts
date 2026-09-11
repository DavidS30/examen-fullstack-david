import { Component, ElementRef, AfterViewInit, input, output, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Bolsillo } from '../../../../core/models/bolsillo.model';
import { PesosPipe } from '../../../../core/pipes/pesos.pipe';

interface PiezaConfeti {
  indice: number;
  color: string;
}

const COLORES_CONFETI = ['#f59e0b', '#0d9488', '#16a34a', '#f43f5e', '#3b82f6', '#a855f7'];

@Component({
  selector: 'app-meta-alcanzada-modal',
  standalone: true,
  imports: [CommonModule, PesosPipe],
  templateUrl: './meta-alcanzada-modal.html',
  styleUrl: './meta-alcanzada-modal.scss',
})
export class MetaAlcanzadaModalComponent implements AfterViewInit {
  readonly bolsillo = input.required<Bolsillo>();
  readonly cerrar = output<void>();

  readonly piezas: PiezaConfeti[] = Array.from({ length: 14 }, (_, indice) => ({
    indice,
    color: COLORES_CONFETI[indice % COLORES_CONFETI.length],
  }));

  private readonly dialogo = viewChild<ElementRef<HTMLDialogElement>>('dialogo');

  ngAfterViewInit(): void {
    const dialog = this.dialogo()?.nativeElement;
    if (typeof dialog?.showModal === 'function') {
      dialog.showModal();
    } else {
      // Fallback para entornos sin soporte nativo (p.ej. jsdom en tests).
      dialog?.setAttribute('open', '');
    }
  }

  cerrarDialogo(): void {
    const dialog = this.dialogo()?.nativeElement;
    if (typeof dialog?.close === 'function') {
      dialog.close();
    } else {
      this.cerrar.emit();
    }
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === this.dialogo()?.nativeElement) {
      this.cerrarDialogo();
    }
  }
}