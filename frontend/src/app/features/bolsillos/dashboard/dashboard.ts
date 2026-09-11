import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PesosPipe } from '../../../core/pipes/pesos.pipe';
import { NotificacionService } from '../../../core/services/notificacion.service';
import { BolsillosStoreService } from '../../../core/services/bolsillos.store';
import { UsuarioService } from '../../../core/services/usuario.service';
import { extraerMensajeError } from '../../../core/utils/errores';
import { BienvenidaModalComponent } from '../components/bienvenida-modal/bienvenida-modal';
import { ArchivadaCardComponent } from '../components/archivada-card/archivada-card';
import { BolsilloCardComponent } from '../components/bolsillo-card/bolsillo-card';
import { MetaAlcanzadaModalComponent } from '../components/meta-alcanzada-modal/meta-alcanzada-modal';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PesosPipe,
    BienvenidaModalComponent,
    ArchivadaCardComponent,
    BolsilloCardComponent,
    MetaAlcanzadaModalComponent,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardPage implements OnInit, OnDestroy {
  private readonly store = inject(BolsillosStoreService);
  private readonly usuarioService = inject(UsuarioService);
  private readonly notificaciones = inject(NotificacionService);
  private readonly fb = inject(FormBuilder);

  readonly bolsillos = this.store.bolsillos;
  readonly archivadas = this.store.archivadas;
  readonly cargando = this.store.cargando;
  readonly errorCarga = this.store.errorCarga;
  readonly metaAlcanzada = this.store.metaAlcanzada;

  readonly usuarioNombre = this.usuarioService.nombre;
  readonly cambiandoUsuario = signal<boolean>(false);

  readonly totalAhorrado = computed(() =>
    this.bolsillos().reduce((total, bolsillo) => total + bolsillo.acumulado, 0)
  );
  readonly metasCompletadas = computed(
    () => this.bolsillos().filter((bolsillo) => bolsillo.completado).length
  );
  readonly mostrarBienvenida = computed(
    () => this.usuarioNombre() === null || this.cambiandoUsuario()
  );
  readonly tituloModal = computed(() =>
    this.cambiandoUsuario() ? '¿Cómo prefieres que te llamemos?' : '¿Cómo te llamas?'
  );
  readonly botonModal = computed(() => (this.cambiandoUsuario() ? 'Guardar' : 'Empezar'));

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

  guardarNombre(nombre: string): void {
    this.usuarioService.guardar(nombre);
    this.cambiandoUsuario.set(false);
  }

  cambiarUsuario(): void {
    this.cambiandoUsuario.set(true);
  }

  cancelarCambio(): void {
    this.cambiandoUsuario.set(false);
  }

  crearBolsillo(): void {
    if (this.crearForm.invalid) {
      return;
    }
    this.errorCrear.set(null);
    const { nombre, objetivo } = this.crearForm.getRawValue();
    this.store.crear({ nombre, objetivo }).subscribe({
      next: () => this.notificaciones.exito('Meta creada'),
      error: (err: unknown) => {
        const mensaje = extraerMensajeError(err);
        this.errorCrear.set(mensaje);
        this.notificaciones.error(mensaje);
      },
    });
    this.crearForm.reset({ nombre: '', objetivo: 0 });
  }

  archivarMeta(id: number): void {
    this.store.archivar(id).subscribe({
      next: () => this.notificaciones.exito('Meta archivada'),
      error: (err: unknown) => this.notificaciones.error(extraerMensajeError(err)),
    });
  }

  restaurarMeta(id: number): void {
    this.store.restaurar(id).subscribe({
      next: () => this.notificaciones.exito('Meta restaurada'),
      error: (err: unknown) => this.notificaciones.error(extraerMensajeError(err)),
    });
  }

  cerrarModal(): void {
    this.store.cerrarMetaAlcanzada();
  }
}