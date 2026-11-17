import { beforeEach, describe, expect, it, vi } from "vitest";
import { authFalso, solicitud } from "../ayudas";

// Se simula la capa de Firebase: sin credenciales los repositorios usan el almacén en memoria.
vi.mock("@/src/lib/firebase/admin", () => ({
  firebaseConfigurado: () => false,
  authAdmin: () => authFalso,
  firestore: () => {
    throw new Error("No debe usarse Firestore en las pruebas");
  },
}));

const { POST, GET } = await import("@/app/api/mensajes/route");
const { memoria } = await import("@/src/repositories/memoria");
const { reiniciarLimites } = await import("@/src/lib/limiteFrecuencia");

const valido = { nombre: "Ana Pérez", correo: "ana@ejemplo.com", texto: "Hola, me interesa su trabajo." };

beforeEach(() => {
  memoria.mensajes.clear();
  reiniciarLimites();
});

describe("POST /api/mensajes", () => {
  it("responde 400 con detalle por campo si los datos no son válidos", async () => {
    const res = await POST(solicitud("/api/mensajes", { metodo: "POST", cuerpo: { nombre: "A", correo: "no-es-correo", texto: "corto" } }), { params: Promise.resolve({}) });
    expect(res.status).toBe(400);
    const cuerpo = await res.json();
    expect(cuerpo.error).toBeTruthy();
    expect(cuerpo.detalles.map((d: { campo: string }) => d.campo).sort()).toEqual(["correo", "nombre", "texto"]);
    expect(memoria.mensajes.size).toBe(0);
  });

  it("responde 201 y guarda el mensaje con datos válidos", async () => {
    const res = await POST(solicitud("/api/mensajes", { metodo: "POST", cuerpo: valido }), { params: Promise.resolve({}) });
    expect(res.status).toBe(201);
    expect(memoria.mensajes.size).toBe(1);
    const guardado = [...memoria.mensajes.values()][0];
    expect(guardado).toMatchObject({ nombre: "Ana Pérez", correo: "ana@ejemplo.com", leido: false });
  });

  it("rechaza campos desconocidos (modo estricto, evita mass assignment)", async () => {
    const res = await POST(solicitud("/api/mensajes", { metodo: "POST", cuerpo: { ...valido, leido: true } }), { params: Promise.resolve({}) });
    expect(res.status).toBe(400);
  });

  it("con el campo trampa lleno responde 201 pero no guarda nada", async () => {
    const res = await POST(solicitud("/api/mensajes", { metodo: "POST", cuerpo: { ...valido, sitioWeb: "http://spam.example" } }), { params: Promise.resolve({}) });
    expect(res.status).toBe(201);
    expect(memoria.mensajes.size).toBe(0);
  });

  it("responde 429 al superar el límite por IP", async () => {
    const enviar = () => POST(solicitud("/api/mensajes", { metodo: "POST", cuerpo: valido, ip: "1.2.3.4" }), { params: Promise.resolve({}) });
    for (let i = 0; i < 5; i++) expect((await enviar()).status).toBe(201);
    expect((await enviar()).status).toBe(429);
  });

  it("responde 415 si el cuerpo no es JSON", async () => {
    const req = new Request("http://localhost:3000/api/mensajes", { method: "POST", body: "nombre=Ana", headers: { "content-type": "application/x-www-form-urlencoded" } });
    expect((await POST(req, { params: Promise.resolve({}) })).status).toBe(415);
  });

  it("responde 403 si el Origin es de otro sitio (CSRF)", async () => {
    const res = await POST(solicitud("/api/mensajes", { metodo: "POST", cuerpo: valido, origen: "https://atacante.example" }), { params: Promise.resolve({}) });
    expect(res.status).toBe(403);
  });
});

describe("GET /api/mensajes", () => {
  it("responde 401 sin sesión", async () => {
    expect((await GET(solicitud("/api/mensajes"), { params: Promise.resolve({}) })).status).toBe(401);
  });

  it("responde 403 con sesión que no es del dueño", async () => {
    expect((await GET(solicitud("/api/mensajes", { sesion: "usuario" }), { params: Promise.resolve({}) })).status).toBe(403);
  });

  it("responde 200 con lista paginada para el dueño, sin caché compartida", async () => {
    await POST(solicitud("/api/mensajes", { metodo: "POST", cuerpo: valido }), { params: Promise.resolve({}) });
    const res = await GET(solicitud("/api/mensajes?limite=10", { sesion: "admin" }), { params: Promise.resolve({}) });
    expect(res.status).toBe(200);
    expect(res.headers.get("cache-control")).toBe("no-store");
    const cuerpo = await res.json();
    expect(cuerpo.items).toHaveLength(1);
    expect(cuerpo.siguienteCursor).toBeNull();
  });

  it("responde 400 si el límite supera 100", async () => {
    expect((await GET(solicitud("/api/mensajes?limite=500", { sesion: "admin" }), { params: Promise.resolve({}) })).status).toBe(400);
  });
});
