"use client";
import { upload } from "@vercel/blob/client";
import { api } from "./clienteApi";
import type { Destino } from "@/src/schemas/comunes";

/** Reduce la imagen en el navegador (canvas) a un máximo de `lado` px y la convierte a WebP. */
export async function reducirImagen(archivo: File, lado = 1600, calidad = 0.85): Promise<Blob> {
  if (!("createImageBitmap" in window)) return archivo;
  const bitmap = await createImageBitmap(archivo);
  const escala = Math.min(1, lado / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * escala);
  canvas.height = Math.round(bitmap.height * escala);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/webp", calidad));
  return blob ?? archivo;
}

/** Sube directo a Vercel Blob (token emitido por la API) y luego registra el archivo en la API. */
export async function subirImagen(archivo: File, uid: string, destino: Destino): Promise<string> {
  const reducida = await reducirImagen(archivo);
  const base = archivo.name.replace(/\.[^.]+$/, "").toLowerCase().replace(/[^a-z0-9-]+/g, "-").slice(0, 40) || "imagen";
  const carpeta = destino.tipo === "perfil" ? "perfil" : `proyectos/${destino.slug}`;
  const pathname = `usuarios/${uid}/${carpeta}/${base}.webp`;
  const resultado = await upload(pathname, reducida, {
    access: "public",
    handleUploadUrl: "/api/archivos/upload",
    contentType: "image/webp",
  });
  await api("/api/archivos", { metodo: "POST", cuerpo: { url: resultado.url, pathname: resultado.pathname, destino } });
  return resultado.url;
}
