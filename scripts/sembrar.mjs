// Carga los datos de ejemplo (datos/ejemplo.json) en Firestore si aún no existen.
// Uso: npm run sembrar   (lee las credenciales de .env.local con --env-file)
import { readFile } from "node:fs/promises";
import { cert, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } = process.env;
if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) {
  console.error("Faltan FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL o FIREBASE_PRIVATE_KEY.");
  process.exit(1);
}

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

for (const { slug, ...p } of datos.proyectos) {
  try {
    await db.collection("proyectos").doc(slug).create({ ...p, creadoEn: ahora });
    console.log(`proyectos/${slug} creado.`);
  } catch (e) {
    if (e.code === 6) console.log(`proyectos/${slug} ya existe: no se modifica.`);
    else throw e;
  }
}
