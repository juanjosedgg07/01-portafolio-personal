import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FormularioContacto } from "@/src/components/FormularioContacto";

const fetchFalso = vi.fn();

beforeEach(() => {
  fetchFalso.mockReset();
  vi.stubGlobal("fetch", fetchFalso);
});
afterEach(() => vi.unstubAllGlobals());

async function llenar(datos: { nombre?: string; correo?: string; texto?: string }) {
  const u = userEvent.setup();
  if (datos.nombre) await u.type(screen.getByLabelText("Nombre"), datos.nombre);
  if (datos.correo) await u.type(screen.getByLabelText("Correo electrónico"), datos.correo);
  if (datos.texto) await u.type(screen.getByLabelText("Mensaje"), datos.texto);
  await u.click(screen.getByRole("button", { name: "Enviar mensaje" }));
}

describe("FormularioContacto", () => {
  it("muestra los errores junto a cada campo y no envía con datos inválidos", async () => {
    render(<FormularioContacto />);
    await llenar({ nombre: "A", correo: "no-es-correo", texto: "corto" });

    expect(fetchFalso).not.toHaveBeenCalled();
    expect(screen.getByText("El nombre debe tener al menos 2 caracteres.")).toBeInTheDocument();
    expect(screen.getByText("El mensaje debe tener al menos 10 caracteres.")).toBeInTheDocument();
  });

  it("un correo inválido marca el campo y asocia el error para lectores de pantalla", async () => {
    render(<FormularioContacto />);
    await llenar({ nombre: "Ana Pérez", correo: "ana@", texto: "Un mensaje suficientemente largo." });

    const correo = screen.getByLabelText("Correo electrónico");
    expect(correo).toHaveAttribute("aria-invalid", "true");
    expect(correo).toHaveAccessibleDescription(expect.stringContaining("Escriba un correo válido"));
    expect(correo).toHaveFocus(); // el foco va al primer campo con error
    // El resumen se anuncia en la región viva (role=status)
    expect(screen.getByRole("status")).toHaveTextContent("1 campo(s) con errores");
    expect(fetchFalso).not.toHaveBeenCalled();
  });

  it("con datos válidos envía a la API y anuncia el éxito", async () => {
    fetchFalso.mockResolvedValue(new Response(JSON.stringify({ recibido: true }), { status: 201 }));
    render(<FormularioContacto />);
    await llenar({ nombre: "Ana Pérez", correo: "ana@ejemplo.com", texto: "Hola, me interesa su trabajo." });

    expect(fetchFalso).toHaveBeenCalledWith("/api/mensajes", expect.objectContaining({ method: "POST" }));
    const cuerpo = JSON.parse(fetchFalso.mock.calls[0][1].body);
    expect(cuerpo).toMatchObject({ nombre: "Ana Pérez", correo: "ana@ejemplo.com" });
    expect(await screen.findByText(/Su mensaje fue enviado/)).toBeInTheDocument();
  });

  it("si la API responde 429 muestra el error y permite reintentar", async () => {
    fetchFalso.mockResolvedValue(new Response(JSON.stringify({ error: "Demasiadas" }), { status: 429 }));
    render(<FormularioContacto />);
    await llenar({ nombre: "Ana Pérez", correo: "ana@ejemplo.com", texto: "Hola, me interesa su trabajo." });

    expect(await screen.findByText(/Ha enviado demasiados mensajes/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reintentar" })).toBeInTheDocument();
  });
});
