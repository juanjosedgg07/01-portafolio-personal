"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavAdmin() {
  const ruta = usePathname();
  const enlaces = [
    { href: "/admin", texto: "Perfil y proyectos" },
    { href: "/admin/mensajes", texto: "Mensajes" },
  ];
  return (
    <nav aria-label="Panel privado">
      <ul role="list" className="panel-acciones">
        {enlaces.map((e) => (
          <li key={e.href}>
            <Link
              href={e.href}
              className={`boton boton--pequeno ${ruta === e.href ? "" : "boton--secundario"}`}
              aria-current={ruta === e.href ? "page" : undefined}
            >
              {e.texto}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
