import "server-only";
import { revalidatePath } from "next/cache";

/** Invalida las páginas públicas tras un cambio (ISR bajo demanda). Fuera de Next (pruebas) no hace nada. */
export function refrescarPublico(...rutas: string[]) {
  for (const ruta of ["/", "/proyectos", "/sitemap.xml", ...rutas]) {
    try {
      revalidatePath(ruta);
    } catch {
      /* sin contexto de Next.js */
    }
  }
}
