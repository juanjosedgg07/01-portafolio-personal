# Configuración de IA del proyecto (sección 15)

La configuración es **genérica y versionada**: reglas en `AGENTS.md` y permisos, hooks y política en `ia/`.
Cada asistente de IA lee su configuración desde rutas propias; `ia/instalar.mjs` las genera localmente
a partir de estos archivos y las excluye de Git (`.git/info/exclude`).

| Pieza | Archivo | Qué hace |
|---|---|---|
| Reglas del proyecto | `AGENTS.md` | Stack, comandos, estructura, lo que sí y lo que no. |
| Permisos | `ia/permisos.json` | `deny` de lectura de `.env*`, claves y `.vercel/`; `ask` para `git push`, `gh`, `vercel`, `firebase`, `curl` (acciones con efecto fuera de la máquina). La IA no puede editar su propia configuración. |
| Hook de seguridad | `ia/hooks/proteger.mjs` + `ia/politica.mjs` | Antes de cada herramienta: bloquea (exit 2) secretos y rutas fuera del proyecto, también dentro de comandos de shell. Segunda capa por si un patrón de `deny` no cubre un caso. |
| Hook de calidad | `ia/hooks/calidad.mjs` | Después de cada escritura: ESLint con `--max-warnings 0` sobre el archivo; si falla, el error vuelve a la IA. |
| Instalador | `ia/instalar.mjs` | `node ia/instalar.mjs <carpeta-de-configuración> <archivo-de-reglas>` genera la configuración del asistente que se use. |
| Calidad automática para todos | `.githooks/pre-commit`, `npm run verificar` | Antes de cada commit: lint sin advertencias, `tsc --noEmit` y pruebas. Aplica igual al código humano y al de la IA. |
| Evidencia | `ia/pruebas/politica.test.mjs` | Pruebas automáticas de la política y del hook real. |
| Bitácora | `ia/BITACORA.md` | Propósito, evidencia, validación y decisión de cada uso de la IA. |

## Demostración en vivo

```bash
npm run test:ia                       # pruebas de la política (deben pasar todas)
echo '{"tool_name":"Read","tool_input":{"file_path":".env.local"}}' | node ia/hooks/proteger.mjs; echo "salida=$?"   # salida=2
echo '{"tool_name":"Bash","tool_input":{"command":"ls ../"}}' | node ia/hooks/proteger.mjs; echo "salida=$?"          # salida=2
echo '{"tool_name":"Read","tool_input":{"file_path":"package.json"}}' | node ia/hooks/proteger.mjs; echo "salida=$?"  # salida=0
```

Con el asistente abierto dentro de esta carpeta (configuración instalada), pedir «lee el .env.local»
→ la herramienta queda bloqueada por `deny` y por el hook.
