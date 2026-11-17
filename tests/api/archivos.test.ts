import { describe, expect, it, vi } from "vitest";
import { authFalso, solicitud } from "../ayudas";

vi.mock("@/src/lib/firebase/admin", () => ({ firebaseConfigurado: () => false, authAdmin: () => authFalso }));
const del = vi.fn(async () => undefined);
vi.mock("@vercel/blob", () => ({ del }));

const { POST, DELETE } = await import("@/app/api/archivos/route");
const { memoria } = await import("@/src/repositories/memoria");
const p = { params: Promise.resolve({}) };
const HOST = "https://abc123.public.blob.vercel-storage.com";

describe("/api/archivos: el archivo debe pertenecer al usuario", () => {
  it("registrar una URL de la carpeta de otro usuario responde 403", async () => {
    const res = await POST(
      solicitud("/api/archivos", {
        metodo: "POST",
        sesion: "admin",
        cuerpo: { url: `${HOST}/usuarios/otro/perfil/a.webp`, pathname: "usuarios/otro/perfil/a.webp", destino: { tipo: "perfil" } },
      }),
      p,
    );
    expect(res.status).toBe(403);
  });

  it("registrar una URL que no es de Vercel Blob responde 403", async () => {
    const res = await POST(
      solicitud("/api/archivos", {
        metodo: "POST",
        sesion: "admin",
        cuerpo: { url: "https://malo.example/usuarios/uid-admin/perfil/a.webp", pathname: "usuarios/uid-admin/perfil/a.webp", destino: { tipo: "perfil" } },
      }),
      p,
    );
    expect(res.status).toBe(403);
  });

  it("registrar una captura propia la agrega al proyecto (201)", async () => {
    const url = `${HOST}/usuarios/uid-admin/proyectos/api-de-clima/c-x1y2.webp`;
    const res = await POST(
      solicitud("/api/archivos", {
        metodo: "POST",
        sesion: "admin",
        cuerpo: { url, pathname: "usuarios/uid-admin/proyectos/api-de-clima/c-x1y2.webp", destino: { tipo: "proyecto", slug: "api-de-clima" } },
      }),
      p,
    );
    expect(res.status).toBe(201);
    expect(memoria.proyectos.get("api-de-clima")!.imagenes).toContain(url);
  });

  it("borrar un archivo ajeno responde 403 y no llama a del()", async () => {
    del.mockClear();
    const res = await DELETE(
      solicitud("/api/archivos", { metodo: "DELETE", sesion: "admin", cuerpo: { url: `${HOST}/usuarios/otro/x.webp`, destino: { tipo: "perfil" } } }),
      p,
    );
    expect(res.status).toBe(403);
    expect(del).not.toHaveBeenCalled();
  });

  it("sin sesión responde 401", async () => {
    const res = await DELETE(solicitud("/api/archivos", { metodo: "DELETE", cuerpo: { url: `${HOST}/x.webp`, destino: { tipo: "perfil" } } }), p);
    expect(res.status).toBe(401);
  });
});
