"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { InterruptorTema } from "./InterruptorTema";
import { useSeccionActiva } from "@/src/hooks/useSeccionActiva";
import estilos from "./Encabezado.module.css";

const ENLACES = [
  { href: "/", texto: "Inicio", seccion: "inicio" },
  { href: "/#proyectos", texto: "Proyectos", seccion: "proyectos" },
  { href: "/contacto", texto: "Contacto", seccion: null },
] as const;

export function Encabezado({ nombre }: { nombre: string }) {
  const ruta = usePathname();
  const [abierto, setAbierto] = useState(false);
  const idMenu = useId();
  const boton = useRef<HTMLButtonElement>(null);
  const seccion = useSeccionActiva(ruta === "/" ? ["inicio", "proyectos"] : []);

  // Cerrar el menú con Escape y devolver el foco al botón.
  useEffect(() => {
    if (!abierto) return;
    const alPulsar = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setAbierto(false);
        boton.current?.focus();
      }
    };
    document.addEventListener("keydown", alPulsar);
    return () => document.removeEventListener("keydown", alPulsar);
  }, [abierto]);

  function actual(enlace: (typeof ENLACES)[number]) {
    if (ruta === "/" && enlace.seccion) return seccion === enlace.seccion ? "location" : undefined;
    if (enlace.href === "/contacto" && ruta.startsWith("/contacto")) return "page";
    return undefined;
  }

  return (
    <header className={estilos.cabecera}>
      <div className={`contenedor ${estilos.barra}`}>
        <Link href="/" className={estilos.marca}>
          {nombre}
        </Link>
        <button
          ref={boton}
          type="button"
          className={`boton boton--secundario boton--pequeno ${estilos.botonMenu}`}
          aria-expanded={abierto}
          aria-controls={idMenu}
          onClick={() => setAbierto((a) => !a)}
        >
          <span aria-hidden="true">{abierto ? "✕" : "☰"}</span> Menú
        </button>
        <nav aria-label="Principal" id={idMenu} className={estilos.nav} data-abierto={abierto}>
          <ul role="list" className={estilos.lista}>
            {ENLACES.map((e) => (
              <li key={e.href}>
                <Link href={e.href} aria-current={actual(e)} className={estilos.enlace} onClick={() => setAbierto(false)}>
                  {e.texto}
                </Link>
              </li>
            ))}
          </ul>
          <InterruptorTema />
        </nav>
      </div>
    </header>
  );
}
