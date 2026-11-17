import { requerirAdmin } from "@/src/lib/auth";
import { refrescarPublico } from "@/src/lib/cache";
import { leerCuerpo, manejar, sinContenido } from "@/src/lib/http";
import { esquemaOrden } from "@/src/schemas/proyecto";
import { proyectosServicio } from "@/src/services/proyectosServicio";

export const runtime = "nodejs";

/** PUT /api/proyectos/orden { slugs: [...] } (admin): el orden es la posición en la lista. */
export const PUT = manejar(async (request) => {
  await requerirAdmin(request);
  const { slugs } = await leerCuerpo(request, esquemaOrden);
  await proyectosServicio.reordenar(slugs);
  refrescarPublico();
  return sinContenido();
});
