import Link from "next/link";
import { ArrowUp, FolderKanban, Globe, House, LayoutDashboard, Mail } from "lucide-react";
import { siGithub } from "simple-icons";
import type { Perfil } from "@/src/schemas/perfil";
import { BotonImprimir } from "./BotonImprimir";
import estilos from "./PiePagina.module.css";

export function PiePagina({ perfil }: { perfil: Perfil | null }) {
  const nombre = perfil?.nombre ?? "Portafolio";
  const enlaces = perfil ? (Object.entries(perfil.enlaces).filter(([, v]) => v) as [string, string][]) : [];
  return (
    <footer className={estilos.pie}>
      <div className={`contenedor ${estilos.rejilla}`}>
        <div>
          <p className={estilos.marca}>{nombre}</p>
          <p className={estilos.texto}>{perfil?.titular ?? "Portafolio personal"}</p>
          {perfil?.correo && (
            <p className={estilos.texto}>
              <a href={`mailto:${perfil.correo}`} className={estilos.enlace}>
                <Mail aria-hidden="true" size={16} /> {perfil.correo}
              </a>
            </p>
          )}
        </div>

        <nav aria-label="Pie de página">
          <h2 className={estilos.titulo}>Navegación</h2>
          <ul role="list" className={estilos.lista}>
            <li>
              <Link href="/" className={estilos.enlace}>
                <House aria-hidden="true" size={16} /> Inicio
              </Link>
            </li>
            <li>
              <Link href="/proyectos" className={estilos.enlace}>
                <FolderKanban aria-hidden="true" size={16} /> Proyectos
              </Link>
            </li>
            <li>
              <Link href="/contacto" className={estilos.enlace}>
                <Mail aria-hidden="true" size={16} /> Contacto
              </Link>
            </li>
            <li>
              <Link href="/admin" className={estilos.enlace}>
                <LayoutDashboard aria-hidden="true" size={16} /> Panel privado
              </Link>
            </li>
          </ul>
        </nav>

        <div>
          <h2 className={estilos.titulo}>En la web</h2>
          <ul role="list" className={estilos.lista}>
            {enlaces.map(([clave, url]) => (
              <li key={clave}>
                <a href={url} target="_blank" rel="me noopener noreferrer" className={estilos.enlace}>
                  {clave === "github" ? (
                    <svg aria-hidden="true" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                      <path d={siGithub.path} />
                    </svg>
                  ) : (
                    <Globe aria-hidden="true" size={16} />
                  )}
                  {{ github: "GitHub", linkedin: "LinkedIn", sitio: "Sitio web" }[clave] ?? clave}
                  <span className="solo-lectores"> (se abre en una pestaña nueva)</span>
                </a>
              </li>
            ))}
          </ul>
          <div className="no-imprimir" style={{ marginTop: "1rem" }}>
            <BotonImprimir />
          </div>
        </div>
      </div>

      <div className={`contenedor ${estilos.base}`}>
        <p>
          © {new Date().getFullYear()} {nombre}. Hecho con Next.js, Firebase y Vercel.
        </p>
        <a href="#contenido" className={`${estilos.enlace} no-imprimir`}>
          <ArrowUp aria-hidden="true" size={16} /> Volver arriba
        </a>
      </div>
    </footer>
  );
}
