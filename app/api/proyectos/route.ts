import { requerirAdmin, usuarioOpcional } from "@/src/lib/auth";
import { refrescarPublico } from "@/src/lib/cache";
import { jsonPublico, leerCuerpo, manejar, validarConsulta } from "@/src/lib/http";
import { limitar } from "@/src/lib/limiteFrecuencia";
import { esquemaCrearProyecto, esquemaListaProyectos } from "@/src/schemas/proyecto";
import { proyectosServicio } from "@/src/services/proyectosServicio";

export const runtime = "nodejs";

/** GET /api/proyectos?limite=20&cursor=<slug>[&todos=1 solo admin] */
export const GET = manejar(async (request) => {
  const { limite, cursor, todos } = validarConsulta(request, esquemaListaProyectos);
  const quiereTodos = todos === "1";
  const usuario = quiereTodos ? await usuarioOpcional(request) : null;
  const pagina = await proyectosServicio.listar({ limite, cursor, todos: quiereTodos }, usuario);
  // Las respuestas con borradores son privadas: sin caché compartida.
  return quiereTodos && usuario?.rol === "admin" ? Response.json(pagina) : jsonPublico(pagina);
});

/** POST /api/proyectos (solo admin) → 201 | 400 | 401 | 403 | 409 */
export const POST = manejar(async (request) => {
  const usuario = await requerirAdmin(request);
  limitar(`escritura:${usuario.uid}`, 60, 60_000);
  const entrada = await leerCuerpo(request, esquemaCrearProyecto);
  const proyecto = await proyectosServicio.crear(entrada);
  refrescarPublico(`/proyectos/${proyecto.slug}`);
  return Response.json({ proyecto }, { status: 201, headers: { Location: `/api/proyectos/${proyecto.slug}` } });
});
