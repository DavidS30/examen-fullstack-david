import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Bolsillo, CrearBolsilloRequest, AbonoRequest } from '../models/bolsillo.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class BolsillosService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/bolsillos`;

  listar(): Observable<Bolsillo[]> {
    return this.http.get<Bolsillo[]>(this.apiUrl);
  }

  listarArchivados(): Observable<Bolsillo[]> {
    return this.http.get<Bolsillo[]>(`${this.apiUrl}/archivados`);
  }

  crear(datos: CrearBolsilloRequest): Observable<Bolsillo> {
    return this.http.post<Bolsillo>(this.apiUrl, datos);
  }

  abonar(id: number, datos: AbonoRequest): Observable<Bolsillo> {
    return this.http.post<Bolsillo>(`${this.apiUrl}/${id}/abonos`, datos);
  }

  archivar(id: number): Observable<Bolsillo> {
    return this.http.patch<Bolsillo>(`${this.apiUrl}/${id}/archivar`, null);
  }

  restaurar(id: number): Observable<Bolsillo> {
    return this.http.patch<Bolsillo>(`${this.apiUrl}/${id}/restaurar`, null);
  }
}