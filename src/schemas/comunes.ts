import { z } from "zod";
import { esquemaSlug } from "./proyecto";

export const esquemaSesion = z.strictObject({ idToken: z.string().min(20).max(5000) });

export const esquemaPaginacion = z.object({
  limite: z.coerce.number().int().min(1).max(100).default(20),
  cursor: z.string().min(1).max(200).optional(),
});

export type Pagina<T> = { items: T[]; siguienteCursor: string | null };

/** Destino de un archivo subido a Blob. */
export const esquemaDestino = z.discriminatedUnion("tipo", [
  z.strictObject({ tipo: z.literal("perfil") }),
  z.strictObject({ tipo: z.literal("proyecto"), slug: esquemaSlug }),
]);

export const esquemaRegistrarArchivo = z.strictObject({
  url: z.url({ protocol: /^https$/ }),
  pathname: z.string().min(1).max(300),
  destino: esquemaDestino,
});

export const esquemaBorrarArchivo = z.strictObject({
  url: z.url({ protocol: /^https$/ }),
  destino: esquemaDestino,
});

export type Destino = z.infer<typeof esquemaDestino>;

export const TIPOS_IMAGEN = ["image/jpeg", "image/png", "image/webp", "image/avif"] as const;
export const TAMANO_MAXIMO_IMAGEN = 2 * 1024 * 1024; // 2 MB (tras reducirla en el navegador)
