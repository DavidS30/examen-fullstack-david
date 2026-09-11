# Bolsillo de Ahorro Programado

Prueba técnica full stack: aplicación para crear **metas de ahorro ("Bolsillos")**, registrar
abonos con validaciones de negocio y recibir notificación en tiempo real cuando una meta
llega al 100%.

> Repositorio público + sustentación en vivo. Evaluación de **criterio de ingeniería**:
> separación de responsabilidades, patrones de diseño, tipado estricto y estrategia de pruebas.
> Documentación de arquitectura y gobernanza de IA en [`docs/`](docs/).

## Stack

| Capa          | Tecnología                                        |
|---------------|---------------------------------------------------|
| Backend       | Java 21 + Spring Boot 3.2.5                       |
| Persistencia  | H2 en memoria (Spring Data JPA)                   |
| Tiempo real   | SSE nativo (`SseEmitter` / `EventSource`)         |
| Frontend      | Angular 21 + Signals + Reactive Forms             |
| Tests backend | JUnit 5 + Mockito + `@WebMvcTest`/MockMvc (49)    |
| Tests frontend| Vitest + TestBed (39)                             |
| Contenedores  | Docker multi-stage + docker-compose               |

## Estructura

```
backend/    API hexagonal (domain ← application ← infrastructure)
frontend/   App Angular (core/ + features/bolsillos/)
docs/
  arquitectura.md   Justificación, patrones y trade-offs
  ia.md             Gobernanza de IA (skills, agentes, bitácora)
```

## Cómo ejecutar

### Opción 1 — Docker (todo junto)

```bash
docker compose up --build
# Frontend: http://localhost        (nginx sirve el build + proxy /api)
# Backend:  http://localhost:8080   (H2 en memoria, consola en /h2-console)
```

Los tests **no** corren dentro del build de imagen (se ejecutan aparte).

### Opción 2 — Local (desarrollo)

```bash
# Backend (puerto 8080)
cd backend && ./mvnw spring-boot:run

# Frontend (puerto 4200, proxy /api → 8080)
cd frontend && npm install && npm start
```

## Cómo correr las pruebas

```bash
cd backend && ./mvnw test        # 49 tests backend
cd frontend && npm test          # 39 tests frontend (vitest run)
```

## Endpoints principales

| Método | Ruta                             | Descripción                          |
|--------|----------------------------------|--------------------------------------|
| GET    | `/api/bolsillos`                 | Lista metas activas                   |
| GET    | `/api/bolsillos/archivados`      | Lista metas archivadas               |
| POST   | `/api/bolsillos`                 | Crea una meta (nombre, objetivo)     |
| POST   | `/api/bolsillos/{id}/abonos`     | Abona a una meta (monto)             |
| PATCH  | `/api/bolsillos/{id}/archivar`   | Archiva una meta completada          |
| PATCH  | `/api/bolsillos/{id}/restaurar`  | Restaura una meta archivada          |
| PATCH  | `/api/bolsillos/{id}`            | Edita nombre/objetivo de una meta    |
| GET    | `/api/notificaciones`            | Stream SSE de eventos en tiempo real |

Eventos SSE: `abono-registrado` y `meta-alcanzada` (payload = estado actualizado del bolsillo).

## Reglas de negocio

- Monto del abono **> 0** (se rechazan 0 y negativos).
- Un abono **no puede hacer que `acumulado > objetivo`**.
- Al llegar exactamente al 100% se emite el evento especial `meta-alcanzada`, que dispara
  el modal distintivo en la UI.

## Arquitectura y patrones

Hexagonal ligero (Ports & Adapters): el dominio es Java puro, los casos de uso solo conocen
puertos y la infraestructura (JPA, REST, SSE) mira hacia adentro. Patrones implementados:
**Repository** y **Observer/Pub-Sub** (eventos de dominio → SSE). Justificación completa y
trade-offs en [`docs/arquitectura.md`](docs/arquitectura.md).

## Gobernanza de IA

Skills (`/gen-test`) y agentes (`@test-writer`, `@arch-guard`) configurados en `.opencode/`,
con bitácora de co-creación y correcciones a la IA en [`docs/ia.md`](docs/ia.md).