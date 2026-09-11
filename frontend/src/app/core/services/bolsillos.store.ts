import { Injectable, inject, OnDestroy, signal } from '@angular/core';
import { Observable, Subscription, tap } from 'rxjs';
import { AbonoRequest, Bolsillo, CrearBolsilloRequest, EditarBolsilloRequest } from '../models/bolsillo.model';
import { SSE_EVENTOS, SseMensaje } from '../models/sse-events.model';
import { extraerMensajeError } from '../utils/errores';
import { BolsillosService } from './bolsillos.service';
import { SseService } from './sse.service';

@Injectable({ providedIn: 'root' })
export class BolsillosStoreService implements OnDestroy {
  private readonly bolsillosService = inject(BolsillosService);
  private readonly sseService = inject(SseService);

  private readonly bolsillosSignal = signal<Bolsillo[]>([]);
  private readonly archivadasSignal = signal<Bolsillo[]>([]);
  private readonly metaAlcanzadaSignal = signal<Bolsillo | null>(null);
  private readonly cargandoSignal = signal<boolean>(false);
  private readonly errorCargaSignal = signal<string | null>(null);

  readonly bolsillos = this.bolsillosSignal.asReadonly();
  readonly archivadas = this.archivadasSignal.asReadonly();
  readonly metaAlcanzada = this.metaAlcanzadaSignal.asReadonly();
  readonly cargando = this.cargandoSignal.asReadonly();
  readonly errorCarga = this.errorCargaSignal.asReadonly();

  private sseSubscription: Subscription | null = null;

  iniciar(): void {
    this.cargar();
    this.cargarArchivadas();
    if (this.sseSubscription === null) {
      this.sseSubscription = this.sseService.conectar().subscribe({
        next: (mensaje) => this.manejarSse(mensaje),
        error: () => {
          // EventSource reconecta; no cambiamos el estado.
        },
      });
    }
  }

  detener(): void {
    this.sseSubscription?.unsubscribe();
    this.sseSubscription = null;
  }

  cargar(): void {
    this.cargandoSignal.set(true);
    this.errorCargaSignal.set(null);
    this.bolsillosService.listar().subscribe({
      next: (bolsillos) => {
        this.bolsillosSignal.set(bolsillos);
        this.cargandoSignal.set(false);
      },
      error: (err: unknown) => {
        this.cargandoSignal.set(false);
        this.errorCargaSignal.set(extraerMensajeError(err));
      },
      complete: () => this.cargandoSignal.set(false),
    });
  }

  crear(datos: CrearBolsilloRequest): Observable<Bolsillo> {
    return this.bolsillosService.crear(datos).pipe(
      tap((bolsillo) => {
        this.bolsillosSignal.update((lista) => [...lista, bolsillo]);
      })
    );
  }

  abonar(id: number, datos: AbonoRequest): Observable<Bolsillo> {
    return this.bolsillosService.abonar(id, datos).pipe(
      tap((bolsillo) => this.actualizarBolsillo(bolsillo))
    );
  }

  editar(id: number, datos: EditarBolsilloRequest): Observable<Bolsillo> {
    return this.bolsillosService.editar(id, datos).pipe(
      tap((bolsillo) => this.actualizarBolsillo(bolsillo))
    );
  }

  cargarArchivadas(): void {
    this.bolsillosService.listarArchivados().subscribe({
      next: (archivadas) => this.archivadasSignal.set(archivadas),
      error: (err: unknown) =>
        console.error('No se pudieron cargar las metas archivadas', err),
    });
  }

  archivar(id: number): Observable<Bolsillo> {
    return this.bolsillosService.archivar(id).pipe(
      tap((bolsillo) => {
        this.bolsillosSignal.update((lista) => lista.filter((item) => item.id !== bolsillo.id));
        this.archivadasSignal.update((lista) => [...lista, bolsillo]);
      })
    );
  }

  restaurar(id: number): Observable<Bolsillo> {
    return this.bolsillosService.restaurar(id).pipe(
      tap((bolsillo) => {
        this.archivadasSignal.update((lista) => lista.filter((item) => item.id !== bolsillo.id));
        this.bolsillosSignal.update((lista) => [...lista, bolsillo]);
      })
    );
  }

  cerrarMetaAlcanzada(): void {
    this.metaAlcanzadaSignal.set(null);
  }

  private manejarSse(mensaje: SseMensaje): void {
    this.actualizarBolsillo(mensaje.datos);
    if (mensaje.evento === SSE_EVENTOS.metaAlcanzada) {
      this.metaAlcanzadaSignal.set(mensaje.datos);
    }
  }

  private actualizarBolsillo(bolsillo: Bolsillo): void {
    this.bolsillosSignal.update((lista) => {
      const indice = lista.findIndex((item) => item.id === bolsillo.id);
      if (indice === -1) {
        return [...lista, bolsillo];
      }
      const copia = [...lista];
      copia[indice] = bolsillo;
      return copia;
    });
  }

  ngOnDestroy(): void {
    this.detener();
  }
}