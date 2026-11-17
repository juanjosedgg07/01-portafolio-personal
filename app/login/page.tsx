import type { Metadata } from "next";
import { Suspense } from "react";
import { FormularioLogin } from "@/src/components/FormularioLogin";

export const metadata: Metadata = { title: "Iniciar sesión", robots: { index: false } };

export default function Login() {
  return (
    <section className="contenedor seccion" aria-labelledby="titulo-login">
      <div style={{ maxWidth: "28rem" }}>
        <h1 id="titulo-login">Iniciar sesión</h1>
        <p>Acceso al panel privado del portafolio.</p>
        <Suspense>
          <FormularioLogin />
        </Suspense>
      </div>
    </section>
  );
}
