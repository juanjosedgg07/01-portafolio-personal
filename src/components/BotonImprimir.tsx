"use client";
import { Printer } from "lucide-react";

/** Abre el diálogo de impresión (con @media print el portafolio sale listo para guardar como PDF). */
export function BotonImprimir() {
  return (
    <button type="button" className="boton boton--secundario boton--pequeno" onClick={() => window.print()}>
      <Printer aria-hidden="true" size={16} /> Guardar como PDF
    </button>
  );
}
