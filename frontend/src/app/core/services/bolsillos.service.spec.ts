import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { BolsillosService } from './bolsillos.service';
import { environment } from '../../../environments/environment';
import { AbonoRequest, Bolsillo, CrearBolsilloRequest } from '../models/bolsillo.model';

const bolsilloBase: Bolsillo = {
  id: 1,
  nombre: 'Viaje a Cartagena',
  objetivo: 1000,
  acumulado: 250,
  progreso: 25,
  completado: false,
  archivado: false,
};

describe('BolsillosService', () => {
  let service: BolsillosService;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [BolsillosService, provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    service = TestBed.inject(BolsillosService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('listar_llamadaHttpGet_devuelveListaDeBolsillos', () => {
    const esperados: Bolsillo[] = [bolsilloBase];

    service.listar().subscribe((bolsillos) => {
      expect(bolsillos).toEqual(esperados);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/bolsillos`);
    expect(req.request.method).toBe('GET');
    req.flush(esperados);
  });

  it('crear_enviaPostConDatos_devuelveBolsilloCreado', () => {
    const datos: CrearBolsilloRequest = { nombre: 'Computador Gamer', objetivo: 2000 };
    const creado: Bolsillo = { ...bolsilloBase, id: 2, nombre: 'Computador Gamer', objetivo: 2000 };

    service.crear(datos).subscribe((bolsillo) => {
      expect(bolsillo).toEqual(creado);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/bolsillos`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(datos);
    req.flush(creado);
  });

  it('abonar_enviaPostAlEndpointDeAbonos_devuelveBolsilloActualizado', () => {
    const datos: AbonoRequest = { monto: 500 };
    const actualizado: Bolsillo = { ...bolsilloBase, acumulado: 750, progreso: 75 };

    service.abonar(1, datos).subscribe((bolsillo) => {
      expect(bolsillo).toEqual(actualizado);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/bolsillos/1/abonos`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(datos);
    req.flush(actualizado);
  });

  it('listarArchivados_llamadaHttpGet_devuelveSoloArchivadas', () => {
    const archivadas: Bolsillo[] = [{ ...bolsilloBase, archivado: true }];

    service.listarArchivados().subscribe((lista) => {
      expect(lista).toEqual(archivadas);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/bolsillos/archivados`);
    expect(req.request.method).toBe('GET');
    req.flush(archivadas);
  });

  it('archivar_enviaPatchAlEndpointDeArchivar_devuelveBolsilloArchivado', () => {
    const archivada: Bolsillo = { ...bolsilloBase, archivado: true };

    service.archivar(1).subscribe((bolsillo) => {
      expect(bolsillo).toEqual(archivada);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/bolsillos/1/archivar`);
    expect(req.request.method).toBe('PATCH');
    req.flush(archivada);
  });

  it('restaurar_enviaPatchAlEndpointDeRestaurar_devuelveBolsilloActivo', () => {
    service.restaurar(1).subscribe((bolsillo) => {
      expect(bolsillo).toEqual(bolsilloBase);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/bolsillos/1/restaurar`);
    expect(req.request.method).toBe('PATCH');
    req.flush(bolsilloBase);
  });
});