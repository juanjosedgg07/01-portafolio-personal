import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Página no encontrada", robots: { index: false } };

export default function NoEncontrado() {
  return (
    <section className="contenedor seccion" aria-labelledby="titulo-404">
      <p className="antetitulo">Error 404</p>
      <h1 id="titulo-404">No encontramos esa página</h1>
      <p>Puede que el proyecto se haya retirado o que la dirección tenga un error.</p>
      <p style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
        <Link href="/" className="boton">
          Ir al inicio
        </Link>
        <Link href="/proyectos" className="boton boton--secundario">
          Ver proyectos
        </Link>
      </p>
    </section>
  );
}
