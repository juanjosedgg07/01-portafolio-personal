import "server-only";
import ejemplo from "@/datos/ejemplo.json";
import type { Perfil } from "@/src/schemas/perfil";
import type { Proyecto } from "@/src/schemas/proyecto";
import type { Mensaje } from "@/src/schemas/mensaje";

/**
 * Almacén en memoria con los datos de ejemplo. Se usa cuando no hay credenciales
 * de Firebase (desarrollo local sin configurar, compilación de vista previa).
 */
export const memoria = {
  perfil: structuredClone(ejemplo.perfil) as Perfil,
  proyectos: new Map<string, Proyecto>(ejemplo.proyectos.map((p) => [p.slug, structuredClone(p) as Proyecto])),
  mensajes: new Map<string, Mensaje>(),
};
