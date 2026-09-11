import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Bolsillo } from '../models/bolsillo.model';
import { SSE_EVENTOS, SseEventoNombre, SseMensaje } from '../models/sse-events.model';

@Injectable({ providedIn: 'root' })
export class SseService {
  private readonly sseUrl = `${environment.apiUrl}/notificaciones`;

  conectar(): Observable<SseMensaje> {
    return new Observable<SseMensaje>((subscriber) => {
      const eventSource = new EventSource(this.sseUrl);

      const parsear = (evento: SseEventoNombre) => (e: MessageEvent) => {
        try {
          const datos = JSON.parse(e.data) as Bolsillo;
          subscriber.next({ evento, datos });
        } catch {
          // Payload malformado: se ignora para no romper el stream.
        }
      };

      eventSource.addEventListener(SSE_EVENTOS.abonoRegistrado, parsear(SSE_EVENTOS.abonoRegistrado));
      eventSource.addEventListener(SSE_EVENTOS.metaAlcanzada, parsear(SSE_EVENTOS.metaAlcanzada));

      eventSource.onerror = () => {
        // EventSource reintenta la conexión automáticamente; no cerramos el stream.
      };

      return () => eventSource.close();
    });
  }
}