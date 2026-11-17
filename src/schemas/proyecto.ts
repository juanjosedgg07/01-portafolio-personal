import { z } from "zod";

export const esquemaSlug = z
  .string()
  .min(2, "El slug debe tener al menos 2 caracteres.")
  .max(60, "El slug debe tener como máximo 60 caracteres.")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use solo minúsculas, números y guiones, sin espacios.")
  .refine((s) => s !== "orden", "Ese slug está reservado.");

const urlHttps = z.url({ protocol: /^https?$/, error: "Escriba una URL válida (https://…)." });

export const esquemaDatosProyecto = z.strictObject({
  titulo: z.string().trim().min(2, "El título debe tener al menos 2 caracteres.").max(100),
  descripcion: z.string().trim().min(10, "La descripción debe tener al menos 10 caracteres.").max(2000),
  tecnologias: z.array(z.string().trim().min(1).max(40)).max(20).default([]),
  enlace: urlHttps.nullable().default(null),
  publicado: z.boolean().default(true),
});

/** Crear: el slug es el id del documento (único por construcción). */
export const esquemaCrearProyecto = esquemaDatosProyecto.extend({ slug: esquemaSlug });

/** Editar: todos los campos opcionales; el slug y las imágenes no se editan aquí. */
export const esquemaEditarProyecto = esquemaDatosProyecto.partial().refine(
  (d) => Object.keys(d).length > 0,
  "Envíe al menos un campo para actualizar.",
);

export const esquemaOrden = z.strictObject({
  slugs: z.array(esquemaSlug).min(1).max(100),
});

export const esquemaListaProyectos = z.object({
  limite: z.coerce.number().int().min(1).max(100).default(20),
  cursor: esquemaSlug.optional(),
  todos: z.enum(["0", "1"]).optional(),
});

export type EntradaProyecto = z.infer<typeof esquemaCrearProyecto>;
export type CambiosProyecto = z.infer<typeof esquemaEditarProyecto>;

export type Proyecto = {
  slug: string;
  titulo: string;
  descripcion: string;
  tecnologias: string[];
  imagenes: string[];
  enlace: string | null;
  orden: number;
  publicado: boolean;
};
