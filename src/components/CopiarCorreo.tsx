"use client";
import { useRef, useState } from "react";

/** Botón «Copiar correo» con Clipboard API. Sin soporte o sin permiso: selecciona el texto para copiarlo a mano. */
export function CopiarCorreo({ correo }: { correo: string }) {
  const texto = useRef<HTMLElement>(null);
  const [estado, setEstado] = useState("");

  function seleccionar() {
    const el = texto.current;
    if (!el) return;
    const rango = document.createRange();
    rango.selectNodeContents(el);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(rango);
  }

  async function copiar() {
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(correo);
        setEstado("Correo copiado al portapapeles.");
        return;
      } catch {
        /* permiso denegado: se usa la alternativa */
      }
    }
    seleccionar();
    setEstado("No se pudo copiar automáticamente. El correo quedó seleccionado: presione Ctrl+C.");
  }

  return (
    <p style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.5rem" }}>
      <a href={`mailto:${correo}`}>
        <span ref={texto}>{correo}</span>
      </a>
      <button type="button" className="boton boton--secundario boton--pequeno" onClick={copiar}>
        Copiar correo
      </button>
      <span role="status" aria-live="polite" className="campo__ayuda">
        {estado}
      </span>
    </p>
  );
}
