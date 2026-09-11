import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditarMetaModalComponent } from './editar-meta-modal';
import { Bolsillo } from '../../../../core/models/bolsillo.model';

const bolsillo: Bolsillo = {
  id: 1,
  nombre: 'Vacaciones',
  objetivo: 1000,
  acumulado: 250,
  progreso: 25,
  completado: false,
  archivado: false,
};

describe('EditarMetaModalComponent', () => {
  let component: EditarMetaModalComponent;
  let fixture: ComponentFixture<EditarMetaModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [EditarMetaModalComponent] }).compileComponents();

    fixture = TestBed.createComponent(EditarMetaModalComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('bolsillo', bolsillo);
    fixture.detectChanges();
  });

  it('inicial_precargaNombreYObjetivo', () => {
    expect(component.form.getRawValue().nombre).toBe('Vacaciones');
    expect(component.form.getRawValue().objetivo).toBe(1000);
  });

  it('enviar_formValido_emiteDatosConTrim', () => {
    const spy = vi.fn<(datos: { nombre: string; objetivo: number }) => void>();
    component.guardar.subscribe(spy);

    component.form.setValue({ nombre: ' Viaje a Cartagena ', objetivo: 1500 });
    component.enviar();

    expect(spy).toHaveBeenCalledWith({ nombre: 'Viaje a Cartagena', objetivo: 1500 });
  });

  it('enviar_objetivoCero_noEmite', () => {
    const spy = vi.fn();
    component.guardar.subscribe(spy);

    component.form.setValue({ nombre: 'Vacaciones', objetivo: 0 });
    expect(component.form.invalid).toBe(true);

    component.enviar();

    expect(spy).not.toHaveBeenCalled();
  });

  it('cancelar_conClicEnElBoton_emiteCancelar', () => {
    const spy = vi.fn();
    component.cancelar.subscribe(spy);

    const el = fixture.nativeElement as HTMLElement;
    const boton = Array.from(el.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Cancelar')
    ) as HTMLButtonElement;
    boton.click();

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('errorServidor_input_muestraElMensajeInline', () => {
    fixture.componentRef.setInput(
      'errorServidor',
      'El nuevo objetivo no puede ser menor que lo ya ahorrado'
    );
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'El nuevo objetivo no puede ser menor que lo ya ahorrado'
    );
  });

  it('cambioDeValorEnElForm_emiteCambio', () => {
    const spy = vi.fn();
    component.cambio.subscribe(spy);

    component.form.controls.objetivo.setValue(2000);

    expect(spy).toHaveBeenCalled();
  });
});