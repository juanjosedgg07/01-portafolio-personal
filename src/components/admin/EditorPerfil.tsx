"use client";
import Image from "next/image";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { api, ErrorCliente, erroresPorCampo } from "@/src/lib/clienteApi";
import { subirImagen } from "@/src/lib/imagenes";
import { esquemaPerfil, type Perfil } from "@/src/schemas/perfil";
import { EstadoCargando, EstadoError } from "@/src/components/Estados";

type Formulario = {
  nombre: string;
  titular: string;
  bio: string;
  correo: string;
  habilidades: string;
  github: string;
  linkedin: string;
  sitio: string;
};

const aFormulario = (p: Perfil): Formulario => ({
  nombre: p.nombre,
  titular: p.titular,
  bio: p.bio,
  correo: p.correo,
  habilidades: p.habilidades.join(", "),
  github: p.enlaces.github ?? "",
  linkedin: p.enlaces.linkedin ?? "",
  sitio: p.enlaces.sitio ?? "",
});

const VACIO: Formulario = { nombre: "", titular: "", bio: "", correo: "", habilidades: "", github: "", linkedin: "", sitio: "" };

export function EditorPerfil({ uid, anunciar }: { uid: string; anunciar: (m: string) => void }) {
  const [form, setForm] = useState<Formulario | null>(null);
  const [foto, setFoto] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [guardando, setGuardando] = useState(false);
  const [subiendo, setSubiendo] = useState(false);

  const cargar = useCallback(async () => {
    setError("");
    try {
      const { perfil } = await api<{ perfil: Perfil }>("/api/perfil");
      setForm(aFormulario(perfil));
      setFoto(perfil.fotoUrl);
    } catch (e) {
      if (e instanceof ErrorCliente && e.estado === 404) setForm(VACIO);
      else setError(e instanceof Error ? e.message : "No se pudo cargar el perfil.");
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial de datos
    void cargar();
  }, [cargar]);

  if (error) return <EstadoError mensaje={error} alReintentar={cargar} />;
  if (!form) return <EstadoCargando etiqueta="Cargando perfil…" />;

  const cambiar = (campo: keyof Formulario) => (e: { target: { value: string } }) =>
    setForm((f) => (f ? { ...f, [campo]: e.target.value } : f));

  async function guardar(e: FormEvent) {
    e.preventDefault();
    if (!form) return;
    const datos = {
      nombre: form.nombre,
      titular: form.titular,
      bio: form.bio,
      correo: form.correo,
      habilidades: form.habilidades.split(",").map((h) => h.trim()).filter(Boolean),
      enlaces: { github: form.github, linkedin: form.linkedin, sitio: form.sitio },
    };
    const r = esquemaPerfil.safeParse(datos);
    if (!r.success) {
      setErrores(Object.fromEntries(r.error.issues.map((i) => [i.path.join("."), i.message])));
      anunciar("El perfil tiene errores. Revise los campos marcados.");
      return;
    }
    setGuardando(true);
    setErrores({});
    try {
      await api("/api/perfil", { metodo: "PUT", cuerpo: r.data });
      anunciar("Perfil guardado.");
    } catch (err) {
      setErrores(erroresPorCampo(err));
      anunciar(err instanceof Error ? `No se guardó: ${err.message}` : "No se guardó el perfil.");
    } finally {
      setGuardando(false);
    }
  }

  async function cambiarFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0];
    e.target.value = "";
    if (!archivo) return;
    if (!archivo.type.startsWith("image/")) {
      anunciar("El archivo debe ser una imagen.");
      return;
    }
    setSubiendo(true);
    try {
      setFoto(await subirImagen(archivo, uid, { tipo: "perfil" }));
      anunciar("Foto de perfil actualizada.");
    } catch (err) {
      anunciar(err instanceof Error ? `No se pudo subir la foto: ${err.message}` : "No se pudo subir la foto.");
    } finally {
      setSubiendo(false);
    }
  }

  const campo = (id: keyof Formulario, etiqueta: string, extra: React.InputHTMLAttributes<HTMLInputElement> = {}, clave: string = id) => (
    <div className="campo">
      <label htmlFor={`perfil-${id}`}>{etiqueta}</label>
      <input
        id={`perfil-${id}`}
        value={form[id]}
        onChange={cambiar(id)}
        aria-invalid={errores[clave] ? true : undefined}
        aria-describedby={errores[clave] ? `perfil-${id}-error` : undefined}
        {...extra}
      />
      {errores[clave] && (
        <p id={`perfil-${id}-error`} className="campo__error">
          {errores[clave]}
        </p>
      )}
    </div>
  );

  return (
    <form onSubmit={guardar} noValidate>
      <fieldset>
        <legend>Foto de perfil</legend>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "center" }}>
          {foto ? (
            <Image src={foto} alt="Foto de perfil actual" width={96} height={96} style={{ borderRadius: "50%", objectFit: "cover" }} />
          ) : (
            <p className="campo__ayuda">Sin foto todavía.</p>
          )}
          <div className="campo" style={{ margin: 0 }}>
            <label htmlFor="perfil-foto">{subiendo ? "Subiendo…" : "Subir una foto nueva"}</label>
            <input id="perfil-foto" type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={cambiarFoto} disabled={subiendo} aria-describedby="perfil-foto-ayuda" />
            <p id="perfil-foto-ayuda" className="campo__ayuda">
              JPG, PNG, WebP o AVIF. Se reduce en su navegador antes de subirla.
            </p>
          </div>
        </div>
      </fieldset>

      <fieldset>
        <legend>Datos personales</legend>
        <div className="dos-columnas">
          {campo("nombre", "Nombre", { autoComplete: "name" })}
          {campo("correo", "Correo público", { type: "email", autoComplete: "email" })}
        </div>
        {campo("titular", "Titular")}
        <div className="campo">
          <label htmlFor="perfil-bio">Biografía</label>
          <textarea id="perfil-bio" value={form.bio} onChange={cambiar("bio")} aria-invalid={errores.bio ? true : undefined} aria-describedby={errores.bio ? "perfil-bio-error" : undefined} />
          {errores.bio && (
            <p id="perfil-bio-error" className="campo__error">
              {errores.bio}
            </p>
          )}
        </div>
        {campo("habilidades", "Habilidades (separadas por comas)")}
      </fieldset>

      <fieldset>
        <legend>Enlaces</legend>
        <div className="dos-columnas">
          {campo("github", "GitHub", { type: "url", placeholder: "https://github.com/usuario" }, "enlaces.github")}
          {campo("linkedin", "LinkedIn", { type: "url" }, "enlaces.linkedin")}
          {campo("sitio", "Sitio web", { type: "url" }, "enlaces.sitio")}
        </div>
      </fieldset>

      <button type="submit" className="boton" disabled={guardando}>
        {guardando ? "Guardando…" : "Guardar perfil"}
      </button>
    </form>
  );
}
