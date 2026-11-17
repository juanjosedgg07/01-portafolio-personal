import type { Metadata } from "next";
import { Clock, Mail, MessageSquare, ShieldCheck } from "lucide-react";
import { FormularioContacto } from "@/src/components/FormularioContacto";
import { CopiarCorreo } from "@/src/components/CopiarCorreo";
import { perfilServicio } from "@/src/services/perfilServicio";
import estilos from "./contacto.module.css";

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
      <p className="antetitulo">Contacto</p>
      <h1 id="titulo-contacto">Hablemos</h1>
      <p className={estilos.intro}>¿Tiene una propuesta, una pregunta o un proyecto en mente? Escríbame y le responderé lo antes posible.</p>

      <div className={estilos.rejilla}>
        <aside className={estilos.info} aria-label="Otras formas de contacto">
          {perfil?.correo && (
            <div className={estilos.tarjeta}>
              <span className={estilos.icono} aria-hidden="true">
                <Mail size={22} />
              </span>
              <div>
                <h2 className={estilos.tituloTarjeta}>Correo</h2>
                <CopiarCorreo correo={perfil.correo} />
              </div>
            </div>
          )}
          <div className={estilos.tarjeta}>
            <span className={estilos.icono} aria-hidden="true">
              <Clock size={22} />
            </span>
            <div>
              <h2 className={estilos.tituloTarjeta}>Tiempo de respuesta</h2>
              <p>Normalmente respondo en uno o dos días hábiles.</p>
            </div>
          </div>
          <div className={estilos.tarjeta}>
            <span className={estilos.icono} aria-hidden="true">
              <ShieldCheck size={22} />
            </span>
            <div>
              <h2 className={estilos.tituloTarjeta}>Privacidad</h2>
              <p>Su correo solo se usa para responderle. No se comparte ni se publica.</p>
            </div>
          </div>
        </aside>

        <div className={estilos.formulario}>
          <h2 className={estilos.tituloFormulario}>
            <MessageSquare aria-hidden="true" size={22} /> Envíeme un mensaje
          </h2>
          <FormularioContacto />
        </div>
      </div>
    </section>
  );
}
