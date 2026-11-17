import { z } from "zod";

/** Reglas del formulario de contacto: se usan en el cliente y en la API (el servidor decide). */
export const esquemaMensaje = z.strictObject({
  nombre: z
    .string({ error: "El nombre es obligatorio." })
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres.")
    .max(80, "El nombre debe tener como máximo 80 caracteres."),
  correo: z
    .string({ error: "El correo es obligatorio." })
    .trim()
    .toLowerCase()
    .pipe(z.email("Escriba un correo válido, por ejemplo nombre@dominio.com.")),
  texto: z
    .string({ error: "El mensaje es obligatorio." })
    .trim()
    .min(10, "El mensaje debe tener al menos 10 caracteres.")
    .max(1000, "El mensaje debe tener como máximo 1000 caracteres."),
  /** Campo trampa (honeypot): las personas no lo ven; si llega con texto, es un bot. */
  sitioWeb: z.string().max(200).optional(),
});

export type EntradaMensaje = z.infer<typeof esquemaMensaje>;

export type Mensaje = {
  id: string;
  nombre: string;
  correo: string;
  texto: string;
  creadoEn: string;
  leido: boolean;
};

export const esquemaActualizarMensaje = z.strictObject({ leido: z.boolean() });
