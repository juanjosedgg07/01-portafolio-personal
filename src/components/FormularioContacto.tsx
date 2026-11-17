"use client";
import { useRef, useState, type FormEvent } from "react";
import { esquemaMensaje } from "@/src/schemas/mensaje";

type Campo = "nombre" | "correo" | "texto";
type Errores = Partial<Record<Campo, string>>;
type Estado = { tipo: "inicial" } | { tipo: "enviando" } | { tipo: "exito" } | { tipo: "error"; mensaje: string };

const VACIO = { nombre: "", correo: "", texto: "", sitioWeb: "" };

export function FormularioContacto() {
  const [valores, setValores] = useState(VACIO);
  const [errores, setErrores] = useState<Errores>({});
  const [estado, setEstado] = useState<Estado>({ tipo: "inicial" });
  const formulario = useRef<HTMLFormElement>(null);

  function cambiar(campo: keyof typeof VACIO, valor: string) {
    setValores((v) => ({ ...v, [campo]: valor }));
    if (campo !== "sitioWeb" && errores[campo]) setErrores((e) => ({ ...e, [campo]: undefined }));
  }

  function enfocarPrimerError(errs: Errores) {
    const primero = (["nombre", "correo", "texto"] as const).find((c) => errs[c]);
    if (primero) formulario.current?.querySelector<HTMLElement>(`[name="${primero}"]`)?.focus();
  }

  async function enviar(e: FormEvent) {
    e.preventDefault();
    const r = esquemaMensaje.safeParse(valores);
    if (!r.success) {
      const errs: Errores = {};
      for (const i of r.error.issues) {
        const campo = i.path[0] as Campo;
        errs[campo] ??= i.message;
      }
      setErrores(errs);
      setEstado({ tipo: "inicial" });
      enfocarPrimerError(errs);
      return;
    }

    setEstado({ tipo: "enviando" });
    try {
      const res = await fetch("/api/mensajes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(r.data),
      });
      if (res.status === 201) {
        setValores(VACIO);
        setErrores({});
        setEstado({ tipo: "exito" });
        return;
      }
      const cuerpo = (await res.json().catch(() => ({}))) as {
        error?: string;
        detalles?: { campo: string; mensaje: string }[];
      };
      if (res.status === 400 && cuerpo.detalles) {
        const errs: Errores = {};
        for (const d of cuerpo.detalles) errs[d.campo as Campo] ??= d.mensaje;
        setErrores(errs);
        enfocarPrimerError(errs);
      }
      setEstado({
        tipo: "error",
        mensaje:
          res.status === 429
            ? "Ha enviado demasiados mensajes. Espere unos minutos e inténtelo de nuevo."
            : (cuerpo.error ?? "No se pudo enviar el mensaje."),
      });
    } catch {
      setEstado({ tipo: "error", mensaje: "No hay conexión. Revise su red e inténtelo de nuevo." });
    }
  }

  const props = (campo: Campo) => ({
    id: `contacto-${campo}`,
    name: campo,
    value: valores[campo],
    "aria-invalid": errores[campo] ? (true as const) : undefined,
    "aria-describedby": [`ayuda-${campo}`, errores[campo] ? `error-${campo}` : ""].filter(Boolean).join(" "),
    onChange: (e: { target: { value: string } }) => cambiar(campo, e.target.value),
  });

  const enviando = estado.tipo === "enviando";

  return (
    <form ref={formulario} onSubmit={enviar} noValidate aria-describedby="nota-obligatorios">
      <p id="nota-obligatorios" className="campo__ayuda">
        Todos los campos son obligatorios.
      </p>

      <div className="campo">
        <label htmlFor="contacto-nombre">Nombre</label>
        <input {...props("nombre")} type="text" autoComplete="name" required minLength={2} maxLength={80} />
        <p id="ayuda-nombre" className="campo__ayuda">
          Entre 2 y 80 caracteres.
        </p>
        {errores.nombre && (
          <p id="error-nombre" className="campo__error">
            {errores.nombre}
          </p>
        )}
      </div>

      <div className="campo">
        <label htmlFor="contacto-correo">Correo electrónico</label>
        <input {...props("correo")} type="email" autoComplete="email" inputMode="email" required />
        <p id="ayuda-correo" className="campo__ayuda">
          Solo lo uso para responderle.
        </p>
        {errores.correo && (
          <p id="error-correo" className="campo__error">
            {errores.correo}
          </p>
        )}
      </div>

      <div className="campo">
        <label htmlFor="contacto-texto">Mensaje</label>
        <textarea {...props("texto")} required minLength={10} maxLength={1000} />
        <p id="ayuda-texto" className="campo__ayuda">
          Entre 10 y 1000 caracteres ({valores.texto.length}/1000).
        </p>
        {errores.texto && (
          <p id="error-texto" className="campo__error">
            {errores.texto}
          </p>
        )}
      </div>

      {/* Campo trampa: oculto para personas y lectores de pantalla; los bots lo llenan. */}
      <div className="trampa" aria-hidden="true">
        <label htmlFor="contacto-sitio">No llene este campo</label>
        <input
          id="contacto-sitio"
          name="sitioWeb"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={valores.sitioWeb}
          onChange={(e) => cambiar("sitioWeb", e.target.value)}
        />
      </div>

      <button type="submit" className="boton" disabled={enviando} aria-disabled={enviando}>
        {enviando ? "Enviando…" : "Enviar mensaje"}
      </button>

      {/* Región viva: anuncia errores, éxito y fallos a lectores de pantalla. */}
      <div role="status" aria-live="polite" style={{ marginTop: "1.25rem" }}>
        {Object.values(errores).some(Boolean) && (
          <p className="aviso aviso--error">
            Revise el formulario: hay {Object.values(errores).filter(Boolean).length} campo(s) con errores.
          </p>
        )}
        {estado.tipo === "exito" && (
          <p className="aviso aviso--exito">✓ ¡Gracias! Su mensaje fue enviado. Le responderé pronto.</p>
        )}
        {estado.tipo === "error" && (
          <div className="aviso aviso--error">
            <p>{estado.mensaje}</p>
            <button type="submit" className="boton boton--secundario boton--pequeno">
              Reintentar
            </button>
          </div>
        )}
      </div>
    </form>
  );
}
