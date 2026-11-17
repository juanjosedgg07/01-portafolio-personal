import { requerirAdmin, usuarioOpcional } from "@/src/lib/auth";
import { refrescarPublico } from "@/src/lib/cache";
import { noEncontrado } from "@/src/lib/errores";
import { leerCuerpo, manejar, sinContenido } from "@/src/lib/http";
import { limitar } from "@/src/lib/limiteFrecuencia";
import { esquemaEditarProyecto, esquemaSlug } from "@/src/schemas/proyecto";
import { proyectosServicio } from "@/src/services/proyectosServicio";

export const runtime = "nodejs";

type P = { slug: string };

async function slugValido(params: Promise<P>) {
  const { slug } = await params;
  if (!esquemaSlug.safeParse(slug).success) throw noEncontrado("El proyecto no existe.");
  return slug;
}

/** GET /api/proyectos/{slug}: borradores solo para el admin (404 para los demás). */
export const GET = manejar<P>(async (request, { params }) => {
  const slug = await slugValido(params);
  const proyecto = await proyectosServicio.obtener(slug, await usuarioOpcional(request));
  return Response.json({ proyecto }, { headers: { "Cache-Control": proyecto.publicado ? "public, s-maxage=60" : "no-store" } });
});

/** PUT /api/proyectos/{slug} (admin): edición parcial. */
export const PUT = manejar<P>(async (request, { params }) => {
  const usuario = await requerirAdmin(request);
  limitar(`escritura:${usuario.uid}`, 60, 60_000);
  const slug = await slugValido(params);
  const cambios = await leerCuerpo(request, esquemaEditarProyecto);
  const proyecto = await proyectosServicio.actualizar(slug, cambios);
  refrescarPublico(`/proyectos/${slug}`);
  return Response.json({ proyecto });
});

/** DELETE /api/proyectos/{slug} (admin): borra el documento y sus imágenes de Blob. */
export const DELETE = manejar<P>(async (request, { params }) => {
  const usuario = await requerirAdmin(request);
  const slug = await slugValido(params);
  await proyectosServicio.eliminar(slug, usuario);
  refrescarPublico(`/proyectos/${slug}`);
  return sinContenido();
});
