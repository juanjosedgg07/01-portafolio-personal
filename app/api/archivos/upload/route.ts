import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { requerirAdmin } from "@/src/lib/auth";
import { ErrorApi, prohibido } from "@/src/lib/errores";
import { manejar } from "@/src/lib/http";
import { limitar } from "@/src/lib/limiteFrecuencia";
import { TAMANO_MAXIMO_IMAGEN, TIPOS_IMAGEN } from "@/src/schemas/comunes";
import { archivosServicio } from "@/src/services/archivosServicio";

export const runtime = "nodejs";

/**
 * POST /api/archivos/upload: emite el token para la subida directa desde el navegador
 * (evita el límite de 4,5 MB de las funciones) y recibe el aviso de Vercel Blob al terminar.
 */
export const POST = manejar(async (request) => {
  let body: HandleUploadBody;
  try {
    body = (await request.json()) as HandleUploadBody;
  } catch {
    throw new ErrorApi(400, "JSON mal formado.");
  }

  // El aviso de Vercel Blob (upload-completed) viene firmado y no trae sesión: lo verifica handleUpload.
  const esAvisoDeBlob = body.type === "blob.upload-completed";
  const usuario = esAvisoDeBlob ? null : await requerirAdmin(request); // (1) sesión → 401/403
  if (usuario) limitar(`subidas:${usuario.uid}`, 20, 60 * 60_000); // cuida la cuota de Blob

  const respuesta = await handleUpload({
    body,
    request,
    onBeforeGenerateToken: async (pathname) => {
      // (2) la ruta debe ser del usuario
      if (!usuario || !archivosServicio.pathnameEsDelUsuario(pathname, usuario.uid)) {
        throw prohibido("Solo puede subir archivos a su propia carpeta.");
      }
      return {
        allowedContentTypes: [...TIPOS_IMAGEN], // (3) tipos y tamaño
        maximumSizeInBytes: TAMANO_MAXIMO_IMAGEN,
        addRandomSuffix: true, // (4) sufijo aleatorio y uid en el payload
        tokenPayload: JSON.stringify({ uid: usuario.uid }),
      };
    },
    // No funciona en local sin túnel: por eso el cliente también avisa a POST /api/archivos.
    onUploadCompleted: async () => {},
  });
  return Response.json(respuesta);
});
