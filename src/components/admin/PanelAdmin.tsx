"use client";
import { useCallback, useState } from "react";
import { EditorPerfil } from "./EditorPerfil";
import { GestorProyectos } from "./GestorProyectos";

export function PanelAdmin({ uid }: { uid: string }) {
  const [anuncio, setAnuncio] = useState("");
  // Cambia el texto aunque sea el mismo mensaje, para que el lector de pantalla lo repita.
  const anunciar = useCallback((m: string) => setAnuncio((a) => (a === m ? `${m} ` : m)), []);

  return (
    <>
      <div role="status" aria-live="polite" className="aviso" hidden={!anuncio} style={{ position: "sticky", top: "calc(var(--cabecera) + 0.5rem)", zIndex: 10, marginBottom: "1rem" }}>
        {anuncio}
      </div>
      <section aria-labelledby="titulo-proyectos-admin" className="seccion" style={{ paddingTop: 0 }}>
        <h2 id="titulo-proyectos-admin">Proyectos</h2>
        <GestorProyectos uid={uid} anunciar={anunciar} />
      </section>
      <section aria-labelledby="titulo-perfil-admin" className="seccion">
        <h2 id="titulo-perfil-admin">Perfil</h2>
        <EditorPerfil uid={uid} anunciar={anunciar} />
      </section>
    </>
  );
}
