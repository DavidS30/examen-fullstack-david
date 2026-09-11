import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Bolsillo } from '../../../../core/models/bolsillo.model';

@Component({
  selector: 'app-meta-alcanzada-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './meta-alcanzada-modal.html',
  styleUrl: './meta-alcanzada-modal.scss',
})
export class MetaAlcanzadaModalComponent {
  readonly bolsillo = input.required<Bolsillo>();
  readonly cerrar = output<void>();
}