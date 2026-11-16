@AGENTS.md

# Reglas del proyecto para el asistente de IA

Portafolio personal con panel de edición (`01-portafolio-personal`). Un solo proyecto Next.js con interfaz y API.

## Stack
- Next.js 16 (App Router, `proxy.ts`), React 19, TypeScript estricto.
- Firebase Auth (SDK web solo para iniciar sesión) + cookie de sesión HttpOnly.
- Firestore **solo** vía `firebase-admin` desde el servidor (`src/repositories`). Reglas: todo denegado.
- Vercel Blob (store público) para imágenes; Zod para validar; Vitest + Testing Library.

## Comandos
- `npm run dev` · `npm run build` · `npm run lint` (0 advertencias) · `npm run typecheck`
- `npm test` (Vitest) · `npm run test:ia` (pruebas de la política de IA) · `npm run test:e2e` (Playwright)

## Estructura
- `app/` páginas y `app/api/**/route.ts` (API REST). `proxy.ts` solo redirige; no es seguridad.
- `src/schemas` (Zod compartido) → `src/services` (reglas) → `src/repositories` (Firestore).
- `src/lib` (firebase, auth, errores, http), `src/components`, `src/hooks`.
- `tests/`, `openapi.yaml`, `bruno/`, `calidad/`, `ia/`.

## Sí
- Toda ruta API usa `manejar()` y valida con esquemas Zod `.strict()`.
- Toda ruta privada llama a `requerirUsuario`/`requerirAdmin`; el `uid` sale de la sesión verificada.
- Server Components por defecto; `"use client"` solo con estado, efectos o eventos.
- HTML semántico, accesible (WCAG 2.2 AA), mobile-first, sin anchos fijos en px.
- Agregar o actualizar pruebas y `openapi.yaml` al cambiar la API.

## No
- No leer ni escribir `.env*`, claves, cuentas de servicio ni `.vercel/`. No imprimir variables de entorno.
- No trabajar fuera de esta carpeta.
- No importar `firebase/firestore` en el cliente. No usar `NEXT_PUBLIC_*` para secretos.
- No usar `dangerouslySetInnerHTML` con contenido de usuarios ni `<div onClick>`.
- No hacer `git push`, desplegar ni tocar Firebase/Vercel sin permiso explícito.
- No agregar coautoría de la IA en los commits.
