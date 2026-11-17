"use client";
import { X } from "lucide-react";
import { useState, type ReactNode } from "react";

type Elemento = { slug: string; tecnologias: string[]; tarjeta: ReactNode };

/**
 * Filtro por tecnología. Las tarjetas llegan ya renderizadas en el servidor (ReactNode);
 * el cliente solo decide cuáles mostrar. Los botones usan aria-pressed y el total se anuncia.
 */
export function FiltroProyectos({ tecnologias, elementos }: { tecnologias: { nombre: string; icono: ReactNode }[]; elementos: Elemento[] }) {
  const [activa, setActiva] = useState<string | null>(null);
  const visibles = activa ? elementos.filter((e) => e.tecnologias.includes(activa)) : elementos;

  return (
    <>
      <div role="group" aria-labelledby="titulo-filtro" className="filtro">
        <p id="titulo-filtro" className="filtro__titulo">
          Filtrar por tecnología
        </p>
        <ul role="list" className="lista-etiquetas">
          <li>
            <button type="button" className="filtro__opcion" aria-pressed={activa === null} onClick={() => setActiva(null)}>
              Todas
            </button>
          </li>
          {tecnologias.map((t) => (
            <li key={t.nombre}>
              <button type="button" className="filtro__opcion" aria-pressed={activa === t.nombre} onClick={() => setActiva(activa === t.nombre ? null : t.nombre)}>
                {t.icono}
                {t.nombre}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <p role="status" aria-live="polite" className="filtro__estado">
        {activa ? `${visibles.length} proyecto(s) con ${activa}.` : `${elementos.length} proyectos.`}
        {activa && (
          <button type="button" className="boton boton--secundario boton--pequeno" onClick={() => setActiva(null)}>
            <X aria-hidden="true" size={16} /> Quitar filtro
          </button>
        )}
      </p>

      <ul role="list" className="rejilla">
        {visibles.map((e) => (
          <li key={e.slug}>{e.tarjeta}</li>
        ))}
      </ul>
    </>
  );
}
