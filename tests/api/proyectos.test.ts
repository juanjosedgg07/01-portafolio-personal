import { beforeEach, describe, expect, it, vi } from "vitest";
import { authFalso, ctx, solicitud } from "../ayudas";

vi.mock("@/src/lib/firebase/admin", () => ({
  firebaseConfigurado: () => false,
  authAdmin: () => authFalso,
  firestore: () => {
    throw new Error("No debe usarse Firestore en las pruebas");
  },
}));
vi.mock("@vercel/blob", () => ({ del: vi.fn(async () => undefined) }));

const lista = await import("@/app/api/proyectos/route");
const uno = await import("@/app/api/proyectos/[slug]/route");
const { memoria } = await import("@/src/repositories/memoria");
const { reiniciarLimites } = await import("@/src/lib/limiteFrecuencia");

const nuevo = { slug: "mi-proyecto", titulo: "Mi proyecto", descripcion: "Una descripción suficientemente larga.", tecnologias: ["Next.js"] };
const sinParams = { params: Promise.resolve({}) };

beforeEach(() => {
  memoria.proyectos.delete("mi-proyecto");
  memoria.proyectos.delete("borrador");
  reiniciarLimites();
});

describe("Autenticación (401)", () => {
  it("crear un proyecto sin sesión responde 401", async () => {
    const res = await lista.POST(solicitud("/api/proyectos", { metodo: "POST", cuerpo: nuevo }), sinParams);
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "Debe iniciar sesión." });
    expect(memoria.proyectos.has("mi-proyecto")).toBe(false);
  });

  it("una cookie de sesión inválida responde 401", async () => {
    const res = await lista.POST(solicitud("/api/proyectos", { metodo: "POST", cuerpo: nuevo, sesion: "invalida" }), sinParams);
    expect(res.status).toBe(401);
  });
});

describe("Autorización (403/404)", () => {
  it("un usuario sin rol admin no puede crear (403)", async () => {
    const res = await lista.POST(solicitud("/api/proyectos", { metodo: "POST", cuerpo: nuevo, sesion: "usuario" }), sinParams);
    expect(res.status).toBe(403);
  });

  it("un borrador responde 404 a los visitantes y 200 al admin", async () => {
    memoria.proyectos.set("borrador", { ...nuevo, slug: "borrador", imagenes: [], enlace: null, orden: 99, publicado: false });
    expect((await uno.GET(solicitud("/api/proyectos/borrador"), ctx({ slug: "borrador" }))).status).toBe(404);
    expect((await uno.GET(solicitud("/api/proyectos/borrador", { sesion: "admin" }), ctx({ slug: "borrador" }))).status).toBe(200);
  });

  it("los visitantes no ven borradores aunque pidan ?todos=1", async () => {
    memoria.proyectos.set("borrador", { ...nuevo, slug: "borrador", imagenes: [], enlace: null, orden: 99, publicado: false });
    const res = await lista.GET(solicitud("/api/proyectos?todos=1&limite=100"), sinParams);
    const { items } = await res.json();
    expect(items.some((p: { slug: string }) => p.slug === "borrador")).toBe(false);
  });

  it("editar un proyecto inexistente responde 404", async () => {
    const res = await uno.PUT(solicitud("/api/proyectos/no-existe", { metodo: "PUT", cuerpo: { titulo: "Nuevo título" }, sesion: "admin" }), ctx({ slug: "no-existe" }));
    expect(res.status).toBe(404);
  });
});

describe("Validación (400) y conflicto (409)", () => {
  it("un slug con mayúsculas o espacios responde 400 con detalle", async () => {
    const res = await lista.POST(solicitud("/api/proyectos", { metodo: "POST", cuerpo: { ...nuevo, slug: "Mi Proyecto" }, sesion: "admin" }), sinParams);
    expect(res.status).toBe(400);
    expect((await res.json()).detalles[0].campo).toBe("slug");
  });

  it("el cliente no puede fijar el orden ni las imágenes (campos desconocidos → 400)", async () => {
    const res = await lista.POST(solicitud("/api/proyectos", { metodo: "POST", cuerpo: { ...nuevo, orden: -1, imagenes: ["x"] }, sesion: "admin" }), sinParams);
    expect(res.status).toBe(400);
  });

  it("crear con datos válidos responde 201 y un slug repetido responde 409", async () => {
    const crear = () => lista.POST(solicitud("/api/proyectos", { metodo: "POST", cuerpo: nuevo, sesion: "admin" }), sinParams);
    const res = await crear();
    expect(res.status).toBe(201);
    expect(res.headers.get("location")).toBe("/api/proyectos/mi-proyecto");
    expect((await crear()).status).toBe(409);
  });

  it("acepta Authorization: Bearer <idToken> (Bruno/Postman)", async () => {
    const res = await lista.POST(solicitud("/api/proyectos", { metodo: "POST", cuerpo: nuevo, bearer: "admin" }), sinParams);
    expect(res.status).toBe(201);
  });
});

describe("Listas con cursor", () => {
  it("pagina con limite y siguienteCursor", async () => {
    const p1 = await (await lista.GET(solicitud("/api/proyectos?limite=2"), sinParams)).json();
    expect(p1.items).toHaveLength(2);
    expect(p1.siguienteCursor).toBe(p1.items[1].slug);
    const p2 = await (await lista.GET(solicitud(`/api/proyectos?limite=2&cursor=${p1.siguienteCursor}`), sinParams)).json();
    expect(p2.items[0].slug).not.toBe(p1.items[0].slug);
  });
});
