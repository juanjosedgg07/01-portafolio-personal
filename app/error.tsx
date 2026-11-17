"use client";
import { useEffect, useRef } from "react";

export default function ErrorPagina({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const titulo = useRef<HTMLHeadingElement>(null);
  useEffect(() => titulo.current?.focus(), []);

  return (
    <section className="contenedor seccion" role="alert" aria-labelledby="titulo-error">
      <h1 id="titulo-error" ref={titulo} tabIndex={-1}>
        Algo salió mal
      </h1>
      <p>No pudimos cargar esta página. Puede reintentar en unos segundos.</p>
      <button type="button" className="boton" onClick={reset}>
        Reintentar
      </button>
    </section>
  );
}
