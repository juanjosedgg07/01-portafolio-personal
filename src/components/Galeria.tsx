"use client";
import { ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Dialogo } from "./Dialogo";
import { ImagenProyecto } from "./ImagenProyecto";

/**
 * Galería con visor: cada miniatura es un botón que abre un <dialog> modal.
 * En el visor: botones y flechas ← → para navegar, Escape para cerrar; el foco vuelve a la miniatura.
 */
export function Galeria({ imagenes, titulo }: { imagenes: string[]; titulo: string }) {
  const [indice, setIndice] = useState<number | null>(null);
  const total = imagenes.length;
  const alt = (i: number) => `Captura ${i + 1} de ${total} del proyecto ${titulo}`;

  const mover = useCallback((d: number) => setIndice((i) => (i === null ? i : (i + d + total) % total)), [total]);
  const cerrar = useCallback(() => setIndice(null), []);

  useEffect(() => {
    if (indice === null) return;
    const alPulsar = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") mover(1);
      if (e.key === "ArrowLeft") mover(-1);
    };
    document.addEventListener("keydown", alPulsar);
    return () => document.removeEventListener("keydown", alPulsar);
  }, [indice, mover]);

  return (
    <>
      <ul role="list" className="galeria">
        {imagenes.map((src, i) => (
          <li key={src}>
            <figure className="galeria__figura">
              <button type="button" className="galeria__boton" onClick={() => setIndice(i)}>
                <ImagenProyecto src={src} alt={alt(i)} prioridad={i === 0} sizes="(min-width: 64rem) 33vw, (min-width: 48rem) 50vw, 100vw" />
                <span className="galeria__ampliar" aria-hidden="true">
                  <Maximize2 size={18} />
                </span>
                <span className="solo-lectores">Ampliar</span>
              </button>
              <figcaption>
                Captura {i + 1} de {total}
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>

      <Dialogo abierto={indice !== null} titulo={indice === null ? "" : `Captura ${indice + 1} de ${total}`} alCerrar={cerrar}>
        {indice !== null && (
          <div className="visor">
            <ImagenProyecto src={imagenes[indice]} alt={alt(indice)} sizes="90vw" />
            {total > 1 && (
              <div className="visor__controles">
                <button type="button" className="boton boton--secundario boton--pequeno" onClick={() => mover(-1)}>
                  <ChevronLeft aria-hidden="true" size={18} /> Anterior
                </button>
                <p aria-live="polite" className="campo__ayuda" style={{ margin: 0 }}>
                  {indice + 1} / {total} · use ← →
                </p>
                <button type="button" className="boton boton--secundario boton--pequeno" onClick={() => mover(1)}>
                  Siguiente <ChevronRight aria-hidden="true" size={18} />
                </button>
              </div>
            )}
          </div>
        )}
      </Dialogo>
    </>
  );
}
