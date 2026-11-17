import { requerirAdmin } from "@/src/lib/auth";
import { refrescarPublico } from "@/src/lib/cache";
import { leerCuerpo, manejar, sinContenido } from "@/src/lib/http";
import { esquemaBorrarArchivo, esquemaRegistrarArchivo } from "@/src/schemas/comunes";
import { archivosServicio } from "@/src/services/archivosServicio";

export const runtime = "nodejs";

/** POST /api/archivos: el cliente registra un archivo ya subido; se verifica que sea del usuario. */
export const POST = manejar(async (request) => {
  const usuario = await requerirAdmin(request);
  const { url, pathname, destino } = await leerCuerpo(request, esquemaRegistrarArchivo);
  await archivosServicio.registrar(usuario.uid, url, pathname, destino);
  refrescarPublico(destino.tipo === "proyecto" ? `/proyectos/${destino.slug}` : "/contacto");
  return Response.json({ url }, { status: 201 });
});

/** DELETE /api/archivos { url, destino }: solo la API borra, y solo archivos del usuario. */
export const DELETE = manejar(async (request) => {
  const usuario = await requerirAdmin(request);
  const { url, destino } = await leerCuerpo(request, esquemaBorrarArchivo);
  await archivosServicio.borrar(usuario.uid, url, destino);
  refrescarPublico(destino.tipo === "proyecto" ? `/proyectos/${destino.slug}` : "/contacto");
  return sinContenido();
});
