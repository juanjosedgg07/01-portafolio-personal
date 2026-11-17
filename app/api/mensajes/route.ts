import { requerirAdmin } from "@/src/lib/auth";
import { leerCuerpo, manejar, validarConsulta } from "@/src/lib/http";
import { ipDe, limitar } from "@/src/lib/limiteFrecuencia";
import { esquemaPaginacion } from "@/src/schemas/comunes";
import { esquemaMensaje } from "@/src/schemas/mensaje";
import { mensajesServicio } from "@/src/services/mensajesServicio";

export const runtime = "nodejs";

/** POST /api/mensajes (público): límite de 5 por IP cada 10 minutos + campo trampa. */
export const POST = manejar(async (request) => {
  limitar(`mensajes:${ipDe(request)}`, 5, 10 * 60_000);
  const entrada = await leerCuerpo(request, esquemaMensaje);
  const r = await mensajesServicio.recibir(entrada);
  // Mismo 201 para bots (honeypot) que para personas: no se revela la trampa.
  return Response.json({ recibido: true, id: r.mensaje?.id ?? null }, { status: 201 });
});

/** GET /api/mensajes?limite&cursor (solo el dueño). */
export const GET = manejar(async (request) => {
  await requerirAdmin(request);
  const { limite, cursor } = validarConsulta(request, esquemaPaginacion);
  return Response.json(await mensajesServicio.listar(limite, cursor));
});
