import "server-only";
import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

/** ¿Hay credenciales del Admin SDK? Sin ellas el sitio funciona en modo demostración (solo lectura de datos de ejemplo). */
export function firebaseConfigurado(): boolean {
  return Boolean(
    process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY,
  );
}

function app(): App {
  const existente = getApps()[0];
  if (existente) return existente;
  if (!firebaseConfigurado()) {
    throw new Error("Faltan las variables de entorno del Admin SDK de Firebase.");
  }
  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // En Vercel la clave llega con "\n" literales: se convierten a saltos de línea.
      privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, "\n"),
    }),
  });
}

/**
 * getFirestore() ya devuelve la misma instancia para la misma app.
 * No se llama a settings(): durante la compilación el módulo puede cargarse en varios
 * bundles y Firestore solo admite settings() una vez (fallaba el prerender de /sitemap.xml).
 */
export function firestore(): Firestore {
  return getFirestore(app());
}

export function authAdmin() {
  return getAuth(app());
}
