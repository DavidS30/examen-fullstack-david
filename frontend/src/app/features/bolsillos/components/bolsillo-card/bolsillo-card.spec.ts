import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { BolsilloCardComponent } from './bolsillo-card';
import { BolsillosStoreService } from '../../../../core/services/bolsillos.store';
import { AbonoRequest, Bolsillo } from '../../../../core/models/bolsillo.model';

type BolsillosStoreStub = {
  abonar: (id: number, datos: AbonoRequest) => Observable<Bolsillo>;
};

const bolsillo: Bolsillo = {
  id: 1,
  nombre: 'Viaje a Cartagena',
  objetivo: 1000,
  acumulado: 250,
  progreso: 25,
  completado: false,
};

describe('BolsilloCardComponent', () => {
  let component: BolsilloCardComponent;
  let fixture: ComponentFixture<BolsilloCardComponent>;
  let storeStub: BolsillosStoreStub;
  let abonarMock: ReturnType<typeof vi.fn<BolsillosStoreStub['abonar']>>;

  beforeEach(async () => {
    abonarMock = vi.fn<BolsillosStoreStub['abonar']>();
    storeStub = {
      abonar: abonarMock,
    };

    await TestBed.configureTestingModule({
      imports: [BolsilloCardComponent],
      providers: [{ provide: BolsillosStoreService, useValue: storeStub }],
    }).compileComponents();

    fixture = TestBed.createComponent(BolsilloCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('bolsillo', bolsillo);
    fixture.detectChanges();
  });

  it('render_muestraNombreMontosYProgreso', () => {
    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector('.card__nombre')?.textContent).toContain('Viaje a Cartagena');
    expect(el.querySelector('.card__monto-actual')?.textContent).toContain('250');
    expect(el.querySelector('.card__monto-objetivo')?.textContent).toContain('1,000');
    expect(el.querySelector('.card__progreso')?.textContent).toContain('25%');
  });

  it('abonar_delegaEnElStoreConIdYMonto', () => {
    abonarMock.mockReturnValue(of(bolsillo));

    component.abonar(500);

    expect(abonarMock).toHaveBeenCalledWith(1, { monto: 500 });
  });

  it('abonar_error_muestraElMensajeEnElFormulario', () => {
    abonarMock.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            error: { message: 'El monto excede el objetivo' },
            status: 400,
            statusText: 'Bad Request',
          })
      )
    );

    component.abonar(500);
    fixture.detectChanges();

    const errorEl = fixture.nativeElement.querySelector('.abono-form__error') as HTMLElement;
    expect(errorEl.textContent).toContain('El monto excede el objetivo');
  });

  it('render_bolsilloCompletado_muestraMensajeYNoElFormulario', () => {
    fixture.componentRef.setInput('bolsillo', {
      ...bolsillo,
      acumulado: 1000,
      progreso: 100,
      completado: true,
    });
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('¡Meta alcanzada!');
    expect(el.querySelector('app-abono-form')).toBeNull();
  });
});