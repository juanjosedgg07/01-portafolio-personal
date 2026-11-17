import Image from "next/image";
import Link from "next/link";
import { Accessibility, ArrowRight, FolderKanban, Gauge, Globe, Layers, Send, ShieldCheck, Sparkles } from "lucide-react";
import { siGithub } from "simple-icons";
import { CopiarCorreo } from "@/src/components/CopiarCorreo";
import { Revelar } from "@/src/components/Revelar";
import { TarjetaProyecto } from "@/src/components/TarjetaProyecto";
import { IconoTecnologia } from "@/src/components/IconoTecnologia";
import { JsonLd } from "@/src/components/JsonLd";
import { perfilServicio } from "@/src/services/perfilServicio";
import { proyectosServicio } from "@/src/services/proyectosServicio";
import { urlSitio } from "@/src/lib/sitio";
import estilos from "./inicio.module.css";

// Contenido público renderizado en el servidor y revalidado cada minuto (ISR).
export const revalidate = 60;

const SERVICIOS = [
  {
    Icono: Accessibility,
    titulo: "Interfaces accesibles",
    texto: "HTML semántico, teclado, lectores de pantalla y contraste AA verificados con pruebas automáticas.",
  },
  {
    Icono: ShieldCheck,
    titulo: "APIs seguras",
    texto: "Validación con Zod, sesiones HttpOnly, autorización por objeto y errores consistentes documentados en OpenAPI.",
  },
  {
    Icono: Gauge,
    titulo: "Rendimiento medible",
    texto: "Server Components, imágenes optimizadas y metas de Core Web Vitals comprobadas en producción.",
  },
];

function GithubIcono() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d={siGithub.path} />
    </svg>
  );
}

export default async function Inicio() {
  const [perfil, { items: proyectos }] = await Promise.all([
    perfilServicio.obtenerOpcional(),
    proyectosServicio.listar({ limite: 100, todos: false }, null),
  ]);

  if (!perfil) {
    return (
      <section className="contenedor seccion">
        <h1>Portafolio en construcción</h1>
        <p>El perfil todavía no se ha configurado. Vuelva pronto.</p>
      </section>
    );
  }

  const iniciales = perfil.nombre
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join("");
  const enlaces = Object.entries(perfil.enlaces).filter(([, v]) => v) as [string, string][];
  const NOMBRES: Record<string, string> = { github: "GitHub", linkedin: "LinkedIn", sitio: "Sitio web" };
  const tecnologias = new Set(proyectos.flatMap((p) => p.tecnologias));
  const destacados = proyectos.slice(0, 3);

  return (
    <>
      <JsonLd
        datos={{
          "@context": "https://schema.org",
          "@type": "Person",
          name: perfil.nombre,
          jobTitle: perfil.titular,
          description: perfil.bio,
          email: perfil.correo,
          url: urlSitio(),
          image: perfil.fotoUrl ?? undefined,
          sameAs: enlaces.map(([, v]) => v),
          knowsAbout: perfil.habilidades,
        }}
      />

      <section id="inicio" aria-labelledby="titulo-inicio" className={estilos.heroe}>
        <div className={estilos.decoracion} aria-hidden="true" />
        <div className={`contenedor ${estilos.heroeRejilla}`}>
          <div className={estilos.texto}>
            <p className={estilos.insignia}>
              <Sparkles aria-hidden="true" size={16} />
              {perfil.titular}
            </p>
            <h1 id="titulo-inicio">
              Hola, soy <span className={estilos.resaltado}>{perfil.nombre}</span>
            </h1>
            <p className={estilos.bio}>{perfil.bio}</p>
            <div className={`${estilos.acciones} no-imprimir`}>
              <Link href="/#proyectos" className="boton">
                <FolderKanban aria-hidden="true" size={18} />
                Ver proyectos
              </Link>
              <Link href="/contacto" className="boton boton--secundario">
                <Send aria-hidden="true" size={18} />
                Escríbame
              </Link>
            </div>
            <CopiarCorreo correo={perfil.correo} />
            {enlaces.length > 0 && (
              <ul role="list" className={estilos.redes} aria-label="Perfiles en otras redes">
                {enlaces.map(([clave, url]) => (
                  <li key={clave}>
                    <a href={url} rel="me noopener noreferrer" target="_blank" className={estilos.red}>
                      {clave === "github" ? <GithubIcono /> : <Globe aria-hidden="true" size={18} />}
                      {NOMBRES[clave] ?? clave}
                      <span className="solo-lectores"> (se abre en una pestaña nueva)</span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className={estilos.foto}>
            {perfil.fotoUrl ? (
              <Image src={perfil.fotoUrl} alt={`Foto de ${perfil.nombre}`} width={480} height={480} sizes="(min-width: 48rem) 22rem, 70vw" priority />
            ) : (
              <div className={estilos.iniciales} role="img" aria-label={`Iniciales de ${perfil.nombre}`}>
                {iniciales}
              </div>
            )}
            <ul role="list" className={estilos.orbita} aria-hidden="true">
              {perfil.habilidades.slice(0, 4).map((h) => (
                <li key={h}>
                  <IconoTecnologia nombre={h} tamano={22} />
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="contenedor">
          <dl className={estilos.cifras}>
            <div>
              <dt>Proyectos publicados</dt>
              <dd>{proyectos.length}</dd>
            </div>
            <div>
              <dt>Tecnologías usadas</dt>
              <dd>{tecnologias.size}</dd>
            </div>
            <div>
              <dt>Habilidades</dt>
              <dd>{perfil.habilidades.length}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section aria-labelledby="titulo-servicios" className="contenedor seccion">
        <p className="antetitulo">Lo que aporto</p>
        <h2 id="titulo-servicios">Cómo trabajo</h2>
        <ul role="list" className={`rejilla ${estilos.servicios}`}>
          {SERVICIOS.map(({ Icono, titulo, texto }) => (
            <li key={titulo} className={estilos.servicio}>
              <span className={estilos.servicioIcono} aria-hidden="true">
                <Icono size={26} />
              </span>
              <h3>{titulo}</h3>
              <p>{texto}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="titulo-habilidades" className={`${estilos.franja} seccion`}>
        <div className="contenedor">
          <p className="antetitulo">Herramientas</p>
          <h2 id="titulo-habilidades">Habilidades</h2>
          <ul role="list" className={estilos.habilidades}>
            {perfil.habilidades.map((h) => (
              <li key={h}>
                <IconoTecnologia nombre={h} tamano={22} />
                {h}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="proyectos" aria-labelledby="titulo-proyectos" className="contenedor seccion">
        <div className="cabecera-seccion">
          <div>
            <p className="antetitulo">Trabajo reciente</p>
            <h2 id="titulo-proyectos">Proyectos destacados</h2>
          </div>
          <Link href="/proyectos" className="enlace-flecha no-imprimir">
            Ver los {proyectos.length} proyectos <ArrowRight aria-hidden="true" size={18} />
          </Link>
        </div>
        {destacados.length === 0 ? (
          <p className="aviso">Todavía no hay proyectos publicados.</p>
        ) : (
          <ul role="list" className="rejilla">
            {destacados.map((p) => (
              <Revelar key={p.slug} como="li">
                <TarjetaProyecto proyecto={p} />
              </Revelar>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="titulo-cta" className="contenedor no-imprimir" style={{ paddingBottom: "clamp(2.5rem, 1.5rem + 4vw, 5rem)" }}>
        <div className={estilos.cta}>
          <Layers aria-hidden="true" size={40} className={estilos.ctaIcono} />
          <div>
            <h2 id="titulo-cta">¿Tiene un proyecto en mente?</h2>
            <p>Cuénteme la idea y le respondo con una propuesta. Me encantan los retos de accesibilidad y rendimiento.</p>
          </div>
          <Link href="/contacto" className={`boton ${estilos.ctaBoton}`}>
            <Send aria-hidden="true" size={18} />
            Hablemos
          </Link>
        </div>
      </section>
    </>
  );
}
