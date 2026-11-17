import type { MetadataRoute } from "next";
import { proyectosServicio } from "@/src/services/proyectosServicio";
import { urlSitio } from "@/src/lib/sitio";

export const revalidate = 3600;

/** GET /sitemap.xml generado desde Firestore (proyectos publicados). */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = urlSitio();
  const { items } = await proyectosServicio.listar({ limite: 100, todos: false }, null);
  return [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/proyectos`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/contacto`, changeFrequency: "yearly", priority: 0.5 },
    ...items.map((p) => ({
      url: `${base}/proyectos/${p.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
