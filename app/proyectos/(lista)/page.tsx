import type { Metadata } from "next";
import { TarjetaProyecto } from "@/src/components/TarjetaProyecto";
import { FiltroProyectos } from "@/src/components/FiltroProyectos";
import { IconoTecnologia } from "@/src/components/IconoTecnologia";
import { proyectosServicio } from "@/src/services/proyectosServicio";

export const revalidate = 60;
export const metadata: Metadata = {
  title: "Proyectos",
  description: "Todos los proyectos publicados del portafolio, filtrables por tecnología.",
  alternates: { canonical: "/proyectos" },
};

export default async function Proyectos() {
  const { items } = await proyectosServicio.listar({ limite: 100, todos: false }, null);

  // Tecnologías ordenadas por cuántos proyectos las usan.
  const conteo = new Map<string, number>();
  for (const p of items) for (const t of p.tecnologias) conteo.set(t, (conteo.get(t) ?? 0) + 1);
  const tecnologias = [...conteo.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([nombre]) => ({ nombre, icono: <IconoTecnologia nombre={nombre} /> }));

  return (
    <section className="contenedor seccion" aria-labelledby="titulo-proyectos">
      <p className="antetitulo">Portafolio</p>
      <h1 id="titulo-proyectos">Proyectos</h1>
      <p style={{ color: "var(--texto-suave)" }}>Aplicaciones y APIs que he construido. Elija una tecnología para filtrar.</p>
      {items.length === 0 ? (
        <p className="aviso">Todavía no hay proyectos publicados.</p>
      ) : (
        <FiltroProyectos
          tecnologias={tecnologias}
          elementos={items.map((p) => ({ slug: p.slug, tecnologias: p.tecnologias, tarjeta: <TarjetaProyecto proyecto={p} nivel={2} /> }))}
        />
      )}
    </section>
  );
}
