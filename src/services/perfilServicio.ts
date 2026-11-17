import "server-only";
import { perfilRepositorio } from "@/src/repositories/perfilRepositorio";
import { noEncontrado } from "@/src/lib/errores";
import type { EntradaPerfil, Perfil } from "@/src/schemas/perfil";

export const perfilServicio = {
  async obtener(): Promise<Perfil> {
    const perfil = await perfilRepositorio.obtener();
    if (!perfil) throw noEncontrado("El perfil aún no se ha configurado.");
    return perfil;
  },

  obtenerOpcional(): Promise<Perfil | null> {
    return perfilRepositorio.obtener();
  },

  guardar(datos: EntradaPerfil): Promise<Perfil> {
    return perfilRepositorio.guardar(datos);
  },
};
