import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BienvenidaModalComponent } from './bienvenida-modal';

describe('BienvenidaModalComponent', () => {
  let component: BienvenidaModalComponent;
  let fixture: ComponentFixture<BienvenidaModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [BienvenidaModalComponent] }).compileComponents();

    fixture = TestBed.createComponent(BienvenidaModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('render_muestraElTituloPorDefectoYElBotonEmpezar', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('¿Cómo te llamas?');
    expect(el.textContent).toContain('Empezar');
  });

  it('empezar_nombreCorto_noEmite', () => {
    const spy = vi.fn<(nombre: string) => void>();
    component.guardarNombre.subscribe(spy);

    component.form.setValue({ nombre: 'a' });
    expect(component.form.invalid).toBe(true);

    component.empezar();

    expect(spy).not.toHaveBeenCalled();
  });

  it('empezar_nombreValido_emiteConTrim', () => {
    const spy = vi.fn<(nombre: string) => void>();
    component.guardarNombre.subscribe(spy);

    component.form.setValue({ nombre: '  Ana  ' });
    component.empezar();

    expect(spy).toHaveBeenCalledWith('Ana');
  });

  it('nombreInicial_precargaElCampo', () => {
    fixture.componentRef.setInput('nombreInicial', 'Ana');
    component.ngOnInit();

    expect(component.form.getRawValue().nombre).toBe('Ana');
  });

  it('permitirCancelar_muestraElBotonYEmiteAlClic', () => {
    fixture.componentRef.setInput('permitirCancelar', true);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const boton = Array.from(el.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Cancelar')
    );
    expect(boton).toBeDefined();

    const spy = vi.fn();
    component.cancelar.subscribe(spy);
    boton?.click();

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('sinPermitirCancelar_noMuestraElBotonCancelar', () => {
    const el = fixture.nativeElement as HTMLElement;
    const boton = Array.from(el.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Cancelar')
    );
    expect(boton).toBeUndefined();
  });
});