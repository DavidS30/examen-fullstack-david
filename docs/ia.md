# Gobernanza y uso de IA

> Este documento se mantiene **en vivo** durante el desarrollo, no al final.

## 1. Skills / Prompts automatizados

### `/gen-test` — generación de pruebas
- Definido en `.opencode/command/gen-test.md`, delega en el subagente `@test-writer`.
- Uso: `/gen-test RegistrarAbonoUseCase` genera JUnit + Mockito cubriendo camino feliz y
  casos borde (monto 0, negativo, exceso sobre objetivo, evento de meta alcanzada).
- Automatiza una tarea repetitiva (escribir specs con los mismos casos borde) y garantiza
  cobertura consistente del flujo crítico.

## 2. Agents / Sub-agentes configurados

| Agente         | Rol                                                    | Permisos     |
|----------------|--------------------------------------------------------|--------------|
| `@test-writer` | Genera y ejecuta pruebas de casos de uso, endpoints y componentes | lectura+escritura |
| `@arch-guard`  | Audita dependencias hexagonales, patrones y tipado estricto | solo lectura |

- `@arch-guard` se ejecuta antes de cerrar cada feature; valida que `domain/` no importe
  Spring/JPA, que no haya lógica en controllers y que no exista `any` sin justificar.

## 3. Bitácora de co-creación

### Generado por IA
- Ajustes de configuración de opencode: eliminación de la definición duplicada de
  `test-writer` y `arch-guard` en `opencode.json` (quedaron solo en `.opencode/agent/*.md`)
  y migración de la clave deprecated `tools` a `permission`.
- Decisión de stack frontend: Vitest en lugar de
  Jasmine + Karma del AGENTS.md original; se justificó en docs/arquitectura.md.
- **Scaffold completo backend**: dominio, casos de uso, adaptadores JPA/REST/SSE.
- **49 tests backend** generados por `@test-writer` (fake in-memory del repositorio,
  `@WebMvcTest` + MockMvc) y **39 tests frontend** (Vitest + TestBed), todos verificados
  a mano y ejecutados hasta quedar en verde.

### Escrito / refactorizado a mano
- Diagnóstico del PDF (la extracción con PyPDF2 era ilegible por codificación de fuente;
  se resolvió con pdfminer.six) y traducción de los requisitos del enunciado a AGENTS.md.
- Decisión de NO reutilizar login/JWT ni PostgreSQL (alcance
  cerrado del enunciado), documentada en docs/arquitectura.md.
- **Refactor del frontend tras la auditoría**: `AbonoFormComponent` dejó de recibir el error
  por un `viewChild` imperativo y pasó a recibirlo como input declarativo; el store ahora
  aplica la respuesta HTTP del abono como fallback idempotente ante caídas de SSE.

### Correcciones a la IA (mínimo 2 ejemplos concretos)

1. **Validación de monto cero en el dominio** — `@arch-guard` detectó que `Bolsillo.abonar()`
   no rechazaba abonos de 0 (solo la validación Bean Validation `@Positive` del DTO web lo
   hacía). La IA había dejado la regla solo en el borde; la corregí añadiendo
   `signum() <= 0 → MontoInvalidoException` en el agregado (`Bolsillo.java`). Razón: la regla
   de negocio debe vivir en el dominio, no depender de la capa web (defensa en profundidad).
2. **Tipado laxo en el adaptador SSE** — `SseEmitterRegistry.enviar` recibía `Object`.
   La IA lo dejó genérico; lo tipé a `BolsilloResponse` (el único payload emitido) y
   `GlobalExceptionHandler` pasó de `Map<String, Object>` a un `record ErrorResponse`.
   Razón: tipado estricto de punta a punta, sin `Object` como atajo (regla de AGENTS.md).
3. **Dependencia de la UI del SSE** — la primera versión del `BolsillosStoreService` ignoraba
   la respuesta HTTP del abono y la UI dependía 100% del evento SSE. Lo modifiqué para aplicar
   `tap(actualizarBolsillo)` como fallback: si la conexión SSE cae y reconecta (EventSource
   pierde eventos del gap), la UI no queda desactualizada.
