"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FolderKanban, House, Mail, Menu, Send, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { SelectorTema } from "./SelectorTema";
import { useSeccionActiva } from "@/src/hooks/useSeccionActiva";
import estilos from "./Encabezado.module.css";

const ENLACES = [
  { href: "/", texto: "Inicio", seccion: "inicio", Icono: House },
  { href: "/proyectos", texto: "Proyectos", seccion: "proyectos", Icono: FolderKanban },
  { href: "/contacto", texto: "Contacto", seccion: null, Icono: Mail },
] as const;

type Enlace = (typeof ENLACES)[number];

export function Encabezado({ nombre }: { nombre: string }) {
  const ruta = usePathname();
  const [abierto, setAbierto] = useState(false);
  const [rutaMenu, setRutaMenu] = useState(ruta);
  const idMenu = useId();
  const boton = useRef<HTMLButtonElement>(null);
  const seccion = useSeccionActiva(ruta === "/" ? ["inicio", "proyectos"] : []);

  // Cierra el menú móvil al cambiar de ruta (estado derivado, sin efecto).
  if (rutaMenu !== ruta) {
    setRutaMenu(ruta);
    setAbierto(false);
  }

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

  function actual(e: Enlace): "page" | "location" | undefined {
    if (ruta === "/") {
      if (e.seccion === "proyectos") return seccion === "proyectos" ? "location" : undefined;
      if (e.href === "/") return seccion !== "proyectos" ? "page" : undefined;
      return undefined;
    }
    if (e.href !== "/" && ruta.startsWith(e.href)) return "page";
    return undefined;
  }

  const iniciales = nombre
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join("");

  return (
    <header className={estilos.cabecera}>
      <div className={`contenedor ${estilos.barra}`}>
        <Link href="/" className={estilos.marca}>
          <span className={estilos.logo} aria-hidden="true">
            {iniciales}
          </span>
          <span>{nombre}</span>
        </Link>

        <button
          ref={boton}
          type="button"
          className={`boton boton--secundario boton--pequeno ${estilos.botonMenu}`}
          aria-expanded={abierto}
          aria-controls={idMenu}
          onClick={() => setAbierto((a) => !a)}
        >
          {abierto ? <X aria-hidden="true" size={20} /> : <Menu aria-hidden="true" size={20} />}
          Menú
        </button>

        <nav aria-label="Principal" id={idMenu} className={estilos.nav} data-abierto={abierto}>
          <ul role="list" className={estilos.lista}>
            {ENLACES.map((e) => (
              <li key={e.href}>
                <Link href={e.href} aria-current={actual(e)} className={estilos.enlace}>
                  <e.Icono aria-hidden="true" size={18} />
                  {e.texto}
                </Link>
              </li>
            ))}
          </ul>
          <div className={estilos.acciones}>
            <SelectorTema />
            <Link href="/contacto" className={`boton boton--pequeno ${estilos.cta}`}>
              <Send aria-hidden="true" size={16} />
              Hablemos
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
