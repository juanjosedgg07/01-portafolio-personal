import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { FormularioContacto } from "@/src/components/FormularioContacto";
import { EstadoError, EstadoVacio, EstadoCargando } from "@/src/components/Estados";
import { CopiarCorreo } from "@/src/components/CopiarCorreo";

/** Reto de excelencia: pruebas de accesibilidad de componentes con axe dentro de Vitest. */
async function violaciones(contenedor: HTMLElement) {
  const r = await axe.run(contenedor, { rules: { "color-contrast": { enabled: false } } }); // jsdom no calcula estilos
  return r.violations.map((v) => `${v.id}: ${v.help}`);
}

describe("axe: 0 violaciones", () => {
  it("formulario de contacto vacío", async () => {
    const { container } = render(<FormularioContacto />);
    expect(await violaciones(container)).toEqual([]);
  });

  it("formulario de contacto con errores visibles", async () => {
    const { container } = render(<FormularioContacto />);
    await userEvent.setup().click(screen.getByRole("button", { name: "Enviar mensaje" }));
    expect(await violaciones(container)).toEqual([]);
  });

  it("estados de carga, vacío y error", async () => {
    const { container } = render(
      <main>
        <EstadoCargando />
        <EstadoVacio>Nada por aquí.</EstadoVacio>
        <EstadoError mensaje="Falló" alReintentar={() => undefined} />
      </main>,
    );
    expect(await violaciones(container)).toEqual([]);
  });

  it("copiar correo", async () => {
    const { container } = render(<CopiarCorreo correo="ana@ejemplo.com" />);
    expect(await violaciones(container)).toEqual([]);
  });
});
