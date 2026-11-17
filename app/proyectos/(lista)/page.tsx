import type { Metadata } from "next";
import { TarjetaProyecto } from "@/src/components/TarjetaProyecto";
import { proyectosServicio } from "@/src/services/proyectosServicio";

export const revalidate = 60;
export const metadata: Metadata = {
  title: "Proyectos",
  description: "Todos los proyectos publicados del portafolio.",
  alternates: { canonical: "/proyectos" },
};

export default async function Proyectos() {
  const { items } = await proyectosServicio.listar({ limite: 100, todos: false }, null);
  return (
    <section className="contenedor seccion" aria-labelledby="titulo-proyectos">
      <h1 id="titulo-proyectos">Proyectos</h1>
      {items.length === 0 ? (
        <p className="aviso">Todavía no hay proyectos publicados.</p>
      ) : (
        <ul role="list" className="rejilla">
          {items.map((p) => (
            <li key={p.slug}>
              <TarjetaProyecto proyecto={p} nivel={2} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
