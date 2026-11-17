"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "@/src/lib/clienteApi";
import { usePolling } from "@/src/hooks/usePolling";
import { useDebounce } from "@/src/hooks/useDebounce";
import type { Mensaje } from "@/src/schemas/mensaje";
import { EstadoCargando, EstadoError, EstadoVacio } from "@/src/components/Estados";

type Respuesta = { items: Mensaje[]; siguienteCursor: string | null; noLeidos: number };

const formatoFecha = new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short" });

export function BandejaMensajes() {
  const [mensajes, setMensajes] = useState<Mensaje[] | null>(null);
  const [cursor, setCursor] = useState<string | null>(null);
  const [noLeidos, setNoLeidos] = useState(0);
  const [error, setError] = useState("");
  const [anuncio, setAnuncio] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const filtro = useDebounce(busqueda.trim().toLowerCase(), 250);

  const cargar = useCallback(async (silencioso = false) => {
    if (!silencioso) setError("");
    try {
      const r = await api<Respuesta>("/api/mensajes?limite=20");
      setMensajes((previos) => {
        if (silencioso && previos && r.items[0] && previos[0]?.id !== r.items[0].id) {
          setAnuncio("Llegaron mensajes nuevos.");
        }
        return r.items;
      });
      setCursor(r.siguienteCursor);
      setNoLeidos(r.noLeidos);
    } catch (e) {
      if (!silencioso) setError(e instanceof Error ? e.message : "No se pudieron cargar los mensajes.");
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial de datos
    void cargar();
  }, [cargar]);

  // Revisa si hay mensajes nuevos cada 30 s (solo con la pestaña visible).
  usePolling(() => void cargar(true), 30_000, !error);

  async function cargarMas() {
    if (!cursor) return;
    try {
      const r = await api<Respuesta>(`/api/mensajes?limite=20&cursor=${encodeURIComponent(cursor)}`);
      setMensajes((m) => [...(m ?? []), ...r.items]);
      setCursor(r.siguienteCursor);
      setAnuncio(`${r.items.length} mensajes más cargados.`);
    } catch (e) {
      setAnuncio(e instanceof Error ? e.message : "No se pudieron cargar más mensajes.");
    }
  }

  async function alternarLeido(m: Mensaje) {
    try {
      await api(`/api/mensajes/${m.id}`, { metodo: "PATCH", cuerpo: { leido: !m.leido } });
      setMensajes((ms) => ms?.map((x) => (x.id === m.id ? { ...x, leido: !m.leido } : x)) ?? null);
      setNoLeidos((n) => n + (m.leido ? 1 : -1));
      setAnuncio(m.leido ? "Marcado como no leído." : "Marcado como leído.");
    } catch (e) {
      setAnuncio(e instanceof Error ? e.message : "No se pudo actualizar.");
    }
  }

  async function borrar(m: Mensaje) {
    try {
      await api(`/api/mensajes/${m.id}`, { metodo: "DELETE" });
      setMensajes((ms) => ms?.filter((x) => x.id !== m.id) ?? null);
      if (!m.leido) setNoLeidos((n) => n - 1);
      setAnuncio(`Mensaje de ${m.nombre} eliminado.`);
    } catch (e) {
      setAnuncio(e instanceof Error ? e.message : "No se pudo eliminar.");
    }
  }

  const visibles = useMemo(
    () =>
      (mensajes ?? []).filter(
        (m) => !filtro || m.nombre.toLowerCase().includes(filtro) || m.correo.includes(filtro) || m.texto.toLowerCase().includes(filtro),
      ),
    [mensajes, filtro],
  );

  if (error) return <EstadoError mensaje={error} alReintentar={() => void cargar()} />;
  if (mensajes === null) return <EstadoCargando etiqueta="Cargando mensajes…" />;

  return (
    <div>
      <p role="status" aria-live="polite">
        {noLeidos === 0 ? "No tiene mensajes sin leer." : `Tiene ${noLeidos} mensaje(s) sin leer.`}
        <span className="solo-lectores"> {anuncio}</span>
      </p>

      {mensajes.length === 0 ? (
        <EstadoVacio>Aún no ha recibido mensajes.</EstadoVacio>
      ) : (
        <>
          <div className="campo" style={{ maxWidth: "24rem" }}>
            <label htmlFor="buscar-mensajes">Filtrar mensajes cargados</label>
            <input id="buscar-mensajes" type="search" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
          </div>
          {visibles.length === 0 && <EstadoVacio>Ningún mensaje coincide con «{busqueda}».</EstadoVacio>}
          <ul role="list" className="panel-lista">
            {visibles.map((m) => (
              <li key={m.id} className={`panel-fila ${m.leido ? "" : "panel-fila--destacada"}`}>
                <article>
                  <h2 style={{ fontSize: "1.15rem", margin: 0 }}>
                    {m.leido ? "" : "● "}
                    {m.nombre}
                    <span className="solo-lectores">{m.leido ? " (leído)" : " (sin leer)"}</span>
                  </h2>
                  <p className="campo__ayuda">
                    <a href={`mailto:${m.correo}`}>{m.correo}</a> · <time dateTime={m.creadoEn}>{formatoFecha.format(new Date(m.creadoEn))}</time>
                  </p>
                  {/* Texto de usuario: React lo escapa; nunca se inserta como HTML. */}
                  <p style={{ whiteSpace: "pre-wrap" }}>{m.texto}</p>
                </article>
                <div className="panel-acciones">
                  <button type="button" className="boton boton--secundario boton--pequeno" onClick={() => alternarLeido(m)}>
                    {m.leido ? "Marcar no leído" : "Marcar leído"}
                    <span className="solo-lectores"> mensaje de {m.nombre}</span>
                  </button>
                  <button type="button" className="boton boton--peligro boton--pequeno" onClick={() => borrar(m)}>
                    Eliminar<span className="solo-lectores"> mensaje de {m.nombre}</span>
                  </button>
                </div>
              </li>
            ))}
          </ul>
          {cursor && (
            <p style={{ marginTop: "1rem" }}>
              <button type="button" className="boton boton--secundario" onClick={cargarMas}>
                Cargar más mensajes
              </button>
            </p>
          )}
        </>
      )}
    </div>
  );
}
