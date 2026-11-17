import "server-only";
import { FieldValue } from "firebase-admin/firestore";
import { firebaseConfigurado, firestore } from "@/src/lib/firebase/admin";
import { conflicto, noEncontrado } from "@/src/lib/errores";
import type { Pagina } from "@/src/schemas/comunes";
import type { CambiosProyecto, EntradaProyecto, Proyecto } from "@/src/schemas/proyecto";
import { memoria } from "./memoria";

const COL = "proyectos";

function aProyecto(slug: string, d: FirebaseFirestore.DocumentData): Proyecto {
  return {
    slug,
    titulo: d.titulo,
    descripcion: d.descripcion,
    tecnologias: d.tecnologias ?? [],
    imagenes: d.imagenes ?? [],
    enlace: d.enlace ?? null,
    orden: d.orden ?? 0,
    publicado: d.publicado ?? false,
  };
}

const porOrden = (a: Proyecto, b: Proyecto) => a.orden - b.orden || a.slug.localeCompare(b.slug);

export type OpcionesLista = { limite: number; cursor?: string; soloPublicados: boolean };

export const proyectosRepositorio = {
  async listar({ limite, cursor, soloPublicados }: OpcionesLista): Promise<Pagina<Proyecto>> {
    if (!firebaseConfigurado()) {
      const todos = [...memoria.proyectos.values()].filter((p) => !soloPublicados || p.publicado).sort(porOrden);
      const inicio = cursor ? todos.findIndex((p) => p.slug === cursor) + 1 : 0;
      const items = todos.slice(inicio, inicio + limite);
      const hayMas = inicio + limite < todos.length;
      return { items: structuredClone(items), siguienteCursor: hayMas ? items.at(-1)!.slug : null };
    }
    const col = firestore().collection(COL);
    // publicado == true + orderBy(orden) necesita el índice compuesto de firestore.indexes.json
    let q = (soloPublicados ? col.where("publicado", "==", true) : col).orderBy("orden").limit(limite + 1);
    if (cursor) {
      const snapCursor = await col.doc(cursor).get();
      if (snapCursor.exists) q = q.startAfter(snapCursor);
    }
    const snap = await q.get();
    const docs = snap.docs.slice(0, limite);
    return {
      items: docs.map((d) => aProyecto(d.id, d.data())),
      siguienteCursor: snap.docs.length > limite ? docs.at(-1)!.id : null,
    };
  },

  async obtener(slug: string): Promise<Proyecto | null> {
    if (!firebaseConfigurado()) {
      const p = memoria.proyectos.get(slug);
      return p ? structuredClone(p) : null;
    }
    const snap = await firestore().collection(COL).doc(slug).get();
    return snap.exists ? aProyecto(snap.id, snap.data()!) : null;
  },

  async siguienteOrden(): Promise<number> {
    if (!firebaseConfigurado()) {
      return Math.max(0, ...[...memoria.proyectos.values()].map((p) => p.orden)) + 1;
    }
    const snap = await firestore().collection(COL).orderBy("orden", "desc").limit(1).get();
    return snap.empty ? 1 : (snap.docs[0].data().orden ?? 0) + 1;
  },

  /** create() falla con ALREADY_EXISTS si el slug existe → 409. */
  async crear(entrada: EntradaProyecto, orden: number): Promise<Proyecto> {
    const { slug, ...datos } = entrada;
    const proyecto: Proyecto = { slug, ...datos, imagenes: [], orden };
    if (!firebaseConfigurado()) {
      if (memoria.proyectos.has(slug)) throw conflicto("Ya existe un proyecto con ese slug.");
      memoria.proyectos.set(slug, structuredClone(proyecto));
      return proyecto;
    }
    try {
      const { slug: _omitido, ...doc } = proyecto;
      void _omitido;
      await firestore().collection(COL).doc(slug).create({ ...doc, creadoEn: new Date().toISOString() });
    } catch (e) {
      if ((e as { code?: number }).code === 6) throw conflicto("Ya existe un proyecto con ese slug.");
      throw e;
    }
    return proyecto;
  },

  async actualizar(slug: string, cambios: CambiosProyecto): Promise<Proyecto> {
    if (!firebaseConfigurado()) {
      const p = memoria.proyectos.get(slug);
      if (!p) throw noEncontrado("El proyecto no existe.");
      Object.assign(p, cambios);
      return structuredClone(p);
    }
    const ref = firestore().collection(COL).doc(slug);
    try {
      await ref.update({ ...cambios, actualizadoEn: new Date().toISOString() });
    } catch (e) {
      if ((e as { code?: number }).code === 5) throw noEncontrado("El proyecto no existe.");
      throw e;
    }
    return aProyecto(slug, (await ref.get()).data()!);
  },

  async eliminar(slug: string): Promise<Proyecto> {
    if (!firebaseConfigurado()) {
      const p = memoria.proyectos.get(slug);
      if (!p) throw noEncontrado("El proyecto no existe.");
      memoria.proyectos.delete(slug);
      return p;
    }
    const db = firestore();
    const ref = db.collection(COL).doc(slug);
    return db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists) throw noEncontrado("El proyecto no existe.");
      tx.delete(ref);
      return aProyecto(slug, snap.data()!);
    });
  },

  /** Asigna orden 1..n según la lista recibida (batch: hasta 500 operaciones). */
  async reordenar(slugs: string[]): Promise<void> {
    if (!firebaseConfigurado()) {
      for (const s of slugs) if (!memoria.proyectos.has(s)) throw noEncontrado(`El proyecto ${s} no existe.`);
      slugs.forEach((s, i) => (memoria.proyectos.get(s)!.orden = i + 1));
      return;
    }
    const db = firestore();
    const refs = slugs.map((s) => db.collection(COL).doc(s));
    await db.runTransaction(async (tx) => {
      const snaps = await tx.getAll(...refs); // lecturas antes de escrituras
      const faltante = snaps.find((s) => !s.exists);
      if (faltante) throw noEncontrado(`El proyecto ${faltante.id} no existe.`);
      refs.forEach((ref, i) => tx.update(ref, { orden: i + 1 }));
    });
  },

  async agregarImagen(slug: string, url: string): Promise<void> {
    if (!firebaseConfigurado()) {
      const p = memoria.proyectos.get(slug);
      if (!p) throw noEncontrado("El proyecto no existe.");
      if (!p.imagenes.includes(url)) p.imagenes.push(url);
      return;
    }
    try {
      await firestore().collection(COL).doc(slug).update({ imagenes: FieldValue.arrayUnion(url) });
    } catch (e) {
      if ((e as { code?: number }).code === 5) throw noEncontrado("El proyecto no existe.");
      throw e;
    }
  },

  async quitarImagen(slug: string, url: string): Promise<void> {
    if (!firebaseConfigurado()) {
      const p = memoria.proyectos.get(slug);
      if (!p) throw noEncontrado("El proyecto no existe.");
      p.imagenes = p.imagenes.filter((i) => i !== url);
      return;
    }
    try {
      await firestore().collection(COL).doc(slug).update({ imagenes: FieldValue.arrayRemove(url) });
    } catch (e) {
      if ((e as { code?: number }).code === 5) throw noEncontrado("El proyecto no existe.");
      throw e;
    }
  },
};
