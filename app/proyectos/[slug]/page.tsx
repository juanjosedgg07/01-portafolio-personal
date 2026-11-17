import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Images, Layers, Send } from "lucide-react";
import { ImagenProyecto } from "@/src/components/ImagenProyecto";
import { Galeria } from "@/src/components/Galeria";
import { JsonLd } from "@/src/components/JsonLd";
import { EtiquetaTecnologia } from "@/src/components/IconoTecnologia";
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
  const portada = proyecto.imagenes[0];

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
        <p className="antetitulo">Proyecto</p>
        <h1>{proyecto.titulo}</h1>
      </header>

      {portada && (
        <div className={estilos.portada}>
          <ImagenProyecto src={portada} alt={`Vista principal del proyecto ${proyecto.titulo}`} prioridad sizes="(min-width: 72rem) 72rem, 100vw" />
        </div>
      )}

      <div className={estilos.cuerpo}>
        <div className={estilos.descripcion}>
          <h2 className={estilos.subtitulo}>Sobre el proyecto</h2>
          {proyecto.descripcion.split(/\n{2,}/).map((parrafo, i) => (
            <p key={i}>{parrafo}</p>
          ))}
        </div>

        <aside className={estilos.ficha} aria-labelledby="titulo-ficha">
          <h2 id="titulo-ficha" className={estilos.fichaTitulo}>
            <Layers aria-hidden="true" size={18} /> Ficha técnica
          </h2>
          {proyecto.tecnologias.length > 0 && (
            <>
              <h3 className={estilos.fichaEtiqueta}>Tecnologías</h3>
              <ul role="list" className="lista-etiquetas">
                {proyecto.tecnologias.map((t) => (
                  <li key={t}>
                    <EtiquetaTecnologia nombre={t} />
                  </li>
                ))}
              </ul>
            </>
          )}
          <h3 className={estilos.fichaEtiqueta}>Capturas</h3>
          <p className={estilos.fichaDato}>
            <Images aria-hidden="true" size={16} /> {proyecto.imagenes.length}
          </p>
          <div className={`${estilos.fichaAcciones} no-imprimir`}>
            {proyecto.enlace && (
              <a className="boton" href={proyecto.enlace} target="_blank" rel="noopener noreferrer">
                <ExternalLink aria-hidden="true" size={18} /> Ver en línea
                <span className="solo-lectores"> (se abre en una pestaña nueva)</span>
              </a>
            )}
            <Link className="boton boton--secundario" href="/contacto">
              <Send aria-hidden="true" size={18} /> Preguntar por este proyecto
            </Link>
          </div>
        </aside>
      </div>

      <section aria-labelledby="titulo-galeria" className={estilos.galeria}>
        <h2 id="titulo-galeria">Galería</h2>
        {proyecto.imagenes.length === 0 ? (
          <p className="aviso">Este proyecto aún no tiene capturas.</p>
        ) : (
          <Galeria imagenes={proyecto.imagenes} titulo={proyecto.titulo} />
        )}
      </section>

      <p className="no-imprimir">
        <Link href="/proyectos" className="enlace-flecha">
          <ArrowLeft aria-hidden="true" size={18} /> Volver a los proyectos
        </Link>
      </p>
    </article>
  );
}
