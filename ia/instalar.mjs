// Instala la configuración de IA del proyecto en las rutas que exige el asistente.
// La configuración versionada es genérica (AGENTS.md + ia/permisos.json + ia/hooks);
// este script genera localmente los archivos propios de la herramienta y los excluye de Git.
//
// Uso: node ia/instalar.mjs <carpeta-de-configuración> <archivo-de-reglas>
import { mkdir, readFile, writeFile, appendFile } from "node:fs/promises";
import path from "node:path";

const [carpeta, archivoReglas] = process.argv.slice(2);
if (!carpeta || !archivoReglas || carpeta.includes("..") || archivoReglas.includes("..")) {
  console.error("Uso: node ia/instalar.mjs <carpeta-de-configuración> <archivo-de-reglas>");
  process.exit(1);
}

const permisos = JSON.parse(await readFile(new URL("./permisos.json", import.meta.url), "utf8"));
// La IA tampoco puede editar la configuración instalada.
permisos.permissions.deny.push(`Edit(./${carpeta}/**)`, `Edit(./${archivoReglas})`);

await mkdir(carpeta, { recursive: true });
await writeFile(path.join(carpeta, "settings.json"), JSON.stringify(permisos, null, 2) + "\n");
await writeFile(archivoReglas, "@AGENTS.md\n");

// Excluye los archivos generados solo en este clon (no modifica .gitignore).
const exclusiones = path.join(".git", "info", "exclude");
const actuales = await readFile(exclusiones, "utf8").catch(() => "");
const nuevas = [`/${carpeta}/`, `/${archivoReglas}`].filter((l) => !actuales.split(/\r?\n/).includes(l));
if (nuevas.length) await appendFile(exclusiones, `\n${nuevas.join("\n")}\n`);

console.log(`Configuración instalada en ${carpeta}/settings.json y ${archivoReglas} (excluidos de Git).`);
