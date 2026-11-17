import Link from "next/link";
import { ArrowRight, Images } from "lucide-react";
import type { Proyecto } from "@/src/schemas/proyecto";
import { ImagenProyecto } from "./ImagenProyecto";
import { EtiquetaTecnologia } from "./IconoTecnologia";
import estilos from "./TarjetaProyecto.module.css";

export function TarjetaProyecto({ proyecto, nivel = 3 }: { proyecto: Proyecto; nivel?: 2 | 3 }) {
  const Titulo = nivel === 2 ? "h2" : "h3";
  return (
    <article className={`tarjeta ${estilos.tarjeta}`}>
      <div className={estilos.marco}>
        {proyecto.imagenes[0] ? (
          <ImagenProyecto src={proyecto.imagenes[0]} alt="" />
        ) : (
          <div className={estilos.sinImagen} aria-hidden="true">
            {proyecto.titulo.slice(0, 1)}
          </div>
        )}
        {proyecto.imagenes.length > 1 && (
          <span className={estilos.contador}>
            <Images aria-hidden="true" size={14} />
            {proyecto.imagenes.length}
            <span className="solo-lectores"> capturas</span>
          </span>
        )}
      </div>
      <div className={estilos.cuerpo}>
        <Titulo className={estilos.titulo}>
          {/* El enlace cubre toda la tarjeta con ::after; un solo punto de foco por tarjeta. */}
          <Link href={`/proyectos/${proyecto.slug}`} className={estilos.enlace}>
            {proyecto.titulo}
          </Link>
        </Titulo>
        <p className={estilos.descripcion}>{proyecto.descripcion}</p>
        {proyecto.tecnologias.length > 0 && (
          <ul role="list" className="lista-etiquetas" aria-label="Tecnologías">
            {proyecto.tecnologias.map((t) => (
              <li key={t}>
                <EtiquetaTecnologia nombre={t} />
              </li>
            ))}
          </ul>
        )}
        <span className={estilos.ver} aria-hidden="true">
          Ver proyecto <ArrowRight size={16} />
        </span>
      </div>
    </article>
  );
}
