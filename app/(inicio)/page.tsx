import Image from "next/image";
import Link from "next/link";
import { CopiarCorreo } from "@/src/components/CopiarCorreo";
import { Revelar } from "@/src/components/Revelar";
import { TarjetaProyecto } from "@/src/components/TarjetaProyecto";
import { JsonLd } from "@/src/components/JsonLd";
import { perfilServicio } from "@/src/services/perfilServicio";
import { proyectosServicio } from "@/src/services/proyectosServicio";
import { urlSitio } from "@/src/lib/sitio";
import estilos from "./inicio.module.css";

// Contenido público renderizado en el servidor y revalidado cada minuto (ISR).
export const revalidate = 60;

export default async function Inicio() {
  const [perfil, { items: proyectos }] = await Promise.all([
    perfilServicio.obtenerOpcional(),
    proyectosServicio.listar({ limite: 6, todos: false }, null),
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

  return (
    <>
      <JsonLd
        datos={{
          "@context": "https://schema.org",
          "@type": "Person",
          name: perfil.nombre,
          jobTitle: perfil.titular,
          description: perfil.bio,
          url: urlSitio(),
          image: perfil.fotoUrl ?? undefined,
          sameAs: enlaces.map(([, v]) => v),
          knowsAbout: perfil.habilidades,
        }}
      />

      <section id="inicio" aria-labelledby="titulo-inicio" className={`contenedor seccion ${estilos.heroe}`}>
        <div className={estilos.texto}>
          <p className="antetitulo">{perfil.titular}</p>
          <h1 id="titulo-inicio">
            Hola, soy <span className={estilos.resaltado}>{perfil.nombre}</span>
          </h1>
          <p className={estilos.bio}>{perfil.bio}</p>
          <div className={`${estilos.acciones} no-imprimir`}>
            <Link href="/#proyectos" className="boton">
              Ver proyectos
            </Link>
            <Link href="/contacto" className="boton boton--secundario">
              Escríbame
            </Link>
          </div>
          <CopiarCorreo correo={perfil.correo} />
          {enlaces.length > 0 && (
            <ul role="list" className={estilos.redes} aria-label="Perfiles en otras redes">
              {enlaces.map(([clave, url]) => (
                <li key={clave}>
                  <a href={url} rel="me noopener noreferrer" target="_blank">
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
            <Image
              src={perfil.fotoUrl}
              alt={`Foto de ${perfil.nombre}`}
              width={480}
              height={480}
              sizes="(min-width: 48rem) 22rem, 70vw"
              priority
            />
          ) : (
            <div className={estilos.iniciales} role="img" aria-label={`Iniciales de ${perfil.nombre}`}>
              {iniciales}
            </div>
          )}
        </div>
      </section>

      <section aria-labelledby="titulo-habilidades" className={`${estilos.franja} seccion`}>
        <div className="contenedor">
          <h2 id="titulo-habilidades">Habilidades</h2>
          <ul role="list" className={estilos.habilidades}>
            {perfil.habilidades.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
        </div>
      </section>

      <section id="proyectos" aria-labelledby="titulo-proyectos" className="contenedor seccion">
        <p className="antetitulo">Trabajo reciente</p>
        <h2 id="titulo-proyectos">Proyectos destacados</h2>
        {proyectos.length === 0 ? (
          <p className="aviso">Todavía no hay proyectos publicados.</p>
        ) : (
          <ul role="list" className="rejilla">
            {proyectos.map((p) => (
              <Revelar key={p.slug} como="li">
                <TarjetaProyecto proyecto={p} />
              </Revelar>
            ))}
          </ul>
        )}
        <p className="no-imprimir" style={{ marginTop: "2rem" }}>
          <Link href="/proyectos">Ver todos los proyectos →</Link>
        </p>
      </section>
    </>
  );
}
