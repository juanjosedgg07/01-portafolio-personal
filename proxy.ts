import { NextResponse, type NextRequest } from "next/server";

/**
 * Solo mejora la experiencia: si falta la cookie, redirige a /login.
 * NO es una frontera de seguridad: cada página y ruta privada vuelve a verificar
 * la sesión con verifySessionCookie (requerirAdmin / usuarioActual).
 */
export function proxy(request: NextRequest) {
  if (!request.cookies.has("sesion")) {
    const login = new URL("/login", request.url);
    login.searchParams.set("volver", request.nextUrl.pathname);
    return NextResponse.redirect(login);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
