import { Component, computed, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Bolsillo } from '../../../../core/models/bolsillo.model';
import { PesosPipe } from '../../../../core/pipes/pesos.pipe';
import { acentoPorNombre, iconoPorNombre } from '../../../../core/utils/iconos';

@Component({
  selector: 'app-archivada-card',
  standalone: true,
  imports: [CommonModule, PesosPipe],
  templateUrl: './archivada-card.html',
  styleUrl: './archivada-card.scss',
})
export class ArchivadaCardComponent {
  readonly bolsillo = input.required<Bolsillo>();
  readonly restaurar = output<void>();

  readonly icono = computed(() => iconoPorNombre(this.bolsillo().nombre));
  readonly acento = computed(() => acentoPorNombre(this.bolsillo().nombre));
}