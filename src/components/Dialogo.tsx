"use client";
import { useEffect, useRef, type ReactNode } from "react";

/**
 * <dialog> modal nativo: atrapa el foco (lo de fuera queda inerte), se cierra con Escape
 * y devuelve el foco al elemento que lo abrió.
 */
export function Dialogo({
  abierto,
  titulo,
  alCerrar,
  children,
}: {
  abierto: boolean;
  titulo: string;
  alCerrar: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const previo = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (abierto && !d.open) {
      previo.current = document.activeElement as HTMLElement | null;
      d.showModal();
    } else if (!abierto && d.open) {
      d.close();
    }
  }, [abierto]);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    const alCerrarNativo = () => {
      previo.current?.focus();
      alCerrar();
    };
    d.addEventListener("close", alCerrarNativo);
    return () => d.removeEventListener("close", alCerrarNativo);
  }, [alCerrar]);

  return (
    <dialog ref={ref} aria-labelledby="titulo-dialogo" className="dialogo">
      <div className="dialogo__cabecera">
        <h2 id="titulo-dialogo">{titulo}</h2>
        <button type="button" className="boton boton--secundario boton--pequeno" onClick={() => ref.current?.close()}>
          <span aria-hidden="true">✕</span> Cerrar
        </button>
      </div>
      {abierto && children}
    </dialog>
  );
}
