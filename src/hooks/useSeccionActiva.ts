"use client";
import { useEffect, useState } from "react";

/** Marca qué sección está en pantalla con IntersectionObserver. Sin soporte: null (ningún enlace marcado). */
export function useSeccionActiva(ids: readonly string[]): string | null {
  const [activa, setActiva] = useState<string | null>(null);
  const clave = ids.join(",");

  useEffect(() => {
    const lista = clave ? clave.split(",") : [];
    if (lista.length === 0 || !("IntersectionObserver" in window)) return;
    const obs = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) if (e.isIntersecting) setActiva(e.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    for (const id of lista) {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    }
    return () => obs.disconnect();
  }, [clave]);

  return activa;
}
