/** URL pública del sitio (para metadatos, sitemap y JSON-LD). */
export function urlSitio(): string {
  if (process.env.NEXT_PUBLIC_SITIO_URL) return process.env.NEXT_PUBLIC_SITIO_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  return "http://localhost:3000";
}
