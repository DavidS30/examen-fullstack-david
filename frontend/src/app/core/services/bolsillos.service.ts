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

  crear(datos: CrearBolsilloRequest): Observable<Bolsillo> {
    return this.http.post<Bolsillo>(this.apiUrl, datos);
  }

  abonar(id: number, datos: AbonoRequest): Observable<Bolsillo> {
    return this.http.post<Bolsillo>(`${this.apiUrl}/${id}/abonos`, datos);
  }
}