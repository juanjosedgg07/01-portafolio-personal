import { beforeEach, describe, expect, it, vi } from "vitest";
import { authFalso, solicitud } from "../ayudas";

/**
 * Integración: ruta → servicio → repositorio (repositorio simulado).
 * Caso crítico: crear un proyecto. El orden lo calcula el servicio, no el cliente,
 * y un slug duplicado (error del repositorio) llega como 409.
 */
vi.mock("@/src/lib/firebase/admin", () => ({ firebaseConfigurado: () => true, authAdmin: () => authFalso }));

const repo = vi.hoisted(() => ({
  siguienteOrden: vi.fn(),
  crear: vi.fn(),
  listar: vi.fn(),
  obtener: vi.fn(),
}));
vi.mock("@/src/repositories/proyectosRepositorio", () => ({ proyectosRepositorio: repo }));

const { POST } = await import("@/app/api/proyectos/route");
const { conflicto } = await import("@/src/lib/errores");
const p = { params: Promise.resolve({}) };

const entrada = { slug: "nuevo", titulo: "Nuevo", descripcion: "Descripción del proyecto nuevo.", tecnologias: [" React ", "Zod"] };

beforeEach(() => {
  vi.clearAllMocks();
  repo.siguienteOrden.mockResolvedValue(4);
  repo.crear.mockImplementation(async (e, orden) => ({ ...e, imagenes: [], orden }));
});

describe("Crear proyecto (ruta → servicio → repositorio)", () => {
  it("valida, normaliza, asigna el orden en el servidor y persiste", async () => {
    const res = await POST(solicitud("/api/proyectos", { metodo: "POST", cuerpo: entrada, sesion: "admin" }), p);
    expect(res.status).toBe(201);
    expect(repo.siguienteOrden).toHaveBeenCalledOnce();
    expect(repo.crear).toHaveBeenCalledWith(
      { slug: "nuevo", titulo: "Nuevo", descripcion: "Descripción del proyecto nuevo.", tecnologias: ["React", "Zod"], enlace: null, publicado: true },
      4,
    );
    expect((await res.json()).proyecto.orden).toBe(4);
  });

  it("un conflicto del repositorio se convierte en 409 con el formato de error común", async () => {
    repo.crear.mockRejectedValueOnce(conflicto("Ya existe un proyecto con ese slug."));
    const res = await POST(solicitud("/api/proyectos", { metodo: "POST", cuerpo: entrada, sesion: "admin" }), p);
    expect(res.status).toBe(409);
    expect(await res.json()).toEqual({ error: "Ya existe un proyecto con ese slug." });
  });

  it("un error inesperado responde 500 sin detalles internos", async () => {
    repo.crear.mockRejectedValueOnce(new Error("FIRESTORE: credencial xyz caducada"));
    const res = await POST(solicitud("/api/proyectos", { metodo: "POST", cuerpo: entrada, sesion: "admin" }), p);
    expect(res.status).toBe(500);
    const texto = await res.text();
    expect(texto).not.toContain("FIRESTORE");
    expect(JSON.parse(texto)).toEqual({ error: "Error interno del servidor." });
  });

  it("sin sesión no llega al repositorio", async () => {
    const res = await POST(solicitud("/api/proyectos", { metodo: "POST", cuerpo: entrada }), p);
    expect(res.status).toBe(401);
    expect(repo.crear).not.toHaveBeenCalled();
  });
});
