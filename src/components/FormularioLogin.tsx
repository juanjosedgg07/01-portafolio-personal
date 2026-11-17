"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";

const MENSAJES: Record<string, string> = {
  "auth/invalid-credential": "Correo o contraseña incorrectos.",
  "auth/invalid-email": "Escriba un correo válido.",
  "auth/too-many-requests": "Demasiados intentos. Espere unos minutos.",
  "auth/network-request-failed": "No hay conexión. Revise su red.",
  "auth/user-disabled": "Esta cuenta está deshabilitada.",
};

export function FormularioLogin() {
  const router = useRouter();
  const volver = useSearchParams().get("volver");
  const destino = volver?.startsWith("/admin") ? volver : "/admin";
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function entrar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const datos = new FormData(e.currentTarget);
    const correo = String(datos.get("correo") ?? "").trim();
    const clave = String(datos.get("clave") ?? "");
    if (!correo || !clave) {
      setError("Escriba su correo y su contraseña.");
      return;
    }
    setEnviando(true);
    setError("");
    try {
      // El SDK de Firebase se carga solo aquí (no en las páginas públicas).
      const [{ signInWithEmailAndPassword, signOut }, { authCliente }] = await Promise.all([
        import("firebase/auth"),
        import("@/src/lib/firebase/cliente"),
      ]);
      const auth = authCliente();
      const cred = await signInWithEmailAndPassword(auth, correo, clave);
      const idToken = await cred.user.getIdToken();
      const res = await fetch("/api/auth/sesion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      await signOut(auth); // la sesión vive en la cookie HttpOnly
      if (!res.ok) {
        const cuerpo = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(cuerpo.error ?? "No se pudo iniciar la sesión.");
      }
      router.replace(destino);
      router.refresh();
    } catch (err) {
      const codigo = (err as { code?: string }).code;
      setError((codigo && MENSAJES[codigo]) || (err instanceof Error && !codigo ? err.message : "No se pudo iniciar sesión."));
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={entrar} noValidate>
      <div className="campo">
        <label htmlFor="login-correo">Correo electrónico</label>
        <input id="login-correo" name="correo" type="email" autoComplete="username" required inputMode="email" />
      </div>
      <div className="campo">
        <label htmlFor="login-clave">Contraseña</label>
        {/* autocomplete permite usar el gestor de contraseñas y pegar (WCAG 3.3.8) */}
        <input id="login-clave" name="clave" type="password" autoComplete="current-password" required />
      </div>
      <button type="submit" className="boton" disabled={enviando}>
        {enviando ? "Entrando…" : "Entrar"}
      </button>
      <div role="alert" aria-live="assertive" style={{ marginTop: "1rem" }}>
        {error && <p className="aviso aviso--error">{error}</p>}
      </div>
    </form>
  );
}
