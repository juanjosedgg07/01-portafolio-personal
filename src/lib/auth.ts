import "server-only";
import { cookies } from "next/headers";
import { authAdmin } from "@/src/lib/firebase/admin";
import { noAutenticado, prohibido } from "@/src/lib/errores";

export const COOKIE_SESION = "sesion";
export const DURACION_SESION_MS = 5 * 24 * 60 * 60 * 1000; // 5 días
export const MAX_ANTIGUEDAD_LOGIN_S = 5 * 60; // el login debe ser de hace menos de 5 minutos

export type Usuario = { uid: string; correo: string | null; rol: "admin" | "usuario" };

type Claims = { uid: string; email?: string; rol?: unknown };

function aUsuario(c: Claims): Usuario {
  return { uid: c.uid, correo: c.email ?? null, rol: c.rol === "admin" ? "admin" : "usuario" };
}

function leerCookie(request: Request, nombre: string): string | undefined {
  const cabecera = request.headers.get("cookie");
  if (!cabecera) return undefined;
  for (const parte of cabecera.split(";")) {
    const [k, ...v] = parte.trim().split("=");
    if (k === nombre) return decodeURIComponent(v.join("="));
  }
  return undefined;
}

/** Verifica la cookie de sesión (o un Bearer idToken para Bruno/Postman). Lanza 401 si no es válida. */
export async function requerirUsuario(request: Request): Promise<Usuario> {
  const cookie = leerCookie(request, COOKIE_SESION);
  const bearer = request.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1];
  try {
    if (cookie) return aUsuario(await authAdmin().verifySessionCookie(cookie, true));
    if (bearer) return aUsuario(await authAdmin().verifyIdToken(bearer, true));
  } catch {
    throw noAutenticado("Sesión no válida o vencida.");
  }
  throw noAutenticado();
}

export async function requerirAdmin(request: Request): Promise<Usuario> {
  const usuario = await requerirUsuario(request);
  if (usuario.rol !== "admin") throw prohibido();
  return usuario;
}

/** Para rutas públicas que muestran más datos al admin: usuario o null (nunca lanza 401). */
export async function usuarioOpcional(request: Request): Promise<Usuario | null> {
  try {
    return await requerirUsuario(request);
  } catch {
    return null;
  }
}

/** Para Server Components: devuelve el usuario de la cookie o null. */
export async function usuarioActual(): Promise<Usuario | null> {
  const cookie = (await cookies()).get(COOKIE_SESION)?.value;
  if (!cookie) return null;
  try {
    return aUsuario(await authAdmin().verifySessionCookie(cookie, true));
  } catch {
    return null;
  }
}
