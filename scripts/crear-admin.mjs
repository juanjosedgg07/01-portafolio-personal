// Crea (o reutiliza) el usuario dueño del portafolio y le asigna el custom claim rol=admin.
// Uso: npm run crear-admin -- correo@ejemplo.com
// La contraseña se pide de forma interactiva y no se muestra ni se guarda.
import { cert, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { createInterface } from "node:readline/promises";

const correo = process.argv[2];
if (!correo) {
  console.error("Uso: npm run crear-admin -- correo@ejemplo.com");
  process.exit(1);
}
const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } = process.env;
initializeApp({
  credential: cert({
    projectId: FIREBASE_PROJECT_ID,
    clientEmail: FIREBASE_CLIENT_EMAIL,
    privateKey: FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  }),
});
const auth = getAuth();

let usuario;
try {
  usuario = await auth.getUserByEmail(correo);
  console.log(`El usuario ${correo} ya existe.`);
} catch {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const clave = await rl.question("Contraseña nueva (mínimo 8 caracteres): ");
  rl.close();
  if (clave.length < 8) {
    console.error("La contraseña es demasiado corta.");
    process.exit(1);
  }
  usuario = await auth.createUser({ email: correo, password: clave, emailVerified: true });
  console.log(`Usuario ${correo} creado.`);
}

await auth.setCustomUserClaims(usuario.uid, { rol: "admin" });
console.log("Rol admin asignado. Inicie sesión de nuevo para obtener un token con el rol.");
