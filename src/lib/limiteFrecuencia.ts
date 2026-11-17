import { demasiadasSolicitudes } from "@/src/lib/errores";

/**
 * Límite de frecuencia en memoria (ventana deslizante por clave).
 * En Vercel cada instancia tiene su propia memoria: es una defensa básica que se
 * complementa con una regla de rate limiting del Firewall de Vercel.
 */
const registros = new Map<string, number[]>();

export function limitar(clave: string, maximo: number, ventanaMs: number, ahora = Date.now()) {
  const desde = ahora - ventanaMs;
  const marcas = (registros.get(clave) ?? []).filter((t) => t > desde);
  if (marcas.length >= maximo) {
    registros.set(clave, marcas);
    throw demasiadasSolicitudes();
  }
  marcas.push(ahora);
  registros.set(clave, marcas);
  if (registros.size > 10_000) registros.clear(); // evita crecer sin límite
}

export function reiniciarLimites() {
  registros.clear();
}

export function ipDe(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "desconocida"
  );
}
