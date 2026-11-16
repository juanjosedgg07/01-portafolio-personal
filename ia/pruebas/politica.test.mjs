// Evidencia de que las restricciones de la IA funcionan (sección 15).
// Ejecutar: npm run test:ia
import { describe, it, expect } from "vitest";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { evaluar } from "../politica.mjs";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const llamada = (tool_name, tool_input) => ({ tool_name, tool_input });

describe("La IA no puede leer secretos", () => {
  it.each([
    [".env"],
    [".env.local"],
    [".env.production"],
    ["claves/cuenta-servicio.json"],
    ["portafolio-firebase-adminsdk-abc12.json"],
    ["certs/privada.pem"],
  ])("bloquea Read de %s", (archivo) => {
    expect(evaluar(llamada("Read", { file_path: path.join(RAIZ, archivo) }), RAIZ).permitido).toBe(false);
  });

  it("permite leer .env.example (no contiene secretos)", () => {
    expect(evaluar(llamada("Read", { file_path: path.join(RAIZ, ".env.example") }), RAIZ).permitido).toBe(true);
  });

  it.each([
    ["cat .env.local"],
    ["type .env"],
    ["grep FIREBASE .env.local"],
    ["node -e \"console.log(require('fs').readFileSync('.env.local','utf8'))\""],
    ["printenv"],
    ["gh auth token"],
  ])("bloquea el comando `%s`", (command) => {
    expect(evaluar(llamada("Bash", { command }), RAIZ).permitido).toBe(false);
  });

  it("bloquea Grep apuntando a .env", () => {
    expect(evaluar(llamada("Grep", { pattern: "KEY", path: ".env.local" }), RAIZ).permitido).toBe(false);
  });
});

describe("La IA no puede salir de la carpeta del proyecto", () => {
  it.each([
    ["Read", { file_path: "C:/Windows/System32/drivers/etc/hosts" }],
    ["Read", { file_path: path.join(RAIZ, "..", "otro-proyecto", "index.ts") }],
    ["Write", { file_path: path.join(RAIZ, "..", "fuera.txt"), content: "x" }],
    ["Glob", { pattern: "**/*", path: "C:/Users" }],
  ])("bloquea %s fuera del proyecto", (tool, input) => {
    expect(evaluar(llamada(tool, input), RAIZ).permitido).toBe(false);
  });

  it.each([
    ["ls ../"],
    ["cat ~/.ssh/id_rsa"],
    ["cp src/a.ts C:/Users/Public/a.ts"],
    ["ls /c/Windows"],
  ])("bloquea el comando `%s`", (command) => {
    expect(evaluar(llamada("Bash", { command }), RAIZ).permitido).toBe(false);
  });

  it("permite trabajar dentro del proyecto", () => {
    expect(evaluar(llamada("Read", { file_path: path.join(RAIZ, "src", "lib", "http.ts") }), RAIZ).permitido).toBe(true);
    expect(evaluar(llamada("Edit", { file_path: "app/page.tsx" }), RAIZ).permitido).toBe(true);
    expect(evaluar(llamada("Bash", { command: "npm run test" }), RAIZ).permitido).toBe(true);
    expect(evaluar(llamada("Glob", { pattern: "src/**/*.ts" }), RAIZ).permitido).toBe(true);
  });
});

describe("El hook real responde como espera Claude Code", () => {
  const hook = path.join(RAIZ, ".claude", "hooks", "proteger.mjs");
  const ejecutar = (entrada) =>
    spawnSync(process.execPath, [hook], {
      input: JSON.stringify(entrada),
      encoding: "utf8",
      env: { ...process.env, CLAUDE_PROJECT_DIR: RAIZ },
    });

  it("sale con código 2 y explica el motivo al leer .env.local", () => {
    const r = ejecutar(llamada("Read", { file_path: path.join(RAIZ, ".env.local") }));
    expect(r.status).toBe(2);
    expect(r.stderr).toMatch(/Bloqueado/);
  });

  it("sale con código 0 en una lectura permitida", () => {
    const r = ejecutar(llamada("Read", { file_path: path.join(RAIZ, "package.json") }));
    expect(r.status).toBe(0);
  });
});
