# Bitácora de IA

Formato: fecha · propósito · evidencia (archivos/commits) · validación (cómo se comprobó) · decisión (qué se aceptó, cambió o descartó).

| Fecha | Propósito | Evidencia | Validación | Decisión |
|---|---|---|---|---|
| 2026-11-16 | Diseñar la configuración de IA (reglas, permisos, hooks) antes de escribir código | `AGENTS.md`, `ia/` (primer commit) | `npm run test:ia` en verde; prueba manual del hook con exit 2 | Se aceptó; se añadió un hook propio además de `deny` porque los patrones de `deny` no cubren comandos de shell arbitrarios |

| 2026-11-16 | Corregir la API caída en Vercel (`ERR_REQUIRE_ESM` al cargar `firebase-admin/auth`) | `package.json` (`overrides` de `jose`) | Reproducido en local con `node --no-experimental-require-module`; producción respondió 200/401 tras el cambio | Se aceptó; se eligió forzar `jose@5` solo para `jwks-rsa` en vez de bajar de versión `firebase-admin` |
| 2026-11-16 | Corregir el despliegue fallido «Firestore has already been initialized» | `src/lib/firebase/admin.ts` | `next build` local con Firebase real y despliegue en estado READY | Se aceptó; se quitó `settings()`, que no aportaba nada |
| 2026-11-16 | Detectar visualmente el botón «Menú» visible en escritorio | `Encabezado.module.css`, prueba e2e | Capturas de Playwright y nueva aserción por ancho | Se aceptó |
| 2026-11-17 | Hacer genérica la configuración de IA (sin nombres de una herramienta concreta) | `AGENTS.md`, `ia/permisos.json`, `ia/hooks/`, `ia/instalar.mjs` | `npm run test:ia` en verde | Se aceptó por decisión del estudiante |
| 2026-11-17 | Temas visuales, íconos, menú, filtro, galería con visor y capturas ficticias de proyectos | `src/lib/temas.ts`, `SelectorTema`, `IconoTecnologia`, `FiltroProyectos`, `Galeria`, `scripts/generar-imagenes.mjs` | 76 pruebas Vitest y 29 de Playwright en verde, incluido axe con contraste en los 5 temas; revisión visual de capturas | Se aceptó; se corrigieron los números visibles en la ruta de navegación y las capturas son ilustrativas, no de proyectos reales |

> Agregue una fila por cada uso relevante de la IA. Indique lo que **no** aceptó y por qué.
