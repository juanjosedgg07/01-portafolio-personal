import { requerirAdmin } from "@/src/lib/auth";
import { refrescarPublico } from "@/src/lib/cache";
import { jsonPublico, leerCuerpo, manejar } from "@/src/lib/http";
import { esquemaPerfil } from "@/src/schemas/perfil";
import { perfilServicio } from "@/src/services/perfilServicio";

export const runtime = "nodejs";

/** GET /api/perfil (público, con caché). */
export const GET = manejar(async () => jsonPublico({ perfil: await perfilServicio.obtener() }));

/** PUT /api/perfil (solo admin). La foto se cambia por /api/archivos. */
export const PUT = manejar(async (request) => {
  await requerirAdmin(request);
  const datos = await leerCuerpo(request, esquemaPerfil);
  const perfil = await perfilServicio.guardar(datos);
  refrescarPublico("/contacto");
  return Response.json({ perfil });
});
