"use client";
// SDK web de Firebase: SOLO autenticación. El navegador nunca usa Firestore.
import { getApps, initializeApp } from "firebase/app";
import { getAuth, inMemoryPersistence, setPersistence } from "firebase/auth";

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export function authCliente() {
  const app = getApps()[0] ?? initializeApp(config);
  const auth = getAuth(app);
  // La sesión real es la cookie HttpOnly; el SDK no guarda nada en el navegador.
  void setPersistence(auth, inMemoryPersistence);
  return auth;
}
