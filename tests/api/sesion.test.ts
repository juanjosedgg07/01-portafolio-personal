import { beforeEach, describe, expect, it, vi } from "vitest";
import { authFalso, solicitud } from "../ayudas";

const almacen = new Map<string, { valor: string; opciones: Record<string, unknown> }>();
vi.mock("next/headers", () => ({
  cookies: async () => ({
    set: (nombre: string, valor: string, opciones: Record<string, unknown>) => almacen.set(nombre, { valor, opciones }),
    get: (nombre: string) => (almacen.has(nombre) ? { value: almacen.get(nombre)!.valor } : undefined),
  }),
}));
vi.mock("@/src/lib/firebase/admin", () => ({ firebaseConfigurado: () => true, authAdmin: () => authFalso }));

const sesion = await import("@/app/api/auth/sesion/route");
const yo = await import("@/app/api/auth/yo/route");
const { reiniciarLimites } = await import("@/src/lib/limiteFrecuencia");
const p = { params: Promise.resolve({}) };

beforeEach(() => {
  almacen.clear();
  reiniciarLimites();
});

describe("POST /api/auth/sesion", () => {
  it("responde 204 y fija la cookie con las banderas de seguridad", async () => {
    authFalso.verifyIdToken.mockResolvedValueOnce({ uid: "uid-admin", email: "a@e.com", rol: "admin", auth_time: Math.floor(Date.now() / 1000) } as never);
    const res = await sesion.POST(solicitud("/api/auth/sesion", { metodo: "POST", cuerpo: { idToken: "t".repeat(40) } }), p);
    expect(res.status).toBe(204);
    const cookie = almacen.get("sesion")!;
    expect(cookie.valor).toBe("cookie-de-sesion-firmada");
    expect(cookie.opciones).toMatchObject({ httpOnly: true, secure: true, sameSite: "lax", path: "/" });
    expect(cookie.opciones.maxAge).toBe(5 * 24 * 60 * 60);
  });

  it("responde 401 si el inicio de sesión no es reciente", async () => {
    authFalso.verifyIdToken.mockResolvedValueOnce({ uid: "u", auth_time: Math.floor(Date.now() / 1000) - 3600 } as never);
    const res = await sesion.POST(solicitud("/api/auth/sesion", { metodo: "POST", cuerpo: { idToken: "t".repeat(40) } }), p);
    expect(res.status).toBe(401);
    expect(almacen.has("sesion")).toBe(false);
  });

  it("responde 401 con un idToken inválido y 400 sin idToken", async () => {
    authFalso.verifyIdToken.mockRejectedValueOnce(new Error("malo"));
    expect((await sesion.POST(solicitud("/api/auth/sesion", { metodo: "POST", cuerpo: { idToken: "t".repeat(40) } }), p)).status).toBe(401);
    expect((await sesion.POST(solicitud("/api/auth/sesion", { metodo: "POST", cuerpo: {} }), p)).status).toBe(400);
  });
});

describe("DELETE /api/auth/sesion y GET /api/auth/yo", () => {
  it("DELETE borra la cookie (maxAge 0) y revoca los tokens", async () => {
    const res = await sesion.DELETE(solicitud("/api/auth/sesion", { metodo: "DELETE", sesion: "admin" }), p);
    expect(res.status).toBe(204);
    expect(almacen.get("sesion")!.opciones.maxAge).toBe(0);
    expect(authFalso.revokeRefreshTokens).toHaveBeenCalledWith("uid-admin");
  });

  it("GET /api/auth/yo devuelve el usuario o 401", async () => {
    const ok = await yo.GET(solicitud("/api/auth/yo", { sesion: "admin" }), p);
    expect(await ok.json()).toEqual({ usuario: { uid: "uid-admin", correo: "admin@ejemplo.com", rol: "admin" } });
    expect((await yo.GET(solicitud("/api/auth/yo"), p)).status).toBe(401);
  });
});
