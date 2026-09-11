import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MetaAlcanzadaModalComponent } from './meta-alcanzada-modal';
import { Bolsillo } from '../../../../core/models/bolsillo.model';

const bolsilloCompletado: Bolsillo = {
  id: 1,
  nombre: 'Viaje a Cartagena',
  objetivo: 1000,
  acumulado: 1000,
  progreso: 100,
  completado: true,
  archivado: false,
};

describe('MetaAlcanzadaModalComponent', () => {
  let component: MetaAlcanzadaModalComponent;
  let fixture: ComponentFixture<MetaAlcanzadaModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [MetaAlcanzadaModalComponent] }).compileComponents();

    fixture = TestBed.createComponent(MetaAlcanzadaModalComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('bolsillo', bolsilloCompletado);
    fixture.detectChanges();
  });

  it('render_muestraTituloYNombreDelBolsillo', () => {
    const el = fixture.nativeElement as HTMLElement;

    expect(el.textContent).toContain('¡Meta alcanzada!');
    expect(el.textContent).toContain('Viaje a Cartagena');
  });

  it('cerrar_alHacerClickEnElBoton_emiteElEvento', () => {
    const spy = vi.fn();
    component.cerrar.subscribe(spy);

    const btn = fixture.nativeElement.querySelector('.modal__btn') as HTMLButtonElement;
    btn.click();

    expect(spy).toHaveBeenCalledTimes(1);
  });
});