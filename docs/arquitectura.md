# Arquitectura

## Estilo elegido: Hexagonal ligero (Ports & Adapters)

### ¿Por qué esta arquitectura para el caso de negocio?
_(Completar en la sustentación: aísla las reglas de ahorro/abono de los frameworks;
permite testear casos de uso sin Spring ni base de datos; el mismo dominio soportaría
cambiar H2 por Postgres o SSE por WebSocket cambiando solo el adaptador.)_

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
