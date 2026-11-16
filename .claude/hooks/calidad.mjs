#!/usr/bin/env node
// Hook PostToolUse: ejecuta ESLint (sin advertencias) sobre el archivo que la IA acaba de escribir.
// Si falla, devuelve exit 2 y el error vuelve a la IA para que lo corrija.
import { spawnSync } from "node:child_process";

let datos = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (c) => (datos += c));
process.stdin.on("end", () => {
  const llamada = JSON.parse(datos || "{}");
  const archivo = llamada.tool_input?.file_path;
  if (!archivo || !/\.(ts|tsx|js|jsx|mjs)$/.test(archivo) || /node_modules/.test(archivo)) {
    process.exit(0);
  }
  const r = spawnSync("npx", ["eslint", "--max-warnings", "0", archivo], {
    cwd: process.env.CLAUDE_PROJECT_DIR || process.cwd(),
    encoding: "utf8",
    shell: true,
  });
  if (r.status !== 0) {
    process.stderr.write(`ESLint encontró problemas en ${archivo}:\n${r.stdout}${r.stderr}\n`);
    process.exit(2);
  }
  process.exit(0);
});
