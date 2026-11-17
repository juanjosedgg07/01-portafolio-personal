import "server-only";
import { mensajesRepositorio } from "@/src/repositories/mensajesRepositorio";
import type { EntradaMensaje, Mensaje } from "@/src/schemas/mensaje";

export type ResultadoEnvio = { guardado: boolean; mensaje?: Mensaje };

export const mensajesServicio = {
  /**
   * Si el campo trampa trae texto es un bot: se responde igual que un éxito
   * (para no darle pistas) pero no se guarda nada.
   */
  async recibir(entrada: EntradaMensaje, ahora = new Date()): Promise<ResultadoEnvio> {
    if (entrada.sitioWeb && entrada.sitioWeb.trim() !== "") return { guardado: false };
    const mensaje = await mensajesRepositorio.crear({
      nombre: entrada.nombre,
      correo: entrada.correo,
      texto: entrada.texto,
      creadoEn: ahora.toISOString(),
      leido: false,
    });
    return { guardado: true, mensaje };
  },

  async listar(limite: number, cursor?: string) {
    const [pagina, noLeidos] = await Promise.all([
      mensajesRepositorio.listar(limite, cursor),
      mensajesRepositorio.contarNoLeidos(),
    ]);
    return { ...pagina, noLeidos };
  },

  marcarLeido(id: string, leido: boolean) {
    return mensajesRepositorio.marcarLeido(id, leido);
  },

  eliminar(id: string) {
    return mensajesRepositorio.eliminar(id);
  },
};
