# Bitácora de IA

Formato: fecha · propósito · evidencia (archivos/commits) · validación (cómo se comprobó) · decisión (qué se aceptó, cambió o descartó).

| Fecha | Propósito | Evidencia | Validación | Decisión |
|---|---|---|---|---|
| 2026-11-16 | Diseñar la configuración de IA (reglas, permisos, hooks) antes de escribir código | `CLAUDE.md`, `.claude/`, `ia/` (primer commit) | `npm run test:ia` en verde; prueba manual del hook con exit 2 | Se aceptó; se añadió un hook propio además de `deny` porque los patrones de `deny` no cubren comandos de shell arbitrarios |

> Agregue una fila por cada uso relevante de la IA. Indique lo que **no** aceptó y por qué.
