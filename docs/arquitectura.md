# Arquitectura

## Estilo elegido: Hexagonal ligero (Ports & Adapters)

### ¿Por qué esta arquitectura para el caso de negocio?
Aísla las reglas de ahorro/abono (monto > 0, no exceder el objetivo, 100%) de los frameworks:
- El dominio (`Bolsillo`, `Money`) es Java puro y testeable sin Spring ni base de datos.
- Los casos de uso (`application/`) solo conocen puertos (`BolsilloRepository`,
  `NotificadorPort`), nunca JPA ni `SseEmitter`; se registran como `@Bean` en
  `infrastructure/config/UseCaseConfig`, por lo que la capa application no importa Spring.
- Cambiar H2 por Postgres, o SSE por WebSocket, requiere tocar solo el adaptador
  (`infrastructure/`). Para una demo de horas esto permite defender el aislamiento de reglas
  sin el boilerplate de una Clean Architecture de 4 capas.

### Alternativas descartadas y trade-offs
- **Clean Architecture completa (4 capas + mappers)**: más pura pero más boilerplate;
  bajo el tiempo de la prueba no aporta valor evaluable adicional. Trade-off:
  velocidad de entrega sobre pureza ceremonial.
- **Monolito por capas (controller/service/repository plano)**: más rápido aún, pero
  acopla dominio a Spring y dificulta justificar el aislamiento de reglas.
- **NgRx en frontend**: sobre-ingeniería para este alcance; Angular Signals cubre el
  estado reactivo de forma idiomática y con menos código.
- **Jasmine + Karma como runner de tests frontend**: Karma ya no es el runner por defecto
  de Angular moderno y es más lento. Se eligió **Vitest** , reduciendo curva y acelerando el loop de pruebas. Trade-off:
  nos alejamos del default histórico del CLI, pero el enunciado solo exige "pruebas
  unitarias o de componentes ejecutables".


### Aislamiento de reglas de negocio
- `domain/` es Java puro (sin `org.springframework.*` ni JPA).
- `application/` orquesta el dominio a través de puertos (interfaces).
- `infrastructure/` implementa los puertos (JPA, SSE, REST).

## Patrones de diseño aplicados
1. **Repository** — `BolsilloRepository` (puerto) + adaptador JPA.
2. **Observer / Pub-Sub** — `ApplicationEventPublisher` publica `AbonoRegistradoEvent` y
   `MetaAlcanzadaEvent`; un `@EventListener` los traduce a SSE.
3. _(Opcional)_ **Strategy** — reglas de validación de abono como `List<AbonoValidationRule>`.

## Comunicación y estado reactivo
- Abonos: REST `POST /api/bolsillos/{id}/abonos`.
- Push servidor→cliente: **SSE** (`SseEmitter` / `EventSource`). Elegido sobre WebSocket
 porque la comunicación aquí es unidireccional; menos piezas = menos riesgo en la demo.
- Frontend: `signal<Bolsillo[]>` actualizado por el servicio SSE; el evento de meta
  alcanzada dispara un modal distintivo.

## Recurso compartido (packages/)
Se decidió **no** usar un paquete compartido: Java y TypeScript no comparten runtime, y
generar contratos cross-lenguaje (OpenAPI codegen) consumiría tiempo sin valor para un
demo de horas. Los contratos se duplican como DTOs Java (Bean Validation) e interfaces TS
espejo. El enunciado contempla explícitamente esta opción como válida.

## Trade-offs asumidos (conscientes y defendibles)

- **Sin transacciones explícitas en el flujo read-modify-write del abono**: el caso de uso
  hace `findById` + `save` en transacciones separadas. En concurrencia real habría riesgo
  de *lost update*; se aceptó porque H2 es single-user y el alcance es una demo. Mitigarlo
  (envolver el caso de uso en `@Transactional`) habría añadido un puerto de transacciones a
  la capa application, sobre-ingeniería para este contexto.
- **SSE sobre WebSocket**: comunicación unidireccional servidor→cliente; menos piezas.
  Si la conexión cae, `EventSource` reconecta; el frontend usa además la respuesta HTTP del
  abono como fallback idempotente (el payload SSE y el HTTP traen el mismo estado).
- **Sin Lombok/MapStruct**: se prefirió código explícito (records + getters a mano) para que
  el evaluador lea el flujo sin anotaciones mágicas; el costo de boilerplate es bajo.
