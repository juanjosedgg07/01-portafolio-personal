import "server-only";
import { firebaseConfigurado, firestore } from "@/src/lib/firebase/admin";
import { noEncontrado } from "@/src/lib/errores";
import type { Pagina } from "@/src/schemas/comunes";
import type { Mensaje } from "@/src/schemas/mensaje";
import { memoria } from "./memoria";

const COL = "mensajes";

type NuevoMensaje = Omit<Mensaje, "id">;

export const mensajesRepositorio = {
  async crear(datos: NuevoMensaje): Promise<Mensaje> {
    if (!firebaseConfigurado()) {
      const id = crypto.randomUUID();
      const m = { id, ...datos };
      memoria.mensajes.set(id, m);
      return m;
    }
    const ref = await firestore().collection(COL).add(datos);
    return { id: ref.id, ...datos };
  },

  async listar(limite: number, cursor?: string): Promise<Pagina<Mensaje>> {
    if (!firebaseConfigurado()) {
      const todos = [...memoria.mensajes.values()].sort((a, b) => b.creadoEn.localeCompare(a.creadoEn));
      const inicio = cursor ? todos.findIndex((m) => m.id === cursor) + 1 : 0;
      const items = todos.slice(inicio, inicio + limite);
      return { items, siguienteCursor: inicio + limite < todos.length ? items.at(-1)!.id : null };
    }
    const col = firestore().collection(COL);
    let q = col.orderBy("creadoEn", "desc").limit(limite + 1);
    if (cursor) {
      const snapCursor = await col.doc(cursor).get();
      if (snapCursor.exists) q = q.startAfter(snapCursor);
    }
    const snap = await q.get();
    const docs = snap.docs.slice(0, limite);
    return {
      items: docs.map((d) => ({ id: d.id, ...(d.data() as NuevoMensaje) })),
      siguienteCursor: snap.docs.length > limite ? docs.at(-1)!.id : null,
    };
  },

  async contarNoLeidos(): Promise<number> {
    if (!firebaseConfigurado()) return [...memoria.mensajes.values()].filter((m) => !m.leido).length;
    const snap = await firestore().collection(COL).where("leido", "==", false).count().get();
    return snap.data().count;
  },

  async marcarLeido(id: string, leido: boolean): Promise<Mensaje> {
    if (!firebaseConfigurado()) {
      const m = memoria.mensajes.get(id);
      if (!m) throw noEncontrado("El mensaje no existe.");
      m.leido = leido;
      return m;
    }
    const ref = firestore().collection(COL).doc(id);
    try {
      await ref.update({ leido });
    } catch (e) {
      if ((e as { code?: number }).code === 5) throw noEncontrado("El mensaje no existe.");
      throw e;
    }
    return { id, ...((await ref.get()).data() as NuevoMensaje) };
  },

  async eliminar(id: string): Promise<void> {
    if (!firebaseConfigurado()) {
      if (!memoria.mensajes.delete(id)) throw noEncontrado("El mensaje no existe.");
      return;
    }
    const ref = firestore().collection(COL).doc(id);
    const snap = await ref.get();
    if (!snap.exists) throw noEncontrado("El mensaje no existe.");
    await ref.delete();
  },
};
