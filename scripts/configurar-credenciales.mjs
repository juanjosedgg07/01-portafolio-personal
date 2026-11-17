// Configura las credenciales del Admin SDK SIN mostrarlas en pantalla.
// Uso: npm run credenciales -- "C:\ruta\a\la-clave-de-cuenta-de-servicio.json"
//
// 1. Descarga las variables de desarrollo de Vercel a .env.local (vercel env pull).
// 2. Agrega FIREBASE_CLIENT_EMAIL y FIREBASE_PRIVATE_KEY a .env.local.
// 3. Sube ambas a Vercel (production, preview y development) como secretos.
// Después puede borrar el archivo .json descargado.
import { readFile, appendFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";

const ruta = process.argv[2];
if (!ruta) {
  console.error('Uso: npm run credenciales -- "ruta/a/cuenta-de-servicio.json"');
  process.exit(1);
}

const cuenta = JSON.parse(await readFile(ruta, "utf8"));
if (cuenta.type !== "service_account" || !cuenta.private_key || !cuenta.client_email) {
  console.error("El archivo no parece una clave de cuenta de servicio de Firebase.");
  process.exit(1);
}

const vercel = (args, entrada) =>
  spawnSync("vercel", args, { input: entrada, encoding: "utf8", shell: true, stdio: [entrada ? "pipe" : "inherit", "pipe", "pipe"] });

console.log("1/3 Descargando variables de Vercel a .env.local…");
if (vercel(["env", "pull", ".env.local", "--yes"]).status !== 0) {
  console.error("No se pudo ejecutar 'vercel env pull'. ¿Está vinculado el proyecto (vercel link)?");
  process.exit(1);
}

console.log("2/3 Agregando credenciales del servidor a .env.local…");
const claveEscapada = cuenta.private_key.replace(/\n/g, "\\n");
await appendFile(
  ".env.local",
  `\n# Admin SDK (solo servidor)\nFIREBASE_CLIENT_EMAIL="${cuenta.client_email}"\nFIREBASE_PRIVATE_KEY="${claveEscapada}"\n`,
);

console.log("3/3 Subiendo credenciales a Vercel como secretos…");
for (const entorno of ["production", "preview", "development"]) {
  for (const [nombre, valor] of [
    ["FIREBASE_CLIENT_EMAIL", cuenta.client_email],
    ["FIREBASE_PRIVATE_KEY", claveEscapada],
  ]) {
    const sensible = entorno === "development" ? "--no-sensitive" : "--sensitive";
    const r = vercel(["env", "add", nombre, entorno, "--force", "--yes", sensible], valor);
    console.log(`   ${r.status === 0 ? "✓" : "✗"} ${nombre} (${entorno})`);
  }
}
console.log("Listo. Ya puede borrar el archivo .json de la cuenta de servicio.");
