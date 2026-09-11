import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AbonoFormComponent } from './abono-form';

describe('AbonoFormComponent', () => {
  let component: AbonoFormComponent;
  let fixture: ComponentFixture<AbonoFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [AbonoFormComponent] }).compileComponents();

    fixture = TestBed.createComponent(AbonoFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('submit_montoMayorOIgualAUno_emiteAbonarYReseteaElFormulario', () => {
    const spy = vi.fn<(monto: number) => void>();
    component.abonar.subscribe(spy);

    component.form.setValue({ monto: 250 });
    component.submit();

    expect(spy).toHaveBeenCalledWith(250);
    expect(component.form.getRawValue().monto).toBe(0);
  });

  it('submit_montoCero_noEmiteYElFormularioEsInvalido', () => {
    const spy = vi.fn<(monto: number) => void>();
    component.abonar.subscribe(spy);

    component.form.setValue({ monto: 0 });
    expect(component.form.invalid).toBe(true);

    component.submit();

    expect(spy).not.toHaveBeenCalled();
  });

  it('submit_montoVacio_noEmiteYElFormularioEsInvalido', () => {
    const spy = vi.fn<(monto: number) => void>();
    component.abonar.subscribe(spy);

    const input = fixture.nativeElement.querySelector(
      'input[formControlName="monto"]'
    ) as HTMLInputElement;
    input.value = '';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(component.form.invalid).toBe(true);

    component.submit();

    expect(spy).not.toHaveBeenCalled();
  });

  it('errorServidor_input_seMuestraEnElTemplate', () => {
    fixture.componentRef.setInput('errorServidor', 'El monto excede el objetivo');
    fixture.detectChanges();

    const errorEl = fixture.nativeElement.querySelector('.abono-form__error') as HTMLElement;
    expect(errorEl.textContent).toContain('El monto excede el objetivo');
  });

  it('disabled_true_deshabilitaElBotonDeAbonar', () => {
    component.form.setValue({ monto: 100 });
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    const btn = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });

  it('montoInvalidoYTocado_muestraElErrorInline', () => {
    const input = fixture.nativeElement.querySelector(
      'input[formControlName="monto"]'
    ) as HTMLInputElement;
    input.value = '0';
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new Event('blur'));
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('El monto debe ser mayor a $0.');
  });

  it('montoConStep100_lasFlechasIncrementanDeACien', () => {
    const input = fixture.nativeElement.querySelector(
      'input[formControlName="monto"]'
    ) as HTMLInputElement;
    expect(input.step).toBe('100');
  });
});