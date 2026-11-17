import { requerirUsuario } from "@/src/lib/auth";
import { manejar } from "@/src/lib/http";

export const runtime = "nodejs";

/** GET /api/auth/yo: usuario de la sesión o 401. */
export const GET = manejar(async (request) => {
  const usuario = await requerirUsuario(request);
  return Response.json({ usuario });
});
