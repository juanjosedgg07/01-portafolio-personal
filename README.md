# 01 · Portafolio personal con panel de edición

Sitio personal con proyectos, habilidades y formulario de contacto, editable desde un panel privado.
Un solo proyecto **Next.js 16** (App Router) con la interfaz y la API REST.

```text
[ Navegador ]  Next.js · React 19 · TypeScript
   │  Firebase Auth (SDK web, solo login) → cookie de sesión HttpOnly
   │  fetch a la API propia (mismo origen)
   ▼
[ API REST ]  app/api/**/route.ts  →  servicios  →  repositorios   (Zod · manejar())
   ├──▶ Firebase: Authentication + Firestore (solo Admin SDK; reglas: todo denegado)
   └──▶ Vercel Blob: foto de perfil y capturas (subida directa con handleUpload)
```

## Requisitos

- Node.js ≥ 20.9 y npm
- Firebase CLI (`npm i -g firebase-tools`), Vercel CLI (`npm i -g vercel`), GitHub CLI (`gh`)

## Puesta en marcha local

```bash
npm install                 # también activa el hook pre-commit (.githooks)
cp .env.example .env.local  # complete las variables (ver abajo). NUNCA lo suba a Git
npm run dev                 # http://localhost:3000
```

Sin variables de Firebase el sitio arranca en **modo demostración**: las páginas públicas leen
`datos/ejemplo.json` en memoria y el panel privado muestra «no disponible».

### Variables de entorno

| Variable | Dónde | Para qué |
|---|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY`, `_AUTH_DOMAIN`, `_PROJECT_ID`, `_APP_ID` | navegador (públicas por diseño) | iniciar sesión con Firebase Auth |
| `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` | **solo servidor** | Admin SDK (Firestore y verificación de sesión) |
| `BLOB_READ_WRITE_TOKEN` | **solo servidor** | Vercel Blob |
| `NEXT_PUBLIC_SITIO_URL` | opcional | URL canónica para metadatos y sitemap |

`FIREBASE_PRIVATE_KEY` va con `\n` literales; la app los convierte al iniciar.

## Servicios (por CLI)

```bash
# Firebase
firebase projects:create <id> --display-name "Portafolio personal"
firebase apps:create web portafolio --project <id>
firebase apps:sdkconfig web --project <id>            # valores NEXT_PUBLIC_FIREBASE_*
firebase deploy --only firestore:rules,firestore:indexes --project <id>
# Authentication → Email/Password habilitado; cuenta de servicio → clave privada (FIREBASE_*)

npm run sembrar                                       # carga datos/ejemplo.json en Firestore
npm run crear-admin -- correo@dominio.com             # usuario dueño con claim rol=admin

# Vercel
vercel link
vercel blob store add portafolio-blob                 # conecta el store y crea BLOB_READ_WRITE_TOKEN
vercel env add FIREBASE_PRIVATE_KEY production        # y el resto de variables
vercel deploy --prod
curl -i https://<dominio>/api/auth/yo                 # 401 sin sesión
```

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` / `build` / `start` | Desarrollo, compilación y producción |
| `npm run lint` | ESLint (reglas de Next.js y `jsx-a11y`) con **0 advertencias** |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest: componentes (RTL + axe), API, integración y política de IA |
| `npm run test:e2e` | Playwright en 360/768/1024 px con axe (`E2E_BASE_URL=https://… ` para producción) |
| `npm run verificar` | lint + tipos + pruebas (lo ejecuta el hook pre-commit) |

## Estructura

```text
app/                    páginas (App Router) y app/api/** (API REST)
proxy.ts                redirige a /login si falta la cookie (NO es la seguridad real)
src/schemas             esquemas Zod compartidos cliente/servidor
src/services            reglas de negocio
src/repositories        único acceso a Firestore (+ almacén en memoria para modo demostración)
src/lib                 firebase (cliente/admin), auth, errores, http, límite de frecuencia
src/components, hooks   UI accesible reutilizable (useDebounce, usePolling, useSeccionActiva)
tests/                  Vitest (componentes, api, integracion) y Playwright (e2e)
openapi.yaml · bruno/   documentación y colección de solicitudes
calidad/ · CALIDAD.md   evidencias de calidad (sección 14)
ia/ · CLAUDE.md · .claude/   configuración de IA y sus evidencias (sección 15)
```

## Seguridad (resumen)

- El navegador solo usa Firebase **Auth**; todo dato pasa por la API. Reglas de Firestore: `allow read, write: if false`.
- Cookie `sesion` HttpOnly · Secure · SameSite=Lax (5 días), creada solo con un login reciente (`auth_time` < 5 min).
- Cada ruta privada llama a `requerirAdmin()` (`verifySessionCookie(…, true)`); el `uid` sale siempre de la sesión.
- Zod en modo estricto (`strictObject`): campos desconocidos → 400 (evita *mass assignment*).
- `Origin` verificado en POST/PUT/PATCH/DELETE; límite de frecuencia con 429; honeypot en contacto.
- Blob: `pathname` debe empezar por `usuarios/<uid>/`, tipos de imagen y 2 MB máximo, sufijo aleatorio; borrar solo lo propio.
- Cabeceras: CSP, `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy`.
- Registros con id de petición, sin tokens ni datos personales.

## Bitácora de IA

Ver [`ia/BITACORA.md`](ia/BITACORA.md) y [`ia/README.md`](ia/README.md).
