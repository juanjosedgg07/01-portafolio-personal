import type { ZodError } from "zod";

export type DetalleError = { campo: string; mensaje: string };

/** Error controlado de la API: se convierte en { error, detalles? } con su código HTTP. */
export class ErrorApi extends Error {
  constructor(
    public readonly estado: number,
    mensaje: string,
    public readonly detalles?: DetalleError[],
  ) {
    super(mensaje);
    this.name = "ErrorApi";
  }
}

export const noAutenticado = (m = "Debe iniciar sesión.") => new ErrorApi(401, m);
export const prohibido = (m = "No tiene permiso para esta acción.") => new ErrorApi(403, m);
export const noEncontrado = (m = "Recurso no encontrado.") => new ErrorApi(404, m);
export const conflicto = (m: string) => new ErrorApi(409, m);
export const demasiadasSolicitudes = (m = "Demasiadas solicitudes. Intente más tarde.") =>
  new ErrorApi(429, m);

export function detallesDeZod(error: ZodError): DetalleError[] {
  return error.issues.map((i) => ({
    campo: i.path.length ? i.path.join(".") : "cuerpo",
    mensaje: i.message,
  }));
}

export function errorDeValidacion(error: ZodError) {
  return new ErrorApi(400, "Datos no válidos.", detallesDeZod(error));
}
