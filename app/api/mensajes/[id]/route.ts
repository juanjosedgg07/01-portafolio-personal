import { requerirAdmin } from "@/src/lib/auth";
import { noEncontrado } from "@/src/lib/errores";
import { leerCuerpo, manejar, sinContenido } from "@/src/lib/http";
import { esquemaActualizarMensaje } from "@/src/schemas/mensaje";
import { mensajesServicio } from "@/src/services/mensajesServicio";

export const runtime = "nodejs";

type P = { id: string };

async function idValido(params: Promise<P>) {
  const { id } = await params;
  if (!/^[A-Za-z0-9_-]{1,64}$/.test(id)) throw noEncontrado("El mensaje no existe.");
  return id;
}

/** PATCH /api/mensajes/{id} { leido } (admin) */
export const PATCH = manejar<P>(async (request, { params }) => {
  await requerirAdmin(request);
  const id = await idValido(params);
  const { leido } = await leerCuerpo(request, esquemaActualizarMensaje);
  return Response.json({ mensaje: await mensajesServicio.marcarLeido(id, leido) });
});

/** DELETE /api/mensajes/{id} (admin) */
export const DELETE = manejar<P>(async (request, { params }) => {
  await requerirAdmin(request);
  await mensajesServicio.eliminar(await idValido(params));
  return sinContenido();
});
