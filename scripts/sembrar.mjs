// Carga los datos de ejemplo (datos/ejemplo.json) en Firestore.
// Uso: npm run sembrar                       → crea solo lo que no existe
//      npm run sembrar -- --actualizar       → además actualiza los proyectos de ejemplo que
//                                              aún usan imágenes de ejemplo (/ejemplo/...).
//                                              Nunca toca proyectos con imágenes subidas por el usuario.
import { readFile } from "node:fs/promises";
import { cert, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } = process.env;
if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) {
  console.error("Faltan FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL o FIREBASE_PRIVATE_KEY.");
  process.exit(1);
}
const actualizar = process.argv.includes("--actualizar");

initializeApp({
  credential: cert({
    projectId: FIREBASE_PROJECT_ID,
    clientEmail: FIREBASE_CLIENT_EMAIL,
    privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  }),
});
const db = getFirestore();
const datos = JSON.parse(await readFile(new URL("../datos/ejemplo.json", import.meta.url), "utf8"));
const ahora = new Date().toISOString();

const perfil = db.doc("perfil/principal");
if ((await perfil.get()).exists) {
  console.log("perfil/principal ya existe: no se modifica.");
} else {
  await perfil.set({ ...datos.perfil, actualizadoEn: ahora });
  console.log("perfil/principal creado.");
}

const esDeEjemplo = (imagenes = []) => imagenes.every((i) => i.startsWith("/ejemplo/"));

for (const { slug, ...p } of datos.proyectos) {
  const ref = db.collection("proyectos").doc(slug);
  const snap = await ref.get();
  if (!snap.exists) {
    await ref.create({ ...p, creadoEn: ahora });
    console.log(`proyectos/${slug} creado.`);
  } else if (actualizar && esDeEjemplo(snap.data().imagenes)) {
    // Conserva orden y publicado (pudo cambiarlos el dueño); actualiza contenido e imágenes de ejemplo.
    const { titulo, descripcion, tecnologias, imagenes, enlace } = p;
    await ref.update({ titulo, descripcion, tecnologias, imagenes, enlace, actualizadoEn: ahora });
    console.log(`proyectos/${slug} actualizado (imágenes de ejemplo).`);
  } else {
    console.log(`proyectos/${slug} ya existe: no se modifica.`);
  }
}
