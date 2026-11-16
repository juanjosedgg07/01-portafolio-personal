# Configuración de IA del proyecto (sección 15)

| Pieza | Archivo | Qué hace |
|---|---|---|
| Reglas del proyecto | `CLAUDE.md` (+ `AGENTS.md`) | Stack, comandos, estructura, lo que sí y lo que no. |
| Permisos | `.claude/settings.json` | `deny` de lectura de `.env*`, claves y `.vercel/`; `ask` para `git push`, `gh`, `vercel`, `firebase`, `curl` (acciones con efecto fuera de la máquina). La IA no puede editar su propia configuración. |
| Hook de seguridad | `.claude/hooks/proteger.mjs` + `ia/politica.mjs` | `PreToolUse`: bloquea (exit 2) secretos y rutas fuera del proyecto, también dentro de comandos de shell. Segunda capa por si un patrón de `deny` no cubre un caso. |
| Hook de calidad | `.claude/hooks/calidad.mjs` | `PostToolUse`: corre ESLint con `--max-warnings 0` sobre cada archivo que la IA escribe; si falla, el error vuelve a la IA. |
| Calidad automática para todos | `.githooks/pre-commit`, `npm run verificar` | Antes de cada commit: lint sin advertencias, `tsc --noEmit` y pruebas. Aplica igual al código humano y al de la IA. |
| Evidencia | `ia/pruebas/politica.test.mjs` | Pruebas automáticas de la política y del hook real. |
| Bitácora | `ia/BITACORA.md` | Propósito, evidencia, validación y decisión de cada uso de la IA. |

## Demostración en vivo

```bash
npm run test:ia                       # pruebas de la política (deben pasar todas)
echo '{"tool_name":"Read","tool_input":{"file_path":".env.local"}}' | node .claude/hooks/proteger.mjs; echo "salida=$?"   # salida=2
echo '{"tool_name":"Bash","tool_input":{"command":"ls ../"}}' | node .claude/hooks/proteger.mjs; echo "salida=$?"          # salida=2
```

En una sesión de Claude Code dentro de esta carpeta, pedir «lee el .env.local» → la herramienta queda bloqueada por `deny` y por el hook.
