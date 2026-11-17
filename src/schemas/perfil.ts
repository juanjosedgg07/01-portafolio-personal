import { z } from "zod";

const urlOpcional = z
  .union([z.url({ protocol: /^https?$/, error: "Escriba una URL válida (https://…)." }), z.literal("")])
  .optional();

export const esquemaPerfil = z.strictObject({
  nombre: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres.").max(80),
  titular: z.string().trim().min(2, "El titular debe tener al menos 2 caracteres.").max(120),
  bio: z.string().trim().min(10, "La biografía debe tener al menos 10 caracteres.").max(1500),
  correo: z.string().trim().pipe(z.email("Escriba un correo válido.")),
  habilidades: z.array(z.string().trim().min(1).max(40)).max(40),
  enlaces: z.strictObject({
    github: urlOpcional,
    linkedin: urlOpcional,
    sitio: urlOpcional,
  }),
});

export type EntradaPerfil = z.infer<typeof esquemaPerfil>;
export type Perfil = EntradaPerfil & { fotoUrl: string | null };
