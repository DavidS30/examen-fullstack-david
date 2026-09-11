---
description: Genera las pruebas para un caso de uso, endpoint o componente dado
agent: test-writer
subtask: true
---

Genera pruebas unitarias/de integración completas y ejecutables para:

$ARGUMENTS

Sigue las reglas del subagente test-writer: cubre camino feliz y todos los casos borde
del flujo de abonos (monto 0, monto negativo, exceso sobre el objetivo, disparo del evento
de meta alcanzada al 100%). Ejecuta las pruebas al terminar y reporta el resultado.
