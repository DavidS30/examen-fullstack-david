# AGENTS.md — Bolsillo de Ahorro Programado

> Contexto de proyecto para agentes de OpenCode. Léelo completo antes de cualquier cambio.
> Estas reglas tienen prioridad sobre comportamientos por defecto del agente.

## 1. Objetivo del proyecto

Aplicación **full stack** para gestión de metas de ahorro ("Bolsillos"). El usuario
puede crear metas, consultar su progreso, registrar abonos y recibir una notificación
distintiva en tiempo real cuando una meta llega al 100%.

Esto es una **prueba técnica** con sustentación en vivo (30 min). El objetivo evaluado
NO es la cantidad de features, sino el **criterio de ingeniería**: separación de
responsabilidades, patrones de diseño, tipado estricto, estrategia de pruebas y la
capacidad de justificar cada decisión y sus trade-offs.

### Historias de usuario (alcance cerrado — no agregar features fuera de esto)

1. **Dashboard de Metas**: listar metas (nombre, monto objetivo, monto acumulado,
   % de progreso) con actualización inmediata al registrar un abono.
2. **Registro de Abonos**: seleccionar una meta y abonarle un valor, con validaciones
   de negocio (monto > 0, no exceder el objetivo).
3. **Procesamiento de Abonos (backend)**: validar, aplicar la regla, persistir y notificar
   el nuevo estado.
4. **Notificación de Meta Alcanzada**: al completar el 100%, emitir un **evento especial**
   que dispare un diálogo/confirmación visual distintiva en la UI.

## 2. Stack técnico (decidido — no cambiar sin justificar en docs/arquitectura.md)

| Capa            | Tecnología                                        |
|-----------------|---------------------------------------------------|
| Backend         | Java 21 + Spring Boot 3                            |
| Persistencia    | H2 en memoria (Spring Data JPA)                    |
| Tiempo real     | SSE nativo (`SseEmitter` / `EventSource`)         |
| Frontend        | Angular (LTS) + Signals + Reactive Forms          |
| Tests backend   | JUnit 5 + Mockito + `@WebMvcTest`/MockMvc         |
| Tests frontend  | Vitest                                             |
| Contenedores    | Docker multi-stage + docker-compose               |

**Sin `packages/` compartido**: Java y TypeScript no comparten runtime. Los contratos se
duplican como DTOs Java (Bean Validation) e interfaces TS espejo. Es una decisión
consciente documentada en `docs/arquitectura.md` (el enunciado la contempla como válida).

## 3. Arquitectura — Hexagonal ligero (Ports & Adapters)

**Regla dura de dependencias**: `domain` ← `application` ← `infrastructure`.
El dominio no depende de nada; la infraestructura depende hacia adentro, nunca al revés.

```
backend/src/main/java/.../
  domain/            Entidades (Bolsillo), Value Objects (Money), reglas puras
  application/       Casos de uso: CrearBolsilloUseCase, RegistrarAbonoUseCase
  application/ports/ Interfaces: BolsilloRepository, NotificadorPort
  infrastructure/
    persistence/     Adaptador JPA que implementa BolsilloRepository
    web/             BolsilloController (REST), NotificacionesController (SSE)
    events/          @EventListener que traduce eventos de dominio a SSE

frontend/src/app/
  features/bolsillos/  dashboard, formulario de abono, modal meta-alcanzada
  core/                servicio SSE (EventSource), cliente HTTP, modelos TS
```

### Prohibiciones de arquitectura (el agente NO debe violarlas)

- `domain/` NO puede importar `org.springframework.*`, `jakarta.persistence.*` ni nada de
  infraestructura. Solo Java puro. (Anotaciones de validación van en los DTOs de `web/`,
  no en las entidades de dominio.)
- `application/` solo conoce interfaces de `application/ports`, nunca clases concretas de
  `infrastructure/`.
- La lógica de negocio vive en `domain/` y `application/`, **nunca** en los controllers.
- En el frontend, la lógica de negocio y el acceso HTTP/SSE viven en servicios de `core/`,
  no en los componentes.

## 4. Patrones de diseño (obligatorio: mínimo 2, implementados explícitamente)

1. **Repository** — `BolsilloRepository` (puerto en `application/ports`) implementado por
   un adaptador que envuelve Spring Data JPA. El caso de uso no conoce JPA directamente.
2. **Observer / Pub-Sub** — el caso de uso publica `AbonoRegistradoEvent` y
   `MetaAlcanzadaEvent` vía `ApplicationEventPublisher`; un `@EventListener` en
   `infrastructure/events` los traduce a mensajes SSE. Desacopla dominio de la notificación.

Opcional si sobra tiempo: **Strategy** para validaciones (`List<AbonoValidationRule>`).

## 5. Reglas de negocio (fuente de verdad)

- Monto del abono debe ser **> 0** (rechazar 0 y negativos).
- Un abono **no puede hacer que `acumulado > objetivo`** (rechazar el exceso).
- Al alcanzar exactamente el 100% (`acumulado == objetivo`), además del evento normal de
  actualización, se emite `MetaAlcanzadaEvent` (dispara el modal distintivo en la UI).
- Monto objetivo de una meta debe ser > 0 al crearla.

## 6. Estándares de código

- **Tipado estricto de punta a punta.**
  - Java: sin raw types, sin `Object` genérico, sin `null` como flujo de control (usar
    `Optional` en puertos). Bean Validation (`@NotNull`, `@Positive`) en los DTOs de entrada.
  - TypeScript: `strict: true`. **Prohibido `any`** salvo justificación técnica en comentario
    en la misma línea (`// eslint-disable ... razón`).
- **Commits incrementales** con mensajes descriptivos (el checklist lo evalúa). Un commit por
  unidad lógica de trabajo, NO un único commit gigante al final.
- Nombres de dominio en español (Bolsillo, Abono, Meta) para alinear con el negocio;
  nombres técnicos en inglés está bien.

## 7. Estrategia de pruebas (obligatoria en backend y frontend)

- **Backend**: tests unitarios de casos de uso y lógica de negocio (JUnit + Mockito con un
  fake in-memory del repositorio) + test de endpoint principal (`@WebMvcTest` + MockMvc).
  Cubrir casos borde: monto 0, monto negativo, abono que excede el objetivo, y el disparo
  del evento de meta alcanzada.
- **Frontend**: Vitest. Tests de componente/servicio para los flujos clave (listado,
  formulario de abono, actualización de estado por SSE).
- Usar el subagente `@test-writer` para generarlos; revisar siempre la salida a mano.

## 8. Gobernanza de IA — mantener `docs/ia.md` en vivo (NO al final)

Cada vez que aceptes o rechaces una sugerencia relevante de la IA, **anótalo en el momento**
en `docs/ia.md`. Ese archivo debe contener:

1. **Skills/Prompts automatizados**: el comando `/gen-test` (`.opencode/command/gen-test.md`).
2. **Agents/Sub-agentes**: `@test-writer` (generación de pruebas) y `@arch-guard` (auditor de
   arquitectura y tipado estricto).
3. **Bitácora de co-creación**: qué generó la IA vs. qué escribiste/corregiste a mano, con
   **mínimo 2 ejemplos concretos** de sugerencias de IA que rechazaste/modificaste y por qué
   (ej. `any` en un DTO, lógica de negocio en un controller, sobre-ingeniería con NgRx).

## 9. Flujo de trabajo esperado del agente

1. Antes de cerrar cada feature, corre `@arch-guard` para validar dependencias y tipado.
2. Genera/actualiza tests con `@test-writer` para el código nuevo.
3. Actualiza `docs/arquitectura.md` y `docs/ia.md` en la misma sesión, no después.
4. Haz commit incremental con mensaje claro.

## 10. Despliegue

- `docker compose up` levanta backend (`:8080`) y frontend (nginx `:80`→`4200`).
- nginx hace `proxy_pass /api/*` al backend para evitar CORS.
- Dockerfiles multi-stage; los tests NO corren dentro del build de imagen (se corren aparte).
- Plan B documentado: servir el build de Angular desde `static/` del jar de Spring (un solo
  contenedor, un solo puerto) como red de seguridad para la demo en vivo.

## 11. Comandos útiles

```bash
# Backend
cd backend && ./mvnw spring-boot:run          # levantar
cd backend && ./mvnw test                     # pruebas

# Frontend
cd frontend && npm start                       # levantar (ng serve)
cd frontend && npm test                        # pruebas headless (vitest run)

# Todo junto
docker compose up --build
```
