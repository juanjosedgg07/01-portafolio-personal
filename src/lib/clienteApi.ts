/** fetch a la API propia (mismo origen) con errores tipados { error, detalles }. */
export class ErrorCliente extends Error {
  constructor(
    public estado: number,
    mensaje: string,
    public detalles: { campo: string; mensaje: string }[] = [],
  ) {
    super(mensaje);
  }
}

export async function api<T>(ruta: string, opciones: { metodo?: string; cuerpo?: unknown } = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(ruta, {
      method: opciones.metodo ?? "GET",
      headers: opciones.cuerpo !== undefined ? { "Content-Type": "application/json" } : undefined,
      body: opciones.cuerpo !== undefined ? JSON.stringify(opciones.cuerpo) : undefined,
      cache: "no-store",
    });
  } catch {
    throw new ErrorCliente(0, "No hay conexión con el servidor.");
  }
  if (res.status === 401) {
    throw new ErrorCliente(401, "Su sesión venció. Recargue la página e inicie sesión de nuevo.");
  }
  if (res.status === 204) return undefined as T;
  const datos = await res.json().catch(() => ({}));
  if (!res.ok) throw new ErrorCliente(res.status, datos.error ?? "Error inesperado.", datos.detalles);
  return datos as T;
}

/** Convierte detalles de la API en un mapa campo → mensaje. */
export function erroresPorCampo(e: unknown): Record<string, string> {
  if (!(e instanceof ErrorCliente)) return {};
  return Object.fromEntries(e.detalles.map((d) => [d.campo, d.mensaje]));
}
