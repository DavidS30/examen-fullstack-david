# Gobernanza y uso de IA

> Este documento se mantiene **en vivo** durante el desarrollo, no al final.

## 1. Skills / Prompts automatizados

### `/gen-test` — generación de pruebas
- Definido en `.opencode/command/gen-test.md`, delega en el subagente `@test-writer`.
- Uso: `/gen-test RegistrarAbonoUseCase` genera JUnit + Mockito cubriendo camino feliz y
  casos borde (monto 0, negativo, exceso sobre objetivo, evento de meta alcanzada).
- Automatiza una tarea repetitiva (escribir specs con los mismos casos borde) y garantiza
  cobertura consistente del flujo crítico.

### Skills de terceros instaladas con `autoskills`
- `.agents/skills/frontend-design` — dirección estética para el rediseño visual
  (tipografía display, paleta con acento, motion, composición).
- `.agents/skills/accessibility` — auditoría WCAG 2.2 aplicada (skip link, labels,
  `aria-invalid`, focus-visible, `prefers-reduced-motion`, `<dialog>` con focus trap).
- `.agents/skills/seo`, `angular-developer`, `reference-signal-forms`, `vitest`,
  `typescript-advanced-types` y skills de backend (`java-springboot`, `java-docs`,
  `java-coding-standards`) — disponibles como referencia, no todas usadas aún.

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
- Decisión de NO incluir autenticación: el enunciado no la pide y el alcance es cerrado,
  documentada en docs/arquitectura.md.
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

## 4. Iteración de mejoras visuales y accesibilidad

Aplicada tras instalar las skills de `frontend-design` y `accessibility`:

- **Rediseño visual** (guiado por `frontend-design`): tipografía display `Fraunces` +
  cuerpo `DM Sans`, paleta esmeralda con acento ámbar, fondo con gradientes radiales,
  header con logo y stats (total ahorrado / metas completadas), stagger reveal al cargar,
  hover en tarjetas, barra de progreso con glow, empty state ilustrado y modal de confeti
  con partículas CSS.
- **Accesibilidad** (guiado por `accessibility`): skip link, `<label>` asociados a todos los
  inputs, `aria-invalid` en campos inválidos, `aria-label` en el progressbar y estado,
  `focus-visible` global, targets ≥ 44px, `prefers-reduced-motion`, y el modal migrado de un
  `div` a `<dialog>` nativo (focus trap + `Escape` + cierre por backdrop automáticos).
- **Ajuste por test**: jsdom v28 no implementa `showModal()`/`close()`; se añadió un fallback
  defensivo (`setAttribute('open')` / emit directo) que conserva el comportamiento nativo en
  navegadores reales. 39/39 tests siguen en verde.
