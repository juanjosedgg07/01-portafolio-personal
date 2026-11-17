import "server-only";
import { del } from "@vercel/blob";
import { perfilRepositorio } from "@/src/repositories/perfilRepositorio";
import { proyectosRepositorio } from "@/src/repositories/proyectosRepositorio";
import { prohibido } from "@/src/lib/errores";
import type { Destino } from "@/src/schemas/comunes";

const HOST_BLOB = /\.public\.blob\.vercel-storage\.com$/;

export const archivosServicio = {
  /** Prefijo obligatorio de todo archivo del usuario en Blob. */
  prefijo(uid: string) {
    return `usuarios/${uid}/`;
  },

  pathnameEsDelUsuario(pathname: string, uid: string) {
    return pathname.startsWith(this.prefijo(uid)) && !pathname.includes("..");
  },

  /** La URL debe ser de Vercel Blob y su ruta empezar por usuarios/<uid>/. */
  esDelUsuario(url: string, uid: string) {
    try {
      const u = new URL(url);
      return u.protocol === "https:" && HOST_BLOB.test(u.hostname) && this.pathnameEsDelUsuario(decodeURIComponent(u.pathname.slice(1)), uid);
    } catch {
      return false;
    }
  },

  async borrarBlob(url: string) {
    await del(url);
  },

  /** Registra en Firestore un archivo ya subido (el cliente notifica a la API). */
  async registrar(uid: string, url: string, pathname: string, destino: Destino) {
    if (!this.pathnameEsDelUsuario(pathname, uid) || !this.esDelUsuario(url, uid)) {
      throw prohibido("El archivo no pertenece a su cuenta.");
    }
    if (destino.tipo === "perfil") {
      const anterior = await perfilRepositorio.fijarFoto(url);
      if (anterior && anterior !== url && this.esDelUsuario(anterior, uid)) {
        await this.borrarBlob(anterior).catch(() => undefined);
      }
    } else {
      await proyectosRepositorio.agregarImagen(destino.slug, url);
    }
  },

  /** Borra un archivo: solo la API, solo si es del usuario. */
  async borrar(uid: string, url: string, destino: Destino) {
    if (!this.esDelUsuario(url, uid)) throw prohibido("El archivo no pertenece a su cuenta.");
    if (destino.tipo === "perfil") {
      await perfilRepositorio.fijarFoto(null);
    } else {
      await proyectosRepositorio.quitarImagen(destino.slug, url);
    }
    await this.borrarBlob(url);
  },
};
