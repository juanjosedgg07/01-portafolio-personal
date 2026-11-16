#!/usr/bin/env node
// Hook PreToolUse: bloquea (exit 2) lecturas de secretos y accesos fuera del proyecto.
import { evaluar } from "../../ia/politica.mjs";

let datos = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (c) => (datos += c));
process.stdin.on("end", () => {
  let llamada;
  try {
    llamada = JSON.parse(datos || "{}");
  } catch {
    process.stderr.write("Hook proteger: entrada no válida; se bloquea por precaución.\n");
    process.exit(2);
  }
  const raiz = process.env.CLAUDE_PROJECT_DIR || llamada.cwd || process.cwd();
  const { permitido, motivo } = evaluar(llamada, raiz);
  if (!permitido) {
    process.stderr.write(`Bloqueado por la política del proyecto: ${motivo}\n`);
    process.exit(2);
  }
  process.exit(0);
});
