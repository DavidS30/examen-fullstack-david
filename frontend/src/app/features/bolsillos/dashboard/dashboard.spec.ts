import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Signal, WritableSignal, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { DashboardPage } from './dashboard';
import { BolsillosStoreService } from '../../../core/services/bolsillos.store';
import { UsuarioService } from '../../../core/services/usuario.service';
import { AbonoRequest, Bolsillo, CrearBolsilloRequest } from '../../../core/models/bolsillo.model';

type DashboardStoreStub = {
  bolsillos: Signal<Bolsillo[]>;
  cargando: Signal<boolean>;
  errorCarga: Signal<string | null>;
  metaAlcanzada: Signal<Bolsillo | null>;
  iniciar: () => void;
  detener: () => void;
  crear: (datos: CrearBolsilloRequest) => Observable<Bolsillo>;
  abonar: (id: number, datos: AbonoRequest) => Observable<Bolsillo>;
  cerrarMetaAlcanzada: () => void;
};

type UsuarioServiceStub = {
  nombre: Signal<string | null>;
  guardar: (nombre: string) => void;
  cambiar: () => void;
};

const bolsillo1: Bolsillo = {
  id: 1,
  nombre: 'Viaje a Cartagena',
  objetivo: 1000,
  acumulado: 250,
  progreso: 25,
  completado: false,
};

const bolsillo2: Bolsillo = {
  id: 2,
  nombre: 'Computador Gamer',
  objetivo: 2000,
  acumulado: 0,
  progreso: 0,
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

describe('DashboardPage', () => {
  let component: DashboardPage;
  let fixture: ComponentFixture<DashboardPage>;
  let storeStub: DashboardStoreStub;
  let bolsillosSignal: WritableSignal<Bolsillo[]>;
  let cargandoSignal: WritableSignal<boolean>;
  let errorCargaSignal: WritableSignal<string | null>;
  let metaAlcanzadaSignal: WritableSignal<Bolsillo | null>;
  let nombreUsuarioSignal: WritableSignal<string | null>;
  let usuarioStub: UsuarioServiceStub;

  beforeEach(async () => {
    bolsillosSignal = signal<Bolsillo[]>([]);
    cargandoSignal = signal(false);
    errorCargaSignal = signal<string | null>(null);
    metaAlcanzadaSignal = signal<Bolsillo | null>(null);
    nombreUsuarioSignal = signal<string | null>(null);

    storeStub = {
      bolsillos: bolsillosSignal.asReadonly(),
      cargando: cargandoSignal.asReadonly(),
      errorCarga: errorCargaSignal.asReadonly(),
      metaAlcanzada: metaAlcanzadaSignal.asReadonly(),
      iniciar: vi.fn(),
      detener: vi.fn(),
      crear: vi.fn<DashboardStoreStub['crear']>(() => of(bolsillo1)),
      abonar: vi.fn<DashboardStoreStub['abonar']>(() => of(bolsillo1)),
      cerrarMetaAlcanzada: vi.fn(),
    };

    usuarioStub = {
      nombre: nombreUsuarioSignal.asReadonly(),
      guardar: vi.fn<UsuarioServiceStub['guardar']>((nombre) => nombreUsuarioSignal.set(nombre)),
      cambiar: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [DashboardPage],
      providers: [
        { provide: BolsillosStoreService, useValue: storeStub },
        { provide: UsuarioService, useValue: usuarioStub },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('ngOnInit_iniciaElStore', () => {
    expect(storeStub.iniciar).toHaveBeenCalledTimes(1);
  });

  it('render_conMetas_muestraLosNombresEnLasCards', () => {
    bolsillosSignal.set([bolsillo1, bolsillo2]);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelectorAll('app-bolsillo-card').length).toBe(2);
    expect(el.textContent).toContain('Viaje a Cartagena');
    expect(el.textContent).toContain('Computador Gamer');
  });

  it('render_sinBolsillos_muestraElEmptyState', () => {
    cargandoSignal.set(false);
    bolsillosSignal.set([]);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Aún no tienes metas');
  });

  it('crearBolsillo_formValido_llamaAlStoreConLosDatos', () => {
    component.crearForm.setValue({ nombre: 'Viaje a Cartagena', objetivo: 1000 });
    component.crearBolsillo();

    expect(storeStub.crear).toHaveBeenCalledWith({ nombre: 'Viaje a Cartagena', objetivo: 1000 });
  });

  it('crearBolsillo_botonConFormValido_llamaAlStore', () => {
    const el = fixture.nativeElement as HTMLElement;
    const nombreInput = el.querySelector('input[formControlName="nombre"]') as HTMLInputElement;
    const objetivoInput = el.querySelector('input[formControlName="objetivo"]') as HTMLInputElement;

    nombreInput.value = 'Viaje a Cartagena';
    nombreInput.dispatchEvent(new Event('input'));
    objetivoInput.value = '1000';
    objetivoInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const form = el.querySelector('form.crear-form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));

    expect(storeStub.crear).toHaveBeenCalledWith({ nombre: 'Viaje a Cartagena', objetivo: 1000 });
  });

  it('crearBolsillo_formInvalido_noLlamaAlStore', () => {
    component.crearForm.setValue({ nombre: 'ab', objetivo: 0 });
    component.crearBolsillo();

    expect(storeStub.crear).not.toHaveBeenCalled();
  });

  it('render_metaAlcanzadaDistintaDeNull_muestraElModal', () => {
    metaAlcanzadaSignal.set(bolsilloCompletado);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('app-meta-alcanzada-modal')).not.toBeNull();
    expect(el.textContent).toContain('¡Meta alcanzada!');
  });

  it('cerrarModal_llamaAlStoreParaLimpiarLaMeta', () => {
    component.cerrarModal();

    expect(storeStub.cerrarMetaAlcanzada).toHaveBeenCalledTimes(1);
  });

  it('ngOnDestroy_detieneElStore', () => {
    fixture.destroy();

    expect(storeStub.detener).toHaveBeenCalledTimes(1);
  });

  it('render_sinNombre_muestraElModalDeBienvenida', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('app-bienvenida-modal')).not.toBeNull();
  });

  it('render_conNombre_muestraElSaludoYOcultaElModal', () => {
    nombreUsuarioSignal.set('Ana');
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Hola, Ana');
    expect(el.querySelector('app-bienvenida-modal')).toBeNull();
  });

  it('cambiarUsuario_abreElModalEnModoEdicionConElNombrePrecargado', () => {
    nombreUsuarioSignal.set('Ana');
    fixture.detectChanges();

    component.cambiarUsuario();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const modal = el.querySelector('app-bienvenida-modal');
    expect(modal).not.toBeNull();
    expect(el.textContent).toContain('Guardar');
  });

  it('guardarNombre_guardaEnElServicioYCierraElModal', () => {
    fixture.detectChanges();

    component.guardarNombre('Ana');
    fixture.detectChanges();

    expect(usuarioStub.guardar).toHaveBeenCalledWith('Ana');
    expect(fixture.nativeElement.querySelector('app-bienvenida-modal')).toBeNull();
  });
});