// Política de seguridad para el asistente de IA del proyecto.
// La usan los hooks de ia/hooks y las pruebas de ia/pruebas.
// Función pura: recibe la llamada a herramienta y la raíz del proyecto
// y devuelve { permitido, motivo }.
import path from "node:path";

const SECRETO = [
  /(^|[\\/\s"'=])\.env(?!\.example)(\.[\w.-]+)?($|[\s"'\\/;|&)])/i, // .env, .env.local, .env.production…
  /\.pem($|[\s"'])/i,
  /\.key($|[\s"'])/i,
  /cuenta-servicio[\w.-]*\.json/i,
  /firebase-adminsdk[\w.-]*\.json/i,
  /service-?account[\w.-]*\.json/i,
  /id_(rsa|ed25519)/i,
  /[\\/]\.ssh[\\/]/i,
  /[\\/]\.aws[\\/]/i,
  /\.vercel[\\/]/i,
];

// Comandos que vuelcan variables de entorno o secretos de los CLI.
const COMANDO_PROHIBIDO = [
  /\bprintenv\b/i,
  /^\s*env\s*$/i,
  /\bset\s*$/i,
  /Get-ChildItem\s+env:/i,
  /\$env:[A-Z_]*(KEY|TOKEN|SECRET|PRIVATE)/i,
  /\bvercel\s+env\s+pull\b.*--(yes|y)\b.*\bcat\b/i,
  /\bfirebase\s+login:ci\b/i,
  /\bgh\s+auth\s+token\b/i,
];

function normalizar(p) {
  return path.resolve(p).replace(/\\/g, "/").toLowerCase();
}

/** Convierte /c/Users/... (Git Bash) a C:/Users/... */
function desdeGitBash(p) {
  const m = /^\/([a-z])\/(.*)$/i.exec(p);
  return m ? `${m[1]}:/${m[2]}` : p;
}

export function dentroDelProyecto(ruta, raiz) {
  if (!ruta) return true;
  const absoluta = path.isAbsolute(desdeGitBash(ruta))
    ? desdeGitBash(ruta)
    : path.join(raiz, ruta);
  const r = normalizar(raiz);
  const a = normalizar(absoluta);
  return a === r || a.startsWith(r + "/");
}

function rutasDeEntrada(herramienta, entrada) {
  switch (herramienta) {
    case "Read":
    case "Write":
    case "Edit":
    case "NotebookEdit":
      return [entrada.file_path ?? entrada.notebook_path];
    case "Glob":
    case "Grep":
      return [entrada.path, entrada.pattern, entrada.glob].filter(Boolean);
    default:
      return [];
  }
}

/** Extrae rutas absolutas o con .. de un comando de shell. */
function rutasDeComando(comando) {
  const rutas = [];
  const re = /(?:^|[\s"'=(])((?:[a-z]:[\\/]|\/[a-z]\/|~[\\/]|\.\.[\\/]|\/(?:etc|home|users|root|tmp|var)\b)[^\s"';|&)]*)/gi;
  let m;
  while ((m = re.exec(comando))) rutas.push(m[1]);
  return rutas;
}

export function evaluar({ tool_name: herramienta, tool_input: entrada = {} }, raiz) {
  const textos = [];

  if (herramienta === "Bash" || herramienta === "PowerShell") {
    const comando = String(entrada.command ?? "");
    for (const re of COMANDO_PROHIBIDO) {
      if (re.test(comando)) {
        return { permitido: false, motivo: `Comando bloqueado: puede exponer secretos (${re}).` };
      }
    }
    textos.push(comando);
    for (const ruta of rutasDeComando(comando)) {
      const expandida = ruta.startsWith("~") ? path.join("/fuera-del-proyecto", ruta.slice(1)) : ruta;
      if (!dentroDelProyecto(expandida, raiz)) {
        return { permitido: false, motivo: `Ruta fuera del proyecto: ${ruta}` };
      }
    }
  } else {
    for (const ruta of rutasDeEntrada(herramienta, entrada)) {
      if (typeof ruta !== "string") continue;
      textos.push(ruta);
      const esPatron = /[*?{]/.test(ruta) && herramienta !== "Read";
      if (!esPatron && !dentroDelProyecto(ruta, raiz)) {
        return { permitido: false, motivo: `Ruta fuera del proyecto: ${ruta}` };
      }
      if (ruta.includes("..") && !dentroDelProyecto(ruta, raiz)) {
        return { permitido: false, motivo: `Ruta fuera del proyecto: ${ruta}` };
      }
    }
  }

  for (const texto of textos) {
    for (const re of SECRETO) {
      if (re.test(texto)) {
        return { permitido: false, motivo: `Acceso a archivo de secretos bloqueado (${re}).` };
      }
    }
  }
  return { permitido: true, motivo: "" };
}
