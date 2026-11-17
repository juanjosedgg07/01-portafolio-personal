import { vi } from "vitest";

/**
 * Doble de la capa de Firebase para las pruebas de API.
 * Cookies/tokens de prueba: "admin" → rol admin, "usuario" → sin rol, otro → inválido.
 */
export const authFalso = {
  verifySessionCookie: vi.fn(async (c: string) => decodificar(c)),
  verifyIdToken: vi.fn(async (t: string) => ({ ...decodificar(t), auth_time: Math.floor(Date.now() / 1000) })),
  createSessionCookie: vi.fn(async () => "cookie-de-sesion-firmada"),
  revokeRefreshTokens: vi.fn(async () => undefined),
};

function decodificar(valor: string) {
  if (valor === "admin") return { uid: "uid-admin", email: "admin@ejemplo.com", rol: "admin" };
  if (valor === "usuario") return { uid: "uid-usuario", email: "otro@ejemplo.com" };
  throw new Error("token inválido");
}

type Opciones = { metodo?: string; cuerpo?: unknown; sesion?: "admin" | "usuario" | "invalida"; bearer?: string; origen?: string; ip?: string };

/** Crea un Request como el que recibe un Route Handler. */
export function solicitud(ruta: string, o: Opciones = {}) {
  const headers = new Headers();
  if (o.cuerpo !== undefined) headers.set("content-type", "application/json");
  if (o.sesion) headers.set("cookie", `sesion=${o.sesion}`);
  if (o.bearer) headers.set("authorization", `Bearer ${o.bearer}`);
  if (o.origen) headers.set("origin", o.origen);
  headers.set("x-forwarded-for", o.ip ?? `10.0.0.${Math.floor(Math.random() * 250)}`);
  return new Request(`http://localhost:3000${ruta}`, {
    method: o.metodo ?? "GET",
    headers,
    body: o.cuerpo !== undefined ? JSON.stringify(o.cuerpo) : undefined,
  });
}

export const ctx = <P>(params: P) => ({ params: Promise.resolve(params) });
