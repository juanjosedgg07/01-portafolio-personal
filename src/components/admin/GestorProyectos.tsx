"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/src/lib/clienteApi";
import type { Pagina } from "@/src/schemas/comunes";
import type { Proyecto } from "@/src/schemas/proyecto";
import { Dialogo } from "@/src/components/Dialogo";
import { EstadoCargando, EstadoError, EstadoVacio } from "@/src/components/Estados";
import { FormularioProyecto } from "./FormularioProyecto";

type Edicion = { modo: "cerrado" } | { modo: "nuevo" } | { modo: "editar"; proyecto: Proyecto };

export function GestorProyectos({ uid, anunciar }: { uid: string; anunciar: (m: string) => void }) {
  const [proyectos, setProyectos] = useState<Proyecto[] | null>(null);
  const [error, setError] = useState("");
  const [edicion, setEdicion] = useState<Edicion>({ modo: "cerrado" });
  const [porBorrar, setPorBorrar] = useState<Proyecto | null>(null);
  const [ocupado, setOcupado] = useState(false);

  const cargar = useCallback(async () => {
    setError("");
    try {
      const r = await api<Pagina<Proyecto>>("/api/proyectos?todos=1&limite=100");
      setProyectos(r.items);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudieron cargar los proyectos.");
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial de datos
    void cargar();
  }, [cargar]);

  const cerrar = useCallback(() => setEdicion({ modo: "cerrado" }), []);
  const cerrarBorrado = useCallback(() => setPorBorrar(null), []);

  async function mover(indice: number, delta: -1 | 1) {
    if (!proyectos) return;
    const destino = indice + delta;
    if (destino < 0 || destino >= proyectos.length) return;
    const nueva = [...proyectos];
    [nueva[indice], nueva[destino]] = [nueva[destino], nueva[indice]];
    const anterior = proyectos;
    setProyectos(nueva); // actualización optimista
    try {
      await api("/api/proyectos/orden", { metodo: "PUT", cuerpo: { slugs: nueva.map((p) => p.slug) } });
      anunciar(`«${nueva[destino].titulo}» movido a la posición ${destino + 1} de ${nueva.length}.`);
    } catch (e) {
      setProyectos(anterior);
      anunciar(e instanceof Error ? `No se pudo reordenar: ${e.message}` : "No se pudo reordenar.");
    }
  }

  async function borrar() {
    if (!porBorrar) return;
    setOcupado(true);
    try {
      await api(`/api/proyectos/${porBorrar.slug}`, { metodo: "DELETE" });
      setProyectos((ps) => ps?.filter((p) => p.slug !== porBorrar.slug) ?? null);
      anunciar(`Proyecto «${porBorrar.titulo}» eliminado.`);
      setPorBorrar(null);
    } catch (e) {
      anunciar(e instanceof Error ? `No se pudo eliminar: ${e.message}` : "No se pudo eliminar.");
    } finally {
      setOcupado(false);
    }
  }

  function alGuardar(p: Proyecto) {
    setProyectos((ps) => {
      const lista = ps ?? [];
      return lista.some((x) => x.slug === p.slug) ? lista.map((x) => (x.slug === p.slug ? p : x)) : [...lista, p];
    });
    // Tras crear, se pasa a edición para poder subir capturas.
    setEdicion({ modo: "editar", proyecto: p });
  }

  return (
    <div>
      <p>
        <button type="button" className="boton" onClick={() => setEdicion({ modo: "nuevo" })}>
          + Nuevo proyecto
        </button>
      </p>

      {error ? (
        <EstadoError mensaje={error} alReintentar={cargar} />
      ) : proyectos === null ? (
        <EstadoCargando etiqueta="Cargando proyectos…" />
      ) : proyectos.length === 0 ? (
        <EstadoVacio>Todavía no hay proyectos. Cree el primero.</EstadoVacio>
      ) : (
        <ol role="list" className="panel-lista">
          {proyectos.map((p, i) => (
            <li key={p.slug} className={`panel-fila ${p.publicado ? "panel-fila--destacada" : ""}`}>
              <div>
                <h3 style={{ margin: 0 }}>
                  {i + 1}. {p.titulo}
                </h3>
                <p className="campo__ayuda">
                  /{p.slug} · {p.publicado ? "Publicado" : "Borrador (oculto)"} · {p.imagenes.length} captura(s)
                </p>
              </div>
              <div className="panel-acciones">
                <button type="button" className="boton boton--secundario boton--pequeno" onClick={() => mover(i, -1)} disabled={i === 0}>
                  <span aria-hidden="true">↑</span> Subir<span className="solo-lectores"> {p.titulo}</span>
                </button>
                <button type="button" className="boton boton--secundario boton--pequeno" onClick={() => mover(i, 1)} disabled={i === proyectos.length - 1}>
                  <span aria-hidden="true">↓</span> Bajar<span className="solo-lectores"> {p.titulo}</span>
                </button>
                <button type="button" className="boton boton--pequeno" onClick={() => setEdicion({ modo: "editar", proyecto: p })}>
                  Editar<span className="solo-lectores"> {p.titulo}</span>
                </button>
                {p.publicado && (
                  <Link className="boton boton--secundario boton--pequeno" href={`/proyectos/${p.slug}`}>
                    Ver<span className="solo-lectores"> {p.titulo}</span>
                  </Link>
                )}
                <button type="button" className="boton boton--peligro boton--pequeno" onClick={() => setPorBorrar(p)}>
                  Eliminar<span className="solo-lectores"> {p.titulo}</span>
                </button>
              </div>
            </li>
          ))}
        </ol>
      )}

      <Dialogo
        abierto={edicion.modo !== "cerrado"}
        titulo={edicion.modo === "editar" ? `Editar «${edicion.proyecto.titulo}»` : "Nuevo proyecto"}
        alCerrar={cerrar}
      >
        <FormularioProyecto
          key={edicion.modo === "editar" ? edicion.proyecto.slug : "nuevo"}
          proyecto={edicion.modo === "editar" ? edicion.proyecto : null}
          uid={uid}
          alGuardar={alGuardar}
          anunciar={anunciar}
        />
      </Dialogo>

      <Dialogo abierto={porBorrar !== null} titulo="¿Eliminar proyecto?" alCerrar={cerrarBorrado}>
        <p>
          Se eliminará «{porBorrar?.titulo}» y sus capturas. Esta acción no se puede deshacer.
        </p>
        <div className="panel-acciones">
          <button type="button" className="boton boton--peligro" onClick={borrar} disabled={ocupado}>
            {ocupado ? "Eliminando…" : "Sí, eliminar"}
          </button>
          <button type="button" className="boton boton--secundario" onClick={cerrarBorrado}>
            Cancelar
          </button>
        </div>
      </Dialogo>
    </div>
  );
}
