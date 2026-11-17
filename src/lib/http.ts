import type { ZodType } from "zod";
import { ErrorApi, errorDeValidacion } from "@/src/lib/errores";

type Contexto<P> = { params: Promise<P> };
type Manejador<P> = (request: Request, ctx: Contexto<P>) => Promise<Response>;

const METODOS_QUE_MODIFICAN = new Set(["POST", "PUT", "PATCH", "DELETE"]);

/** Registro sin datos personales: método, ruta (sin query), estado, duración e id de petición. */
function registrar(id: string, request: Request, estado: number, inicio: number) {
  if (process.env.NODE_ENV === "test") return;
  const { pathname } = new URL(request.url);
  console.info(JSON.stringify({ id, metodo: request.method, ruta: pathname, estado, ms: Date.now() - inicio }));
}

/** Defensa CSRF: si el navegador envía Origin, debe coincidir con el sitio. */
export function verificarOrigen(request: Request) {
  if (!METODOS_QUE_MODIFICAN.has(request.method)) return;
  const origen = request.headers.get("origin");
  if (!origen) return; // clientes no navegador (Bruno, curl) no envían Origin; igual necesitan credenciales
  const esperado = new URL(request.url).origin;
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") ?? new URL(request.url).protocol.replace(":", "");
  const alternativo = host ? `${proto}://${host}` : esperado;
  if (origen !== esperado && origen !== alternativo) {
    throw new ErrorApi(403, "Origen no permitido.");
  }
}

/** Envoltorio común: id de petición, verificación de origen, errores consistentes y cabeceras. */
export function manejar<P = Record<string, never>>(handler: Manejador<P>): Manejador<P> {
  return async (request, ctx) => {
    const id = crypto.randomUUID();
    const inicio = Date.now();
    let respuesta: Response;
    try {
      verificarOrigen(request);
      respuesta = await handler(request, ctx);
    } catch (e) {
      if (e instanceof ErrorApi) {
        respuesta = Response.json(
          e.detalles ? { error: e.message, detalles: e.detalles } : { error: e.message },
          { status: e.estado },
        );
      } else {
        if (process.env.NODE_ENV !== "test") {
          console.error(JSON.stringify({ id, error: e instanceof Error ? e.name : "Error desconocido" }));
        }
        respuesta = Response.json({ error: "Error interno del servidor." }, { status: 500 });
      }
    }
    respuesta.headers.set("X-Request-Id", id);
    if (!respuesta.headers.has("Cache-Control")) respuesta.headers.set("Cache-Control", "no-store");
    registrar(id, request, respuesta.status, inicio);
    return respuesta;
  };
}

/** Lee y valida el cuerpo JSON con un esquema Zod. 415 si no es JSON, 400 si no valida. */
export async function leerCuerpo<T>(request: Request, esquema: ZodType<T>): Promise<T> {
  const tipo = request.headers.get("content-type") ?? "";
  if (!tipo.includes("application/json")) {
    throw new ErrorApi(415, "El cuerpo debe ser application/json.");
  }
  let datos: unknown;
  try {
    datos = await request.json();
  } catch {
    throw new ErrorApi(400, "JSON mal formado.");
  }
  const r = esquema.safeParse(datos);
  if (!r.success) throw errorDeValidacion(r.error);
  return r.data;
}

export function validarConsulta<T>(request: Request, esquema: ZodType<T>): T {
  const params = Object.fromEntries(new URL(request.url).searchParams);
  const r = esquema.safeParse(params);
  if (!r.success) throw errorDeValidacion(r.error);
  return r.data;
}

export const sinContenido = () => new Response(null, { status: 204 });

export function jsonPublico(datos: unknown, status = 200) {
  return Response.json(datos, {
    status,
    headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
  });
}
