import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotificacionesComponent } from './notificaciones';
import { NotificacionService } from '../../services/notificacion.service';

describe('NotificacionesComponent', () => {
  let component: NotificacionesComponent;
  let fixture: ComponentFixture<NotificacionesComponent>;
  let service: NotificacionService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificacionesComponent],
      providers: [NotificacionService],
    }).compileComponents();

    service = TestBed.inject(NotificacionService);
    fixture = TestBed.createComponent(NotificacionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('render_conNotificaciones_muestraLosMensajes', () => {
    service.exito('Meta creada');
    service.error('El monto excede el objetivo');
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Meta creada');
    expect(el.textContent).toContain('El monto excede el objetivo');
    expect(el.querySelectorAll('.notificacion').length).toBe(2);
  });

  it('cerrar_conClickEnElBoton_eliminaLaNotificacion', () => {
    service.exito('Meta creada');
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const boton = el.querySelector('.notificacion__cerrar') as HTMLButtonElement;
    boton.click();
    fixture.detectChanges();

    expect(el.querySelectorAll('.notificacion').length).toBe(0);
  });
});