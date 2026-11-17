# Evidencias de calidad (sección 14)

> Estado: las evidencias automáticas locales ya están; las de **producción** (Lighthouse, Core Web Vitals)
> se completan tras el despliegue en Vercel. Cada fila indica cómo reproducirla.

## Retos de excelencia elegidos

| Reto | Evidencia | Cómo reproducir |
|---|---|---|
| **Prueba en 3 anchos con Playwright** (360/768/1024): sin scroll horizontal y 0 violaciones de axe | 24/24 pruebas en verde (2026-11-16, local); capturas en `calidad/capturas/` | `npm run test:e2e` (o `E2E_BASE_URL=https://… npm run test:e2e`) |
| **Pruebas de accesibilidad de componentes** con axe en Vitest + RTL | `tests/componentes/accesibilidad.test.tsx` en verde | `npm test` |
| **Modo oscuro y alto contraste** | Tokens en `app/globals.css`: `data-theme`, `prefers-color-scheme` sin JS, `prefers-contrast: more` | Interruptor de tema; DevTools → Rendering → emular `prefers-contrast` |
| **Impresión y SEO avanzado** | `@media print` en `globals.css`; JSON-LD `Person` y `CreativeWork`; sitemap desde Firestore; Open Graph por proyecto | Ctrl+P en la portada; `view-source` → `application/ld+json`; `/sitemap.xml` |

## Lista de comprobación

| Comprobación | Resultado | Fecha |
|---|---|---|
| Sin scroll horizontal en 360/768/1024 (automático) | ✅ Playwright | 2026-11-16 |
| axe sin violaciones (WCAG 2.2 A/AA) en portada, detalle, contacto, login y 404 | ✅ Playwright | 2026-11-16 |
| Un solo `<h1>` por página, `lang="es"` | ✅ Playwright | 2026-11-16 |
| «Saltar al contenido» primero al tabular y mueve el foco | ✅ Playwright | 2026-11-16 |
| Error de correo junto al campo, anunciado y con foco | ✅ Playwright + Vitest | 2026-11-16 |
| `/admin` sin sesión redirige a `/login` | ✅ Playwright | 2026-11-16 |
| Recorrido solo con teclado (manual) | ⏳ pendiente | |
| Zoom 200 % y reflow a 320 px (manual) | ⏳ pendiente | |
| Lector de pantalla (NVDA) | ⏳ pendiente | |
| Validador HTML W3C | ⏳ pendiente (producción) | |
| Lighthouse móvil y escritorio: portada, contacto y `/admin` | ⏳ pendiente (producción) | |

## Core Web Vitals (producción, perfil móvil)

| Página | LCP | INP | CLS | Medidas aplicadas |
|---|---|---|---|---|
| `/` | ⏳ | ⏳ | ⏳ | ISR (`revalidate`), `next/font` con `swap`, foto con `priority` y `sizes`, imágenes con `width`/`height`, SDK de Firebase solo en `/login` (import dinámico) |
| `/contacto` | ⏳ | ⏳ | ⏳ | Validación en cliente sin dependencias extra (Zod ya compartido) |

> Rellenar con Lighthouse/PageSpeed Insights tras `vercel deploy --prod`. Lighthouse no mide INP en laboratorio: medir interactuando.
