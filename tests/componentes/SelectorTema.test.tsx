import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SelectorTema } from "@/src/components/SelectorTema";

beforeEach(() => {
  document.documentElement.dataset.theme = "claro";
  localStorage.clear();
});

describe("SelectorTema", () => {
  it("abre un grupo de opciones de radio y aplica el tema elegido", async () => {
    const u = userEvent.setup();
    render(<SelectorTema />);
    const boton = screen.getByRole("button", { name: /tema/i });
    expect(boton).toHaveAttribute("aria-expanded", "false");

    await u.click(boton);
    expect(boton).toHaveAttribute("aria-expanded", "true");
    const grupo = screen.getByRole("group", { name: "Tema visual" });
    expect(grupo).toBeVisible();
    expect(screen.getAllByRole("radio")).toHaveLength(5);

    await u.click(screen.getByRole("radio", { name: "Océano" }));
    expect(document.documentElement.dataset.theme).toBe("oceano");
    expect(localStorage.getItem("tema")).toBe("oceano");
    expect(screen.getByRole("radio", { name: "Océano" })).toBeChecked();
  });

  it("se usa con teclado: flechas para cambiar y Escape devuelve el foco al botón", async () => {
    const u = userEvent.setup();
    render(<SelectorTema />);
    const boton = screen.getByRole("button", { name: /tema/i });
    await u.tab();
    expect(boton).toHaveFocus();
    await u.keyboard("{Enter}");
    expect(screen.getByRole("radio", { name: "Claro" })).toHaveFocus();
    await u.keyboard("{ArrowDown}");
    expect(document.documentElement.dataset.theme).toBe("oscuro");
    await u.keyboard("{Escape}");
    expect(boton).toHaveFocus();
    expect(boton).toHaveAttribute("aria-expanded", "false");
  });

  it("ofrece un tema de alto contraste", async () => {
    const u = userEvent.setup();
    render(<SelectorTema />);
    await u.click(screen.getByRole("button", { name: /tema/i }));
    await u.click(screen.getByRole("radio", { name: "Alto contraste" }));
    expect(document.documentElement.dataset.theme).toBe("contraste");
  });
});
