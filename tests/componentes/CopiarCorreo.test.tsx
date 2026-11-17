import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CopiarCorreo } from "@/src/components/CopiarCorreo";

afterEach(() => vi.restoreAllMocks());

describe("CopiarCorreo (Clipboard API con alternativa)", () => {
  it("copia el correo y lo anuncia", async () => {
    const u = userEvent.setup();
    const escribir = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue();
    render(<CopiarCorreo correo="ana@ejemplo.com" />);
    await u.click(screen.getByRole("button", { name: "Copiar correo" }));
    expect(escribir).toHaveBeenCalledWith("ana@ejemplo.com");
    expect(screen.getByRole("status")).toHaveTextContent("Correo copiado");
  });

  it("si el permiso se niega, selecciona el texto y explica cómo copiar", async () => {
    const u = userEvent.setup();
    vi.spyOn(navigator.clipboard, "writeText").mockRejectedValue(new Error("denegado"));
    render(<CopiarCorreo correo="ana@ejemplo.com" />);
    await u.click(screen.getByRole("button", { name: "Copiar correo" }));
    expect(screen.getByRole("status")).toHaveTextContent("Ctrl+C");
    expect(window.getSelection()?.toString()).toBe("ana@ejemplo.com");
  });
});
