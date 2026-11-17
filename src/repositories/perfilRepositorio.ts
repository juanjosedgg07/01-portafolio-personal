import "server-only";
import { firebaseConfigurado, firestore } from "@/src/lib/firebase/admin";
import type { EntradaPerfil, Perfil } from "@/src/schemas/perfil";
import { memoria } from "./memoria";

const DOC = "perfil/principal";

function normalizar(d: Partial<Perfil>): Perfil {
  return {
    nombre: d.nombre ?? "",
    titular: d.titular ?? "",
    bio: d.bio ?? "",
    correo: d.correo ?? "",
    fotoUrl: d.fotoUrl ?? null,
    habilidades: d.habilidades ?? [],
    enlaces: d.enlaces ?? {},
  };
}

/** Firestore no admite undefined: los enlaces vacíos se omiten. */
function limpiarEnlaces(enlaces: EntradaPerfil["enlaces"]) {
  return Object.fromEntries(Object.entries(enlaces).filter(([, v]) => typeof v === "string" && v !== ""));
}

export const perfilRepositorio = {
  async obtener(): Promise<Perfil | null> {
    if (!firebaseConfigurado()) return structuredClone(memoria.perfil);
    const snap = await firestore().doc(DOC).get();
    return snap.exists ? normalizar(snap.data() as Perfil) : null;
  },

  async guardar(datos: EntradaPerfil): Promise<Perfil> {
    const doc = { ...datos, enlaces: limpiarEnlaces(datos.enlaces) };
    if (!firebaseConfigurado()) {
      memoria.perfil = { ...memoria.perfil, ...doc };
      return structuredClone(memoria.perfil);
    }
    const ref = firestore().doc(DOC);
    await ref.set({ ...doc, actualizadoEn: new Date().toISOString() }, { merge: true });
    // merge no borra enlaces eliminados: se reemplaza el mapa completo.
    await ref.update({ enlaces: doc.enlaces });
    return normalizar((await ref.get()).data() as Perfil);
  },

  /** Cambia la foto y devuelve la URL anterior (para borrarla de Blob). */
  async fijarFoto(url: string | null): Promise<string | null> {
    if (!firebaseConfigurado()) {
      const anterior = memoria.perfil.fotoUrl;
      memoria.perfil.fotoUrl = url;
      return anterior;
    }
    const db = firestore();
    const ref = db.doc(DOC);
    return db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      const anterior = (snap.data()?.fotoUrl as string | null | undefined) ?? null;
      tx.set(ref, { fotoUrl: url }, { merge: true });
      return anterior;
    });
  },
};
