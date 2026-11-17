import Image from "next/image";

/** next/image con dimensiones fijas (evita CLS) y `sizes` por breakpoint. Los SVG locales de ejemplo no se optimizan. */
export function ImagenProyecto({
  src,
  alt,
  prioridad = false,
  sizes = "(min-width: 64rem) 33vw, (min-width: 48rem) 50vw, 100vw",
}: {
  src: string;
  alt: string;
  prioridad?: boolean;
  sizes?: string;
}) {
  return (
    <Image
      src={src}
      alt={alt}
      width={1200}
      height={750}
      sizes={sizes}
      priority={prioridad}
      unoptimized={src.endsWith(".svg")}
      style={{ width: "100%", height: "auto", aspectRatio: "16 / 10", objectFit: "cover", display: "block" }}
    />
  );
}
