import { cookies } from "next/headers";
import { authAdmin } from "@/src/lib/firebase/admin";
import { COOKIE_SESION, DURACION_SESION_MS, MAX_ANTIGUEDAD_LOGIN_S, usuarioOpcional } from "@/src/lib/auth";
import { ErrorApi, noAutenticado } from "@/src/lib/errores";
import { leerCuerpo, manejar, sinContenido } from "@/src/lib/http";
import { ipDe, limitar } from "@/src/lib/limiteFrecuencia";
import { esquemaSesion } from "@/src/schemas/comunes";

export const runtime = "nodejs";

/** POST /api/auth/sesion: cambia un idToken reciente por una cookie de sesión HttpOnly. */
export const POST = manejar(async (request) => {
  limitar(`sesion:${ipDe(request)}`, 10, 60_000);
  const { idToken } = await leerCuerpo(request, esquemaSesion);

  let decodificado;
  try {
    decodificado = await authAdmin().verifyIdToken(idToken, true);
  } catch {
    throw noAutenticado("Token de inicio de sesión no válido.");
  }
  // Exige un inicio de sesión reciente: un idToken robado y viejo no sirve.
  if (Date.now() / 1000 - decodificado.auth_time > MAX_ANTIGUEDAD_LOGIN_S) {
    throw new ErrorApi(401, "Inicie sesión de nuevo (el inicio de sesión no es reciente).");
  }

  const cookie = await authAdmin().createSessionCookie(idToken, { expiresIn: DURACION_SESION_MS });
  (await cookies()).set(COOKIE_SESION, cookie, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: DURACION_SESION_MS / 1000,
  });
  return sinContenido();
});

/** DELETE /api/auth/sesion: borra la cookie y revoca los refresh tokens. */
export const DELETE = manejar(async (request) => {
  const usuario = await usuarioOpcional(request);
  if (usuario) await authAdmin().revokeRefreshTokens(usuario.uid).catch(() => undefined);
  (await cookies()).set(COOKIE_SESION, "", { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 0 });
  return sinContenido();
});
