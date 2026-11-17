import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ImagenProyecto } from "@/src/components/ImagenProyecto";
import { JsonLd } from "@/src/components/JsonLd";
import { proyectosServicio } from "@/src/services/proyectosServicio";
import { esquemaSlug } from "@/src/schemas/proyecto";
import { urlSitio } from "@/src/lib/sitio";
import estilos from "./detalle.module.css";

export const revalidate = 60;
export const dynamicParams = true;

type Props = { params: Promise<{ slug: string }> };

async function cargar(slug: string) {
  if (!esquemaSlug.safeParse(slug).success) return null;
  return proyectosServicio.obtenerPublico(slug);
}

export async function generateStaticParams() {
  const { items } = await proyectosServicio.listar({ limite: 100, todos: false }, null);
  return items.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const proyecto = await cargar((await params).slug);
  if (!proyecto) return { title: "Proyecto no encontrado" };
  const imagen = proyecto.imagenes.find((i) => !i.endsWith(".svg"));
  return {
    title: proyecto.titulo,
    description: proyecto.descripcion.slice(0, 160),
    alternates: { canonical: `/proyectos/${proyecto.slug}` },
    openGraph: {
      type: "article",
      title: proyecto.titulo,
      description: proyecto.descripcion.slice(0, 200),
      url: `/proyectos/${proyecto.slug}`,
      images: imagen ? [{ url: imagen, width: 1200, height: 750, alt: proyecto.titulo }] : undefined,
    },
    twitter: { card: imagen ? "summary_large_image" : "summary" },
  };
}

export default async function DetalleProyecto({ params }: Props) {
  const proyecto = await cargar((await params).slug);
  if (!proyecto) notFound();

  return (
    <article className="contenedor seccion">
      <JsonLd
        datos={{
          "@context": "https://schema.org",
          "@type": "CreativeWork",
          name: proyecto.titulo,
          description: proyecto.descripcion,
          url: `${urlSitio()}/proyectos/${proyecto.slug}`,
          keywords: proyecto.tecnologias.join(", "),
        }}
      />
      <nav aria-label="Ruta de navegación" className="no-imprimir">
        <ol role="list" className={estilos.migas}>
          <li>
            <Link href="/">Inicio</Link>
          </li>
          <li>
            <Link href="/proyectos">Proyectos</Link>
          </li>
          <li aria-current="page">{proyecto.titulo}</li>
        </ol>
      </nav>

      <header className={estilos.cabecera}>
        <h1>{proyecto.titulo}</h1>
        {proyecto.tecnologias.length > 0 && (
          <ul role="list" className="lista-etiquetas" aria-label="Tecnologías">
            {proyecto.tecnologias.map((t) => (
              <li key={t} className="etiqueta">
                {t}
              </li>
            ))}
          </ul>
        )}
      </header>

      <div className={estilos.descripcion}>
        {proyecto.descripcion.split(/\n{2,}/).map((parrafo, i) => (
          <p key={i}>{parrafo}</p>
        ))}
      </div>

      {proyecto.enlace && (
        <p>
          <a className="boton" href={proyecto.enlace} target="_blank" rel="noopener noreferrer">
            Ver el proyecto en línea<span className="solo-lectores"> (se abre en una pestaña nueva)</span>
          </a>
        </p>
      )}

      <section aria-labelledby="titulo-galeria" className={estilos.galeria}>
        <h2 id="titulo-galeria">Galería</h2>
        {proyecto.imagenes.length === 0 ? (
          <p className="aviso">Este proyecto aún no tiene capturas.</p>
        ) : (
          <ul role="list" className={estilos.imagenes}>
            {proyecto.imagenes.map((src, i) => (
              <li key={src}>
                <figure className={estilos.figura}>
                  <ImagenProyecto
                    src={src}
                    alt={`Captura ${i + 1} de ${proyecto.imagenes.length} del proyecto ${proyecto.titulo}`}
                    prioridad={i === 0}
                    sizes="(min-width: 64rem) 50vw, 100vw"
                  />
                  <figcaption>
                    Captura {i + 1} de {proyecto.imagenes.length}
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="no-imprimir">
        <Link href="/#proyectos">← Volver a los proyectos</Link>
      </p>
    </article>
  );
}
