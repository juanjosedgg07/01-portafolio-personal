import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FiltroProyectos } from "@/src/components/FiltroProyectos";
import { Galeria } from "@/src/components/Galeria";

const elementos = [
  { slug: "a", tecnologias: ["React", "Zod"], tarjeta: <article>Proyecto A</article> },
  { slug: "b", tecnologias: ["React"], tarjeta: <article>Proyecto B</article> },
  { slug: "c", tecnologias: ["Node.js"], tarjeta: <article>Proyecto C</article> },
];
const tecnologias = ["React", "Zod", "Node.js"].map((nombre) => ({ nombre, icono: null }));

describe("FiltroProyectos", () => {
  it("filtra por tecnología con botones conmutadores y anuncia el total", async () => {
    const u = userEvent.setup();
    render(<FiltroProyectos tecnologias={tecnologias} elementos={elementos} />);
    expect(screen.getAllByRole("article")).toHaveLength(3);

    const react = screen.getByRole("button", { name: "React" });
    await u.click(react);
    expect(react).toHaveAttribute("aria-pressed", "true");
    expect(screen.getAllByRole("article")).toHaveLength(2);
    expect(screen.getByRole("status")).toHaveTextContent("2 proyecto(s) con React");

    await u.click(screen.getByRole("button", { name: "Quitar filtro" }));
    expect(screen.getAllByRole("article")).toHaveLength(3);
    expect(screen.getByRole("button", { name: "Todas" })).toHaveAttribute("aria-pressed", "true");
  });
});

describe("Galeria", () => {
  const imagenes = ["/ejemplo/x-1.svg", "/ejemplo/x-2.svg", "/ejemplo/x-3.svg"];

  it("abre el visor, navega con las flechas y devuelve el foco al cerrar", async () => {
    const u = userEvent.setup();
    render(<Galeria imagenes={imagenes} titulo="X" />);
    const ampliar = screen.getAllByRole("button", { name: /ampliar/i });
    expect(ampliar).toHaveLength(3);

    await u.click(ampliar[1]);
    const visor = screen.getByRole("dialog", { name: "Captura 2 de 3" });
    expect(within(visor).getByRole("img", { name: "Captura 2 de 3 del proyecto X" })).toBeInTheDocument();

    await u.keyboard("{ArrowRight}");
    expect(screen.getByRole("dialog", { name: "Captura 3 de 3" })).toBeInTheDocument();
    await u.keyboard("{ArrowRight}");
    expect(screen.getByRole("dialog", { name: "Captura 1 de 3" })).toBeInTheDocument();

    await u.click(within(screen.getByRole("dialog")).getByRole("button", { name: /cerrar/i }));
    expect(ampliar[1]).toHaveFocus();
  });
});
