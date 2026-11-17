import "server-only";
import { proyectosRepositorio } from "@/src/repositories/proyectosRepositorio";
import { ErrorApi, noEncontrado } from "@/src/lib/errores";
import type { Usuario } from "@/src/lib/auth";
import type { CambiosProyecto, EntradaProyecto, Proyecto } from "@/src/schemas/proyecto";
import { archivosServicio } from "./archivosServicio";

export const proyectosServicio = {
  /** Los visitantes solo ven proyectos publicados; el admin puede pedir todos. */
  listar(opciones: { limite: number; cursor?: string; todos: boolean }, usuario: Usuario | null) {
    const soloPublicados = !(opciones.todos && usuario?.rol === "admin");
    return proyectosRepositorio.listar({ limite: opciones.limite, cursor: opciones.cursor, soloPublicados });
  },

  /** Un borrador no publicado responde 404 a quien no es admin (no revela su existencia). */
  async obtener(slug: string, usuario: Usuario | null): Promise<Proyecto> {
    const p = await proyectosRepositorio.obtener(slug);
    if (!p || (!p.publicado && usuario?.rol !== "admin")) throw noEncontrado("El proyecto no existe.");
    return p;
  },

  async obtenerPublico(slug: string): Promise<Proyecto | null> {
    const p = await proyectosRepositorio.obtener(slug);
    return p && p.publicado ? p : null;
  },

  async crear(entrada: EntradaProyecto): Promise<Proyecto> {
    // El orden lo decide el servidor (al final de la lista), nunca el cliente.
    const orden = await proyectosRepositorio.siguienteOrden();
    return proyectosRepositorio.crear(entrada, orden);
  },

  actualizar(slug: string, cambios: CambiosProyecto): Promise<Proyecto> {
    return proyectosRepositorio.actualizar(slug, cambios);
  },

  async eliminar(slug: string, usuario: Usuario): Promise<void> {
    const p = await proyectosRepositorio.eliminar(slug);
    // Borra de Blob solo las imágenes que pertenecen al usuario.
    await Promise.allSettled(
      p.imagenes
        .filter((url) => archivosServicio.esDelUsuario(url, usuario.uid))
        .map((url) => archivosServicio.borrarBlob(url)),
    );
  },

  async reordenar(slugs: string[]): Promise<void> {
    if (new Set(slugs).size !== slugs.length) throw new ErrorApi(400, "La lista de orden tiene slugs repetidos.");
    await proyectosRepositorio.reordenar(slugs);
  },
};
