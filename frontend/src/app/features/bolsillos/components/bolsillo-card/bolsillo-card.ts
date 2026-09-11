import { Component, computed, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Bolsillo } from '../../../../core/models/bolsillo.model';
import { PesosPipe } from '../../../../core/pipes/pesos.pipe';
import { NotificacionService } from '../../../../core/services/notificacion.service';
import { BolsillosStoreService } from '../../../../core/services/bolsillos.store';
import { extraerMensajeError } from '../../../../core/utils/errores';
import { AbonoFormComponent } from '../abono-form/abono-form';

const ICONOS_META = ['🪙', '🐷', '🌴', '✈️', '🏠', '💻', '🎓', '🚗', '💍', '🎁', '🏖️', '📱'];
const ACENTOS_META = ['#0d9488', '#f59e0b', '#8b5cf6', '#f43f5e', '#3b82f6', '#84cc16'];

interface MapeoIcono {
  icono: string;
  palabras: readonly string[];
}

const MAPEO_ICONOS: readonly MapeoIcono[] = [
  { icono: '✈️', palabras: ['viaj', 'vacac', 'vuel', 'avion', 'turism', 'caribe', 'cartagena'] },
  { icono: '🏠', palabras: ['cas', 'hogar', 'apartam', 'remodel', 'mueble', 'cuota inicial'] },
  { icono: '🚗', palabras: ['carr', 'auto', 'moto', 'vehicul', 'coche'] },
  { icono: '💻', palabras: ['comput', 'laptop', 'portatil', 'notebook', ' pc', ' mac', 'gamer'] },
  { icono: '🎓', palabras: ['estudi', 'universid', 'colegi', 'maestri', 'curso', 'educac', 'libro'] },
  { icono: '💍', palabras: ['boda', 'anill', 'matrimon', 'compromis', 'novi'] },
  { icono: '🎁', palabras: ['regal', 'navidad', 'cumplea', 'sorpresa', 'fiesta'] },
  { icono: '🏖️', palabras: ['playa', 'verano', 'piscina', 'tropical', 'sol'] },
  { icono: '📱', palabras: ['celular', 'telefono', 'iphone', 'samsung', 'movil', 'smartph'] },
  { icono: '🪙', palabras: ['ahorr', 'emergencia', 'fondo', 'inversion', 'meta'] },
  { icono: '🐷', palabras: ['cerdit', 'alcancia', 'chanchit'] },
];

export function iconoPorNombre(nombre: string): string {
  const normalizado = nombre
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  const coincidencia = MAPEO_ICONOS.find((mapeo) =>
    mapeo.palabras.some((palabra) => normalizado.includes(palabra))
  );
  if (coincidencia) {
    return coincidencia.icono;
  }

  const hash = [...normalizado].reduce((total, letra) => total + letra.charCodeAt(0), 0);
  return ICONOS_META[hash % ICONOS_META.length];
}

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
  readonly editar = output<void>();

  private readonly hash = computed(() =>
    [...this.bolsillo().nombre].reduce((total, letra) => total + letra.charCodeAt(0), 0)
  );
  readonly icono = computed(() => iconoPorNombre(this.bolsillo().nombre));
  readonly acento = computed(() => ACENTOS_META[this.hash() % ACENTOS_META.length]);

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