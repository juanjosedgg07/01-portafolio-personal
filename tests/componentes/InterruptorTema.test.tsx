import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { InterruptorTema } from "@/src/components/InterruptorTema";

beforeEach(() => {
  document.documentElement.dataset.theme = "claro";
  localStorage.clear();
});

describe("InterruptorTema", () => {
  it("es un botón conmutador que cambia el tema y lo guarda en localStorage", async () => {
    const u = userEvent.setup();
    render(<InterruptorTema />);
    const boton = screen.getByRole("button", { name: /tema oscuro/i });
    expect(boton).toHaveAttribute("aria-pressed", "false");

    await u.click(boton);
    expect(document.documentElement.dataset.theme).toBe("oscuro");
    expect(localStorage.getItem("tema")).toBe("oscuro");
    expect(await screen.findByRole("button", { name: /tema oscuro/i, pressed: true })).toBeInTheDocument();
  });

  it("se puede usar solo con teclado", async () => {
    const u = userEvent.setup();
    render(<InterruptorTema />);
    await u.tab();
    expect(screen.getByRole("button", { name: /tema oscuro/i })).toHaveFocus();
    await u.keyboard("{Enter}");
    expect(document.documentElement.dataset.theme).toBe("oscuro");
  });
});
