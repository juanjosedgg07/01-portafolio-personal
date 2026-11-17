import type { Metadata } from "next";
import { FormularioContacto } from "@/src/components/FormularioContacto";
import { CopiarCorreo } from "@/src/components/CopiarCorreo";
import { perfilServicio } from "@/src/services/perfilServicio";

export const revalidate = 60;
export const metadata: Metadata = {
  title: "Contacto",
  description: "Escríbame un mensaje: respondo a propuestas de trabajo, colaboración y preguntas.",
  alternates: { canonical: "/contacto" },
};

export default async function Contacto() {
  const perfil = await perfilServicio.obtenerOpcional();
  return (
    <section className="contenedor seccion" aria-labelledby="titulo-contacto">
      <div style={{ maxWidth: "40rem" }}>
        <h1 id="titulo-contacto">Contacto</h1>
        <p>¿Tiene una propuesta o una pregunta? Escríbame y le responderé lo antes posible.</p>
        {perfil?.correo && <CopiarCorreo correo={perfil.correo} />}
        <FormularioContacto />
      </div>
    </section>
  );
}
