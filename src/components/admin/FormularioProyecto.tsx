"use client";
import { useState, type FormEvent } from "react";
import { api, erroresPorCampo } from "@/src/lib/clienteApi";
import { subirImagen } from "@/src/lib/imagenes";
import { esquemaCrearProyecto, type Proyecto } from "@/src/schemas/proyecto";
import { ImagenProyecto } from "@/src/components/ImagenProyecto";

const aSlug = (t: string) =>
  t
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

export function FormularioProyecto({
  proyecto,
  uid,
  alGuardar,
  anunciar,
}: {
  proyecto: Proyecto | null;
  uid: string;
  alGuardar: (p: Proyecto) => void;
  anunciar: (m: string) => void;
}) {
  const editando = proyecto !== null;
  const [titulo, setTitulo] = useState(proyecto?.titulo ?? "");
  const [slug, setSlug] = useState(proyecto?.slug ?? "");
  const [slugTocado, setSlugTocado] = useState(editando);
  const [descripcion, setDescripcion] = useState(proyecto?.descripcion ?? "");
  const [tecnologias, setTecnologias] = useState(proyecto?.tecnologias.join(", ") ?? "");
  const [enlace, setEnlace] = useState(proyecto?.enlace ?? "");
  const [publicado, setPublicado] = useState(proyecto?.publicado ?? true);
  const [imagenes, setImagenes] = useState(proyecto?.imagenes ?? []);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [ocupado, setOcupado] = useState(false);

  async function guardar(e: FormEvent) {
    e.preventDefault();
    const datos = {
      slug: editando ? proyecto.slug : slug,
      titulo,
      descripcion,
      tecnologias: tecnologias.split(",").map((t) => t.trim()).filter(Boolean),
      enlace: enlace.trim() || null,
      publicado,
    };
    const r = esquemaCrearProyecto.safeParse(datos);
    if (!r.success) {
      const errs = Object.fromEntries(r.error.issues.map((i) => [String(i.path[0]), i.message]));
      setErrores(errs);
      anunciar(`El formulario tiene ${Object.keys(errs).length} error(es).`);
      return;
    }
    setOcupado(true);
    setErrores({});
    try {
      const { slug: s, ...cambios } = r.data;
      const res = editando
        ? await api<{ proyecto: Proyecto }>(`/api/proyectos/${s}`, { metodo: "PUT", cuerpo: cambios })
        : await api<{ proyecto: Proyecto }>("/api/proyectos", { metodo: "POST", cuerpo: r.data });
      anunciar(editando ? "Proyecto actualizado." : "Proyecto creado. Ya puede agregarle capturas.");
      alGuardar({ ...res.proyecto, imagenes });
    } catch (err) {
      const errs = erroresPorCampo(err);
      if (err instanceof Error && "estado" in err && err.estado === 409) errs.slug = err.message;
      setErrores(errs);
      anunciar(err instanceof Error ? err.message : "No se pudo guardar.");
    } finally {
      setOcupado(false);
    }
  }

  async function agregarCaptura(e: React.ChangeEvent<HTMLInputElement>) {
    const archivos = [...(e.target.files ?? [])];
    e.target.value = "";
    if (!proyecto || archivos.length === 0) return;
    setOcupado(true);
    for (const archivo of archivos.slice(0, 5)) {
      try {
        const url = await subirImagen(archivo, uid, { tipo: "proyecto", slug: proyecto.slug });
        setImagenes((i) => [...i, url]);
        anunciar(`Captura «${archivo.name}» agregada.`);
      } catch (err) {
        anunciar(`No se pudo subir «${archivo.name}»: ${err instanceof Error ? err.message : "error"}`);
      }
    }
    setOcupado(false);
  }

  async function quitarCaptura(url: string) {
    if (!proyecto) return;
    setOcupado(true);
    try {
      if (url.startsWith("https://")) {
        await api("/api/archivos", { metodo: "DELETE", cuerpo: { url, destino: { tipo: "proyecto", slug: proyecto.slug } } });
      }
      setImagenes((i) => i.filter((x) => x !== url));
      anunciar("Captura eliminada.");
    } catch (err) {
      anunciar(err instanceof Error ? `No se pudo eliminar: ${err.message}` : "No se pudo eliminar.");
    } finally {
      setOcupado(false);
    }
  }

  const error = (c: string) =>
    errores[c] ? (
      <p id={`proyecto-${c}-error`} className="campo__error">
        {errores[c]}
      </p>
    ) : null;
  const aria = (c: string, ayuda?: string) => ({
    "aria-invalid": errores[c] ? (true as const) : undefined,
    "aria-describedby": [ayuda, errores[c] ? `proyecto-${c}-error` : ""].filter(Boolean).join(" ") || undefined,
  });

  return (
    <form onSubmit={guardar} noValidate>
      <div className="campo">
        <label htmlFor="proyecto-titulo">Título</label>
        <input
          id="proyecto-titulo"
          value={titulo}
          onChange={(e) => {
            setTitulo(e.target.value);
            if (!slugTocado) setSlug(aSlug(e.target.value));
          }}
          {...aria("titulo")}
        />
        {error("titulo")}
      </div>
      <div className="campo">
        <label htmlFor="proyecto-slug">Slug (dirección)</label>
        <input
          id="proyecto-slug"
          value={slug}
          readOnly={editando}
          onChange={(e) => {
            setSlugTocado(true);
            setSlug(e.target.value);
          }}
          {...aria("slug", "proyecto-slug-ayuda")}
        />
        <p id="proyecto-slug-ayuda" className="campo__ayuda">
          {editando ? "El slug no se puede cambiar." : "Minúsculas, números y guiones. Será /proyectos/" + (slug || "…")}
        </p>
        {error("slug")}
      </div>
      <div className="campo">
        <label htmlFor="proyecto-descripcion">Descripción</label>
        <textarea id="proyecto-descripcion" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} {...aria("descripcion")} />
        {error("descripcion")}
      </div>
      <div className="dos-columnas">
        <div className="campo">
          <label htmlFor="proyecto-tecnologias">Tecnologías (separadas por comas)</label>
          <input id="proyecto-tecnologias" value={tecnologias} onChange={(e) => setTecnologias(e.target.value)} {...aria("tecnologias")} />
          {error("tecnologias")}
        </div>
        <div className="campo">
          <label htmlFor="proyecto-enlace">Enlace (opcional)</label>
          <input id="proyecto-enlace" type="url" value={enlace} onChange={(e) => setEnlace(e.target.value)} {...aria("enlace")} placeholder="https://…" />
          {error("enlace")}
        </div>
      </div>
      <div className="campo" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <input id="proyecto-publicado" type="checkbox" checked={publicado} onChange={(e) => setPublicado(e.target.checked)} style={{ width: "1.5rem", minHeight: "1.5rem" }} />
        <label htmlFor="proyecto-publicado">Publicado (visible para los visitantes)</label>
      </div>

      {editando && (
        <fieldset>
          <legend>Capturas</legend>
          {imagenes.length === 0 ? (
            <p className="campo__ayuda">Sin capturas todavía.</p>
          ) : (
            <ul role="list" className="miniaturas">
              {imagenes.map((url, i) => (
                <li key={url}>
                  <figure>
                    <ImagenProyecto src={url} alt={`Captura ${i + 1}`} sizes="8rem" />
                    <button type="button" className="boton boton--peligro boton--pequeno" onClick={() => quitarCaptura(url)} disabled={ocupado}>
                      Quitar<span className="solo-lectores"> captura {i + 1}</span>
                    </button>
                  </figure>
                </li>
              ))}
            </ul>
          )}
          <div className="campo" style={{ marginTop: "1rem" }}>
            <label htmlFor="proyecto-capturas">Agregar capturas (hasta 5 a la vez)</label>
            <input id="proyecto-capturas" type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif" onChange={agregarCaptura} disabled={ocupado} />
          </div>
        </fieldset>
      )}

      <button type="submit" className="boton" disabled={ocupado}>
        {ocupado ? "Guardando…" : editando ? "Guardar cambios" : "Crear proyecto"}
      </button>
    </form>
  );
}
