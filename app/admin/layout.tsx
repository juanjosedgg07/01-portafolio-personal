import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { usuarioActual } from "@/src/lib/auth";
import { firebaseConfigurado } from "@/src/lib/firebase/admin";
import { CerrarSesion } from "@/src/components/admin/CerrarSesion";
import { NavAdmin } from "@/src/components/admin/NavAdmin";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { robots: { index: false, follow: false } };

/** Verificación real (no solo proxy.ts): cookie verificada con el Admin SDK y rol admin. */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!firebaseConfigurado()) {
    return (
      <section className="contenedor seccion">
        <h1>Panel no disponible</h1>
        <p>Firebase no está configurado en este entorno. Revise las variables de entorno del servidor.</p>
      </section>
    );
  }
  const usuario = await usuarioActual();
  if (!usuario) redirect("/login?volver=/admin");
  if (usuario.rol !== "admin") {
    return (
      <section className="contenedor seccion">
        <h1>Acceso denegado</h1>
        <p>Su cuenta ({usuario.correo}) no tiene permiso para editar este portafolio.</p>
        <CerrarSesion />
      </section>
    );
  }
  return (
    <div className="contenedor seccion">
      <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <NavAdmin />
        <p className="campo__ayuda" style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap", margin: 0 }}>
          {usuario.correo} <CerrarSesion />
        </p>
      </div>
      {children}
    </div>
  );
}
