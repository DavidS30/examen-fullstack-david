import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Observable, Subject } from 'rxjs';
import { BolsillosStoreService } from './bolsillos.store';
import { BolsillosService } from './bolsillos.service';
import { SseService } from './sse.service';
import { AbonoRequest, Bolsillo, CrearBolsilloRequest, EditarBolsilloRequest } from '../models/bolsillo.model';
import { SSE_EVENTOS, SseMensaje } from '../models/sse-events.model';

type BolsillosServiceStub = {
  listar: () => Observable<Bolsillo[]>;
  listarArchivados: () => Observable<Bolsillo[]>;
  crear: (datos: CrearBolsilloRequest) => Observable<Bolsillo>;
  abonar: (id: number, datos: AbonoRequest) => Observable<Bolsillo>;
  archivar: (id: number) => Observable<Bolsillo>;
  restaurar: (id: number) => Observable<Bolsillo>;
  editar: (id: number, datos: EditarBolsilloRequest) => Observable<Bolsillo>;
};

type SseServiceStub = {
  conectar: () => Observable<SseMensaje>;
};

const bolsillo1: Bolsillo = {
  id: 1,
  nombre: 'Viaje a Cartagena',
  objetivo: 1000,
  acumulado: 250,
  progreso: 25,
  completado: false,
  archivado: false,
};

const bolsilloActualizado: Bolsillo = {
  id: 1,
  nombre: 'Viaje a Cartagena',
  objetivo: 1000,
  acumulado: 750,
  progreso: 75,
  completado: false,
  archivado: false,
};

const bolsilloCompletado: Bolsillo = {
  id: 1,
  nombre: 'Viaje a Cartagena',
  objetivo: 1000,
  acumulado: 1000,
  progreso: 100,
  completado: true,
  archivado: false,
};

const bolsilloNuevo: Bolsillo = {
  id: 2,
  nombre: 'Computador Gamer',
  objetivo: 2000,
  acumulado: 0,
  progreso: 0,
  completado: false,
  archivado: false,
};

describe('BolsillosStoreService', () => {
  let store: BolsillosStoreService;
  let listarSubject: Subject<Bolsillo[]>;
  let listarArchivadosSubject: Subject<Bolsillo[]>;
  let crearSubject: Subject<Bolsillo>;
  let abonarSubject: Subject<Bolsillo>;
  let archivarSubject: Subject<Bolsillo>;
  let restaurarSubject: Subject<Bolsillo>;
  let editarSubject: Subject<Bolsillo>;
  let sseSubject: Subject<SseMensaje>;
  let bolsillosServiceStub: BolsillosServiceStub;
  let sseServiceStub: SseServiceStub;

  beforeEach(() => {
    listarSubject = new Subject<Bolsillo[]>();
    listarArchivadosSubject = new Subject<Bolsillo[]>();
    crearSubject = new Subject<Bolsillo>();
    abonarSubject = new Subject<Bolsillo>();
    archivarSubject = new Subject<Bolsillo>();
    restaurarSubject = new Subject<Bolsillo>();
    editarSubject = new Subject<Bolsillo>();
    sseSubject = new Subject<SseMensaje>();

    bolsillosServiceStub = {
      listar: vi.fn<BolsillosServiceStub['listar']>(() => listarSubject.asObservable()),
      listarArchivados: vi.fn<BolsillosServiceStub['listarArchivados']>(
        () => listarArchivadosSubject.asObservable()
      ),
      crear: vi.fn<BolsillosServiceStub['crear']>(() => crearSubject.asObservable()),
      abonar: vi.fn<BolsillosServiceStub['abonar']>(() => abonarSubject.asObservable()),
      archivar: vi.fn<BolsillosServiceStub['archivar']>(() => archivarSubject.asObservable()),
      restaurar: vi.fn<BolsillosServiceStub['restaurar']>(() => restaurarSubject.asObservable()),
      editar: vi.fn<BolsillosServiceStub['editar']>(() => editarSubject.asObservable()),
    };
    sseServiceStub = {
      conectar: vi.fn<SseServiceStub['conectar']>(() => sseSubject.asObservable()),
    };

    TestBed.configureTestingModule({
      providers: [
        BolsillosStoreService,
        { provide: BolsillosService, useValue: bolsillosServiceStub },
        { provide: SseService, useValue: sseServiceStub },
      ],
    });

    store = TestBed.inject(BolsillosStoreService);
  });

  it('iniciar_cargaListaYSuscribeAlSse', () => {
    store.iniciar();

    expect(bolsillosServiceStub.listar).toHaveBeenCalledTimes(1);
    expect(sseServiceStub.conectar).toHaveBeenCalledTimes(1);

    listarSubject.next([bolsillo1]);
    listarSubject.complete();

    expect(store.bolsillos()).toEqual([bolsillo1]);
    expect(store.cargando()).toBe(false);
  });

  it('iniciar_dosVeces_noDuplicaLaSuscripcionSse', () => {
    store.iniciar();
    store.iniciar();

    expect(sseServiceStub.conectar).toHaveBeenCalledTimes(1);
  });

  it('iniciar_metaAlcanzada_seteaMetaYActualizaBolsillo', () => {
    store.iniciar();
    listarSubject.next([bolsillo1]);
    listarSubject.complete();

    sseSubject.next({ evento: SSE_EVENTOS.metaAlcanzada, datos: bolsilloCompletado });

    expect(store.metaAlcanzada()).toEqual(bolsilloCompletado);
    expect(store.bolsillos()).toEqual([bolsilloCompletado]);
  });

  it('iniciar_abonoRegistrado_actualizaBolsilloSinMetaAlcanzada', () => {
    store.iniciar();
    listarSubject.next([bolsillo1]);
    listarSubject.complete();

    sseSubject.next({ evento: SSE_EVENTOS.abonoRegistrado, datos: bolsilloActualizado });

    expect(store.bolsillos()).toEqual([bolsilloActualizado]);
    expect(store.metaAlcanzada()).toBeNull();
  });

  it('cerrarMetaAlcanzada_limpiaLaSenal', () => {
    store.iniciar();
    sseSubject.next({ evento: SSE_EVENTOS.metaAlcanzada, datos: bolsilloCompletado });
    expect(store.metaAlcanzada()).not.toBeNull();

    store.cerrarMetaAlcanzada();

    expect(store.metaAlcanzada()).toBeNull();
  });

  it('detener_cancelaLaSuscripcionSse', () => {
    store.iniciar();
    store.detener();

    sseSubject.next({ evento: SSE_EVENTOS.metaAlcanzada, datos: bolsilloCompletado });

    expect(store.metaAlcanzada()).toBeNull();
    expect(store.bolsillos()).toEqual([]);
  });

  it('cargar_error_apagaElIndicadorDeCarga', () => {
    store.cargar();
    expect(store.cargando()).toBe(true);

    listarSubject.error(new Error('boom'));

    expect(store.cargando()).toBe(false);
  });

  it('crear_agregaElBolsilloALaLista', () => {
    store.iniciar();
    listarSubject.next([bolsillo1]);
    listarSubject.complete();

    store.crear({ nombre: 'Computador Gamer', objetivo: 2000 }).subscribe();
    crearSubject.next(bolsilloNuevo);

    expect(store.bolsillos()).toEqual([bolsillo1, bolsilloNuevo]);
  });

  it('abonar_delegaEnElServicioConIdYMonto', () => {
    const recibidos: Bolsillo[] = [];
    store.abonar(1, { monto: 500 }).subscribe((bolsillo) => recibidos.push(bolsillo));

    expect(bolsillosServiceStub.abonar).toHaveBeenCalledWith(1, { monto: 500 });

    abonarSubject.next(bolsilloActualizado);
    expect(recibidos).toEqual([bolsilloActualizado]);
  });

  it('iniciar_cargaTambienLasMetasArchivadas', () => {
    store.iniciar();

    expect(bolsillosServiceStub.listarArchivados).toHaveBeenCalledTimes(1);

    listarArchivadosSubject.next([{ ...bolsillo1, archivado: true }]);
    listarArchivadosSubject.complete();

    expect(store.archivadas().length).toBe(1);
    expect(store.archivadas()[0].archivado).toBe(true);
  });

  it('archivar_mueveLaMetaDeActivasAArchivadas', () => {
    store.iniciar();
    listarSubject.next([bolsilloCompletado]);
    listarSubject.complete();

    store.archivar(1).subscribe();
    archivarSubject.next({ ...bolsilloCompletado, archivado: true });

    expect(bolsillosServiceStub.archivar).toHaveBeenCalledWith(1);
    expect(store.bolsillos()).toEqual([]);
    expect(store.archivadas()).toEqual([{ ...bolsilloCompletado, archivado: true }]);
  });

  it('restaurar_mueveLaMetaDeArchivadasAActivas', () => {
    store.iniciar();
    listarArchivadosSubject.next([{ ...bolsilloCompletado, archivado: true }]);
    listarArchivadosSubject.complete();

    store.restaurar(1).subscribe();
    restaurarSubject.next(bolsilloCompletado);

    expect(bolsillosServiceStub.restaurar).toHaveBeenCalledWith(1);
    expect(store.archivadas()).toEqual([]);
    expect(store.bolsillos()).toEqual([bolsilloCompletado]);
  });

  it('editar_actualizaElBolsilloEnLaLista', () => {
    store.iniciar();
    listarSubject.next([bolsillo1]);
    listarSubject.complete();

    const editado: Bolsillo = { ...bolsillo1, nombre: 'Viaje a Cartagena', objetivo: 1500 };
    store.editar(1, { nombre: 'Viaje a Cartagena', objetivo: 1500 }).subscribe();
    editarSubject.next(editado);

    expect(bolsillosServiceStub.editar).toHaveBeenCalledWith(1, {
      nombre: 'Viaje a Cartagena',
      objetivo: 1500,
    });
    expect(store.bolsillos()).toEqual([editado]);
  });
});