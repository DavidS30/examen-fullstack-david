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
- _(completar durante el desarrollo: p.ej. scaffold inicial, DTOs, specs base)_

### Escrito / refactorizado a mano
- Diagnóstico del PDF (la extracción con PyPDF2 era ilegible por codificación de fuente;
  se resolvió con pdfminer.six) y traducción de los requisitos del enunciado a AGENTS.md.
- _(completar: p.ej. reglas de negocio de Money, mapeo de eventos a SSE)_

### Correcciones a la IA (mínimo 2 ejemplos concretos)

1. **Ejemplo 1** — _(qué sugirió la IA, por qué lo rechacé/modifiqué, ej. propuso `any`
   en el modelo TS del evento SSE → lo tipé con la interfaz del evento de dominio)._
2. **Ejemplo 2** — _(ej. colocó la validación de monto dentro del controller → la moví al
   caso de uso para respetar la separación de capas)._
