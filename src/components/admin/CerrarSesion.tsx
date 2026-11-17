"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function CerrarSesion() {
  const router = useRouter();
  const [saliendo, setSaliendo] = useState(false);
  async function salir() {
    setSaliendo(true);
    await fetch("/api/auth/sesion", { method: "DELETE" }).catch(() => undefined);
    router.replace("/login");
    router.refresh();
  }
  return (
    <button type="button" className="boton boton--secundario boton--pequeno" onClick={salir} disabled={saliendo}>
      {saliendo ? "Saliendo…" : "Cerrar sesión"}
    </button>
  );
}
