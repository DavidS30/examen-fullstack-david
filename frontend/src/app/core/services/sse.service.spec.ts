import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { SseService } from './sse.service';
import { environment } from '../../../environments/environment';
import { Bolsillo } from '../models/bolsillo.model';
import { SSE_EVENTOS, SseMensaje } from '../models/sse-events.model';

type SseListener = (event: MessageEvent) => void;

/**
 * Fake de EventSource para jsdom (no existe en el entorno de pruebas).
 * Permite inspeccionar la URL, despachar eventos y verificar el cierre.
 */
class FakeEventSource {
  private static readonly instancias: FakeEventSource[] = [];

  readonly url: string;
  readonly listeners = new Map<string, SseListener[]>();
  onerror: ((event: Event) => void) | null = null;
  cerrado = false;

  constructor(url: string) {
    this.url = url;
    FakeEventSource.instancias.push(this);
  }

  static ultimaInstancia(): FakeEventSource {
    const ultima = FakeEventSource.instancias.at(-1);
    if (ultima === undefined) {
      throw new Error('No se creó ninguna instancia de EventSource');
    }
    return ultima;
  }

  static reset(): void {
    FakeEventSource.instancias.length = 0;
  }

  addEventListener(tipo: string, listener: SseListener): void {
    const actuales = this.listeners.get(tipo) ?? [];
    actuales.push(listener);
    this.listeners.set(tipo, actuales);
  }

  emitir(tipo: string, datos: string): void {
    const evento = new MessageEvent(tipo, { data: datos });
    for (const listener of this.listeners.get(tipo) ?? []) {
      listener(evento);
    }
  }

  close(): void {
    this.cerrado = true;
  }
}

const bolsillo: Bolsillo = {
  id: 1,
  nombre: 'Viaje a Cartagena',
  objetivo: 1000,
  acumulado: 1000,
  progreso: 100,
  completado: true,
};

describe('SseService', () => {
  let service: SseService;
  let eventSourceOriginal: typeof EventSource;

  beforeEach(() => {
    eventSourceOriginal = globalThis.EventSource;
    globalThis.EventSource = FakeEventSource as unknown as typeof EventSource;
    FakeEventSource.reset();

    TestBed.configureTestingModule({ providers: [SseService] });
    service = TestBed.inject(SseService);
  });

  afterEach(() => {
    globalThis.EventSource = eventSourceOriginal;
  });

  it('conectar_creaEventSourceConUrlYEscuchaMetaAlcanzada_emiteSseMensaje', () => {
    const mensajes: SseMensaje[] = [];
    const sub = service.conectar().subscribe((mensaje) => mensajes.push(mensaje));

    const fake = FakeEventSource.ultimaInstancia();
    expect(fake.url).toBe(`${environment.apiUrl}/notificaciones`);

    fake.emitir(SSE_EVENTOS.metaAlcanzada, JSON.stringify(bolsillo));

    expect(mensajes).toEqual([{ evento: SSE_EVENTOS.metaAlcanzada, datos: bolsillo }]);
    sub.unsubscribe();
  });

  it('conectar_escuchaAbonoRegistrado_emiteSseMensaje', () => {
    const mensajes: SseMensaje[] = [];
    const sub = service.conectar().subscribe((mensaje) => mensajes.push(mensaje));

    const fake = FakeEventSource.ultimaInstancia();
    fake.emitir(SSE_EVENTOS.abonoRegistrado, JSON.stringify(bolsillo));

    expect(mensajes).toEqual([{ evento: SSE_EVENTOS.abonoRegistrado, datos: bolsillo }]);
    sub.unsubscribe();
  });

  it('conectar_alDesuscribirse_cierraElEventSource', () => {
    const sub = service.conectar().subscribe();
    const fake = FakeEventSource.ultimaInstancia();

    sub.unsubscribe();

    expect(fake.cerrado).toBe(true);
  });
});