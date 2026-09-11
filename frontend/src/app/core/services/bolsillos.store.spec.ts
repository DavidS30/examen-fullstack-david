import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Observable, Subject } from 'rxjs';
import { BolsillosStoreService } from './bolsillos.store';
import { BolsillosService } from './bolsillos.service';
import { SseService } from './sse.service';
import { AbonoRequest, Bolsillo, CrearBolsilloRequest } from '../models/bolsillo.model';
import { SSE_EVENTOS, SseMensaje } from '../models/sse-events.model';

type BolsillosServiceStub = {
  listar: () => Observable<Bolsillo[]>;
  crear: (datos: CrearBolsilloRequest) => Observable<Bolsillo>;
  abonar: (id: number, datos: AbonoRequest) => Observable<Bolsillo>;
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
};

const bolsilloActualizado: Bolsillo = {
  id: 1,
  nombre: 'Viaje a Cartagena',
  objetivo: 1000,
  acumulado: 750,
  progreso: 75,
  completado: false,
};

const bolsilloCompletado: Bolsillo = {
  id: 1,
  nombre: 'Viaje a Cartagena',
  objetivo: 1000,
  acumulado: 1000,
  progreso: 100,
  completado: true,
};

const bolsilloNuevo: Bolsillo = {
  id: 2,
  nombre: 'Computador Gamer',
  objetivo: 2000,
  acumulado: 0,
  progreso: 0,
  completado: false,
};

describe('BolsillosStoreService', () => {
  let store: BolsillosStoreService;
  let listarSubject: Subject<Bolsillo[]>;
  let crearSubject: Subject<Bolsillo>;
  let abonarSubject: Subject<Bolsillo>;
  let sseSubject: Subject<SseMensaje>;
  let bolsillosServiceStub: BolsillosServiceStub;
  let sseServiceStub: SseServiceStub;

  beforeEach(() => {
    listarSubject = new Subject<Bolsillo[]>();
    crearSubject = new Subject<Bolsillo>();
    abonarSubject = new Subject<Bolsillo>();
    sseSubject = new Subject<SseMensaje>();

    bolsillosServiceStub = {
      listar: vi.fn<BolsillosServiceStub['listar']>(() => listarSubject.asObservable()),
      crear: vi.fn<BolsillosServiceStub['crear']>(() => crearSubject.asObservable()),
      abonar: vi.fn<BolsillosServiceStub['abonar']>(() => abonarSubject.asObservable()),
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
});